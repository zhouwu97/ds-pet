/** Pure settings, token accounting and report selection shared by both faces. */
export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true, intervalMinutes: 10, displaySeconds: 8, selection: 'random',
  topics: ['tokens', 'cost', 'balance', 'quota'], scope: 'today', size: 192,
  currency: 'CNY', rates: {}, monthlyBudget: null, tokenBudget: null,
  position: null, followPointer: true, reduceMotion: false,
});
const count = value => Number.isSafeInteger(value) && value >= 0;
const bounded = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;

/** Validate settings received over RPC or loaded from local storage. */
export function validateSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('设置格式不正确');
  const s = { ...DEFAULT_SETTINGS, ...value };
  if (Object.keys(value).some(key => !Object.hasOwn(DEFAULT_SETTINGS, key))) throw Error('设置包含未知字段');
  if (typeof s.followPointer !== 'boolean' || typeof s.reduceMotion !== 'boolean') throw Error('桌宠交互设置格式不正确');
  if (typeof s.enabled !== 'boolean' || !bounded(s.intervalMinutes, 1, 1440) || !bounded(s.displaySeconds, 3, 60)) throw Error('提醒间隔为 1–1440 分钟，展示时间为 3–60 秒');
  if (!['random', 'cycle'].includes(s.selection) || !['today', 'month', 'all'].includes(s.scope)) throw Error('播报方式或统计范围不正确');
  if (!Array.isArray(s.topics) || !s.topics.length || s.topics.some(v => !['tokens', 'cost', 'balance', 'quota'].includes(v)) || new Set(s.topics).size !== s.topics.length) throw Error('请至少选择一种播报内容');
  if (!['CNY', 'USD'].includes(s.currency) || !bounded(s.size, 128, 320)) throw Error('货币或宠物大小不正确');
  for (const key of ['monthlyBudget', 'tokenBudget']) {
    if (s[key] !== null && (!bounded(s[key], 0, 1e12) || (key === 'tokenBudget' && !count(s[key])))) throw Error('预算必须为非负数');
  }
  if (!s.rates || typeof s.rates !== 'object' || Array.isArray(s.rates) || Object.keys(s.rates).length > 100) throw Error('单价格式不正确');
  for (const [route, rate] of Object.entries(s.rates)) {
    if (!/^[^/\s]+\/\S+$/.test(route) || route.length > 160 || !rate || typeof rate !== 'object' || Object.keys(rate).some(k => !['input', 'cached', 'output', 'cacheWrite'].includes(k))) throw Error('模型单价格式不正确');
    if (!['input', 'cached', 'output', 'cacheWrite'].every(k => bounded(rate[k], 0, 1e6))) throw Error('每百万 Token 单价必须为非负数');
  }
  if (s.position !== null && (!s.position || !bounded(s.position.x, 0, 1) || !bounded(s.position.y, 0, 1) || Object.keys(s.position).some(k => !['x', 'y'].includes(k)))) throw Error('位置格式不正确');
  return structuredClone(s);
}

/** Count settled attempts once; final usage replaces streaming samples. */
export function foldUsage(snapshot) {
  const records = [];
  let route = { provider: '', model: '' };
  for (const event of snapshot.events.slice(snapshot.inheritedEventCount ?? 0)) {
    if (event.type === 'request/header') route = event.data.header?.config ?? event.data.config ?? route;
    if (!['assistant/message', 'assistant/attempt'].includes(event.type)) continue;
    const source = event.data.message?.source ?? route;
    const chunks = (event.data.stream ?? []).filter(v => v.type === 'chunk' && v.chunk?.type === 'usage');
    const u = event.data.usage ?? chunks.at(-1)?.chunk.usage;
    if (!u || !count(u.inputTokens) || !count(u.outputTokens)) {
      records.push({ time: event.time, missing: true });
      continue;
    }
    const cached = u.cacheReadTokens ?? 0, write = u.cacheWriteTokens ?? 0;
    const knownTotal = u.inputTokens + u.outputTokens + cached + write;
    const total = u.totalTokens ?? knownTotal;
    if (![cached, write, total, knownTotal].every(count) || total < knownTotal) {
      records.push({ time: event.time, missing: true });
      continue;
    }
    records.push({ time: event.time, input: u.inputTokens, output: u.outputTokens,
      cached, cacheWrite: write, total, unknownInput: total - knownTotal,
      route: `${source.provider ?? ''}/${source.model ?? ''}` });
  }
  return records;
}

/** Local calendar boundaries honor the reporting user's UTC offset. */
export function periodStart(scope, now, offsetSeconds) {
  if (scope === 'all') return 0;
  const shifted = new Date(now + offsetSeconds * 1000);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), scope === 'today' ? shifted.getUTCDate() : 1) - offsetSeconds * 1000;
}

