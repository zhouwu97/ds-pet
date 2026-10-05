import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, validateSettings, foldUsage, summarize, periodStart, chooseTopic, reportText } from '../src/core.mjs';

const now = Date.UTC(2026, 9, 5, 8);
const settings = () => validateSettings({ ...DEFAULT_SETTINGS, scope: 'all', rates: { 'deepseek/model': { input: 2, cached: 0.2, output: 3, cacheWrite: 2 } } });
const usage = { inputTokens: 100, cacheReadTokens: 200, cacheWriteTokens: 50, outputTokens: 80, reasoningTokens: 40, totalTokens: 430 };
const event = (u = usage) => ({ type: 'assistant/message', time: now, data: { message: { source: { provider: 'deepseek', model: 'model' } }, usage: u } });
const state = (status = 'ready') => { const s = settings(), u = summarize(foldUsage({ events: [event()] }), s, now, 28800); return { settings: s, summary: u, month: u, balance: { status: 'unavailable' }, usageStatus: status }; };

test('cache is separate from ordinary input and reasoning is already part of output', () => {
  const u = state().summary;
  assert.equal(u.total, 430); assert.equal(u.input, 100); assert.equal(u.output, 80);
  assert.equal(u.estimatedCost, 0.00058); assert.equal(u.costComplete, true);
});
test('fork inherited events are excluded; last streaming usage is a snapshot, not a delta', () => {
  const retry = { type: 'assistant/attempt', time: now, data: { stream: [
    { type: 'chunk', chunk: { type: 'usage', usage: { inputTokens: 10, outputTokens: 5 } } },
    { type: 'chunk', chunk: { type: 'usage', usage: { inputTokens: 10, outputTokens: 15 } } },
  ] } };
  const folded = foldUsage({ inheritedEventCount: 1, events: [event(), { type: 'request/header', data: { config: { provider: 'deepseek', model: 'model' } } }, retry, event()] });
  assert.equal(folded.length, 2); assert.equal(folded[0].total, 25); assert.equal(folded[0].route, 'deepseek/model');
});
test('final usage overrides streamed samples', () => {
  const e = event(); e.data.stream = [{ type: 'chunk', chunk: { type: 'usage', usage: { inputTokens: 1, outputTokens: 1 } } }];
  assert.equal(foldUsage({ events: [e] })[0].total, 430);
});
test('missing prices and unknown buckets invalidate cost; bad usage is not zero', () => {
  const records = foldUsage({ events: [event({ ...usage, totalTokens: 500 }), event(undefined), event({ inputTokens: -1, outputTokens: 1 })] });
  assert.equal(records[0].unknownInput, 70); assert.equal(records[2].missing, true);
  const s = settings(); s.rates = {};
  const u = summarize(records, s, now, 0);
  assert.equal(u.unpriced, 2); assert.equal(u.missing, 1); assert.equal(u.costComplete, false);
});
test('local day and month boundaries account for timezone', () => {
  const t = Date.UTC(2026, 9, 1, 0, 30);
  assert.equal(periodStart('today', t, 28800), Date.UTC(2026, 8, 30, 16));
  assert.equal(periodStart('month', t, -25200), Date.UTC(2026, 8, 1, 7));
  assert.equal(periodStart('all', t, 0), 0);
});
test('random topics do not repeat immediately, cycling follows enabled order', () => {
  const s = settings(); assert.notEqual(chooseTopic(s, 'tokens', 0, () => 0), 'tokens');
  s.selection = 'cycle'; assert.equal(chooseTopic(s, undefined, 5), 'cost');
  s.topics = ['tokens']; assert.equal(chooseTopic(s, 'tokens', 6), 'tokens');
});
test('unavailable usage cannot pretend a full unused budget remains', () => {
  const v = state('unavailable'); v.settings.tokenBudget = 1000; v.settings.monthlyBudget = 10;
  assert.match(reportText('quota', v), /暂无法计算/); assert.doesNotMatch(reportText('quota', v), /还剩/);
  assert.match(reportText('cost', v), /暂时无法/);
});
test('overspend and missing accounting are explicit', () => {
  const v = state(); v.settings.tokenBudget = 300;
  assert.match(reportText('quota', v), /已超出 130/);
  v.summary.costComplete = false; v.summary.unpriced = 1;
  assert.match(reportText('cost', v), /补充模型单价/);
});
test('recharge and bonus wallets are grouped by currency', () => {
  const v = state(); v.balance = { status: 'ready', wallets: [{ currency: 'CNY', balance: '3.25' }], bonusWallets: [{ currency: 'CNY', balance: '2.50' }, { currency: 'USD', balance: '1' }] };
  assert.match(reportText('balance', v), /¥余额 5.75/); assert.match(reportText('balance', v), /充值 3.25 · 赠送 2.50/); assert.match(reportText('balance', v), /\$余额 1.00/);
});
test('settings reject empty topics, malformed prices, negative budgets and extra fields', () => {
  for (const bad of [{ topics: [] }, { monthlyBudget: -1 }, { intervalMinutes: 0 }, { secret: 'x' }, { constructor: 'x' }, { position: { x: 2, y: 0 } }, { rates: { a: { input: 1 } } }]) assert.throws(() => validateSettings({ ...DEFAULT_SETTINGS, ...bad }));
  assert.equal(validateSettings({ ...DEFAULT_SETTINGS, monthlyBudget: 0 }).monthlyBudget, 0);
});
