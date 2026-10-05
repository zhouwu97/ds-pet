import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apply } from '../src/host.mjs';
import { DEFAULT_SETTINGS } from '../src/core.mjs';

test('authenticated-route adapter validates envelopes, persists settings and unloads cleanly', async () => {
  const home = await mkdtemp(join(tmpdir(), 'jingjing-test-')); const original = process.env.DSH_HOME; process.env.DSH_HOME = home;
  const routes = new Map(), events = new Map(), disposers = [];
  const ctx = {
    connection: { fetch: { register(route) { routes.set(route.path, route); disposers.push(() => routes.delete(route.path)); } } },
    sessionQuery: { async listSessions() { return []; } },
    deepseekAccount: { async getBalance() { return null; } },
    on(event, listener) { events.set(event, listener); },
  };
  try {
    await apply(ctx); assert.equal(routes.size, 4);
    const request = async (action, payload) => {
      const method = `jingjing/${action}`;
      return (await routes.get(`/api/${method}`).fetch(new Request(`http://localhost/api/${method}`, { method: 'POST', body: JSON.stringify({ type: 'client-request', rpcId: 'fixture-1', method, payload }) }))).json();
    };
    const asset = await request('asset'); assert.equal(asset.rpcId, 'fixture-1'); assert.match(asset.result.value.dataUrl, /^data:image\/png;base64,/);
    const bad = await routes.get('/api/jingjing/asset').fetch(new Request('http://localhost/api/jingjing/asset', { method: 'POST', body: '{}' })); assert.equal(bad.status, 400);
    const invalid = await request('settings', { ...DEFAULT_SETTINGS, intervalMinutes: -1 }); assert.equal(invalid.result.ok, false);
    const saved = await request('settings', { ...DEFAULT_SETTINGS, intervalMinutes: 3 }); assert.equal(saved.result.value.intervalMinutes, 3);
    const file = JSON.parse(await readFile(join(home, 'storages/ds-jingjing-pet/settings.json'), 'utf8')); assert.equal(file.intervalMinutes, 3);
    await Promise.all([request('settings', { ...DEFAULT_SETTINGS, intervalMinutes: 4 }), request('settings', { ...DEFAULT_SETTINGS, intervalMinutes: 5 })]);
    assert.equal(JSON.parse(await readFile(join(home, 'storages/ds-jingjing-pet/settings.json'), 'utf8')).intervalMinutes, 5);
    const snapshot = await request('state', { timezoneOffsetSeconds: 28800 }); assert.equal(snapshot.result.value.usageStatus, 'ready'); assert.equal(snapshot.result.value.balance.status, 'signed-out');
    events.get('session/event')({ id: 'fixture' }, { type: 'turn/start' });
    assert.equal((await request('state', { timezoneOffsetSeconds: 0 })).result.value.activity, 'running');
    events.get('session/event')({ id: 'fixture' }, { type: 'turn/end', data: { reason: { kind: 'error' } } });
    assert.equal((await request('state', { timezoneOffsetSeconds: 0 })).result.value.activity, 'failed');
    events.get('dispose')(); disposers.forEach(fn => fn()); assert.equal(routes.size, 0);
  } finally { if (original === undefined) delete process.env.DSH_HOME; else process.env.DSH_HOME = original; await rm(home, { recursive: true }); }
});