/** No money is invented for an unpriced route or unknown input bucket. */
export function summarize(records, settings, now, offsetSeconds, scope = settings.scope) {
  const selected = records.filter(r => r.time >= periodStart(scope, now, offsetSeconds) && r.time <= now);
  const result = { input: 0, output: 0, cached: 0, cacheWrite: 0, total: 0,
    attempts: 0, missing: 0, unpriced: 0, estimatedCost: 0, currency: settings.currency };
  for (const r of selected) {
    if (r.missing) { result.missing++; continue; }
    result.attempts++;
    for (const key of ['input', 'output', 'cached', 'cacheWrite', 'total']) result[key] += r[key];
    const rate = settings.rates[r.route];
    if (!rate || r.unknownInput) { result.unpriced++; continue; }
    result.estimatedCost += (r.input * rate.input + r.cached * rate.cached + r.output * rate.output + r.cacheWrite * rate.cacheWrite) / 1e6;
  }
  result.costComplete = result.missing === 0 && result.unpriced === 0;
  return result;
}

/** Avoid immediate repeats when randomly choosing multiple enabled reports. */
export function chooseTopic(settings, previous, cursor, random = Math.random) {
  const pool = settings.topics;
  if (settings.selection === 'cycle') return pool[cursor % pool.length];
  const candidates = pool.length > 1 ? pool.filter(v => v !== previous) : pool;
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
}

/** Human-readable reports preserve unavailable and partial-data states. */
export function reportText(topic, state) {
  const { summary: u, month, settings: s, balance, usageStatus } = state;
  const range = { today: '今天', month: '本月', all: '累计' }[s.scope];
  const n = v => v.toLocaleString('zh-CN');
  const money = v => `${s.currency === 'CNY' ? '¥' : '$'}${v.toFixed(4)}`;
  if (topic === 'tokens') {
    if (usageStatus === 'loading') return '正在读取用量，等鲸鲸一下…';
    if (usageStatus === 'unavailable') return '暂时读不到用量，稍后再试哦。';
    return `${range}${u.missing || usageStatus === 'partial' ? '已记录 ' : '用了 '}${n(u.total)} Token\n输入 ${n(u.input + u.cached + u.cacheWrite)} · 输出 ${n(u.output)}${u.missing ? '\n部分请求未返回用量' : ''}`;
  }
  if (topic === 'cost') {
    if (usageStatus === 'loading' || usageStatus === 'unavailable') return '用量尚未就绪，暂时无法估算花费。';
    if (!u.costComplete || usageStatus === 'partial') return `${range}的花费还算不全哦。\n${u.unpriced ? '请在设置里补充模型单价。' : '部分请求用量暂不可用。'}`;
    return `${range}估算花费 ${money(u.estimatedCost)}\n按你设置的单价计算`;
  }
  if (topic === 'balance') {
    if (balance.status !== 'ready') return ({ loading: '正在查询账户余额…', unavailable: '当前客户端未提供账户余额。', 'signed-out': '登录 Harness 账户后才能查余额哦。', failed: '余额暂时查询失败，稍后再试。' })[balance.status] ?? '余额暂不可用。';
    const group = new Map();
    for (const [kind, wallets] of [['充值', balance.wallets], ['赠送', balance.bonusWallets]]) {
      for (const w of wallets) {
        const entry = group.get(w.currency) ?? { recharge: 0, bonus: 0 };
        entry[kind === '充值' ? 'recharge' : 'bonus'] += Number(w.balance);
        group.set(w.currency, entry);
      }
    }
    if (!group.size) return '账户没有返回可用的余额数据。';
    return [...group].map(([c, v]) => `${c === 'CNY' ? '¥' : '$'}余额 ${(v.recharge + v.bonus).toFixed(2)}\n充值 ${v.recharge.toFixed(2)} · 赠送 ${v.bonus.toFixed(2)}`).join('\n');
  }
  const lines = [];
  if (s.tokenBudget !== null) lines.push(['loading', 'unavailable'].includes(usageStatus) ? '本月 Token 预算剩余暂无法计算。' : `本月 Token 预算 ${n(s.tokenBudget)}\n${month.total > s.tokenBudget ? '已超出' : '还剩'} ${n(Math.abs(s.tokenBudget - month.total))}${month.missing || usageStatus === 'partial' ? '（部分用量未计入）' : ''}`);
  if (s.monthlyBudget !== null) lines.push(month.costComplete && !['loading', 'unavailable', 'partial'].includes(usageStatus) ? `本月金额预算 ${money(s.monthlyBudget)}\n${month.estimatedCost > s.monthlyBudget ? '已超出' : '估算剩余'} ${money(Math.abs(s.monthlyBudget - month.estimatedCost))}` : '本月金额预算剩余暂无法估算。');
  return lines.join('\n') || '还没设置本月预算哦。\n可设置 Token 或金额预算。';
}
