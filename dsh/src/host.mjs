import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_SETTINGS, validateSettings, foldUsage, summarize } from './core.mjs';

export const name = 'ds-jingjing-pet';
export const inject = ['connection', 'sessionQuery', 'deepseekAccount'];

/** Register authenticated carrier-neutral RPC; account credentials stay in Harness. */
export async function apply(ctx) {
  const storage = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'storages', 'ds-jingjing-pet');
  const settingsPath = join(storage, 'settings.json');
  let settings = structuredClone(DEFAULT_SETTINGS), records = [], usageStatus = 'loading';
  let balance = { status: 'loading' }, alive = true, scanPromise, balancePromise, lastScan = 0, lastBalance = 0;
  let readFailures = 0, recentEnd = 0, recentState = 'idle', saveQueue = Promise.resolve();
  const active = new Set(), cached = new Map();
  try { settings = validateSettings(JSON.parse(await readFile(settingsPath, 'utf8'))); }
  catch (error) { if (error.code !== 'ENOENT') throw Error('鲸鲸设置文件无法读取，请检查本地 settings.json', { cause: error }); }
  const assetPath = fileURLToPath(new URL('../assets/jingjing-spritesheet.png', import.meta.url));
  const asset = `data:image/png;base64,${(await readFile(assetPath)).toString('base64')}`;
  const scan = async () => {
    if (scanPromise) return scanPromise;
    scanPromise = (async () => {
      if (!ctx.sessionQuery) { usageStatus = 'unavailable'; return; }
      try {
        const sessions = await ctx.sessionQuery.listSessions();
        const found = new Set(), all = [];
        readFailures = 0;
        for (const item of sessions) {
          if (!alive) return;
          const id = item.header.id;
          found.add(id);
          try {
            const snapshot = await ctx.sessionQuery.readSession(id);
            const folded = foldUsage(snapshot);
            cached.set(id, folded);
            all.push(...folded);
          } catch { readFailures++; all.push(...(cached.get(id) ?? [])); }
        }
        for (const id of cached.keys()) if (!found.has(id)) cached.delete(id);
        records = all;
        usageStatus = readFailures ? 'partial' : 'ready';
        lastScan = Date.now();
      } catch { usageStatus = records.length ? 'partial' : 'unavailable'; }
    })().finally(() => { scanPromise = undefined; });
    return scanPromise;
  };
  const refreshBalance = async (client) => {
    if (balancePromise) return balancePromise;
    balancePromise = (async () => {
      if (!ctx.deepseekAccount?.getBalance) { balance = { status: 'unavailable' }; return; }
      try {
        const result = await ctx.deepseekAccount.getBalance(client);
        balance = !result ? { status: 'signed-out' } : result.status !== 'ready' ? { status: 'failed' } : {
          status: 'ready', wallets: result.value, bonusWallets: result.bonusWallets ?? [], updatedAt: Date.now(),
        };
        lastBalance = Date.now();
      } catch { balance = { status: 'failed' }; }
    })().finally(() => { balancePromise = undefined; });
    return balancePromise;
  };
  ctx.on('session/event', (session, event) => {
    const id = session.id ?? session.header?.id;
    if (event.type === 'turn/start') active.add(id);
    if (event.type === 'turn/end') {
      active.delete(id); recentEnd = Date.now();
      recentState = event.data.reason.kind === 'completed' ? 'review' : event.data.reason.kind === 'error' ? 'failed' : 'waiting';
      lastScan = 0;
    }
  });
  const snapshot = (offset) => ({ settings,
    summary: summarize(records, settings, Date.now(), offset),
    month: summarize(records, settings, Date.now(), offset, 'month'),
    routes: [...new Set(records.filter(r => r.route).map(r => r.route))].sort(),
    usageStatus, readFailures, balance,
    activity: active.size ? 'running' : Date.now() - recentEnd < 6000 ? recentState : 'idle',
    updatedAt: lastScan,
  });
  const handle = async (endpoint, payload) => {
    try {
      if (endpoint === 'jingjing/asset') return { ok: true, value: { dataUrl: asset } };
      if (endpoint === 'jingjing/settings') {
        const next = validateSettings(payload);
        const save = saveQueue.then(async () => {
          await mkdir(storage, { recursive: true });
          const temp = join(storage, `settings-${crypto.randomUUID()}.tmp`);
          await writeFile(temp, JSON.stringify(next, null, 2) + '\n', { mode: 0o600 });
          await rename(temp, settingsPath);
          settings = next;
          return next;
        });
        saveQueue = save.catch(() => {});
        return { ok: true, value: await save };
      }
      if (!['jingjing/state', 'jingjing/refresh'].includes(endpoint)) throw Error('未知操作');
      const offset = payload?.timezoneOffsetSeconds;
      if (!Number.isInteger(offset) || Math.abs(offset) > 50400) throw Error('时区格式不正确');
      const client = { version: '0.2.0-rc.2', locale: 'zh-CN', timezoneOffsetSeconds: offset };
      const force = endpoint === 'jingjing/refresh';
      if (force || Date.now() - lastScan > 60000) await scan();
      if (force || Date.now() - lastBalance > 60000) await refreshBalance(client);
      return { ok: true, value: snapshot(offset) };
    } catch (error) { return { ok: false, error: { code: 'JINGJING_REQUEST', message: error.message, details: {} } }; }
  };
  // Exact routes share Harness authentication and work over HTTP and desktop IPC.
  // The common /api interceptor belongs to the core gateway and is exclusive.
  for (const action of ['asset', 'settings', 'state', 'refresh']) {
    const endpoint = `jingjing/${action}`;
    ctx.connection.fetch.register({ path: `/api/${endpoint}`, methods: ['POST'], requestBody: 'buffered',
      fetch: async request => {
        let body;
        try { body = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }
        if (body?.type !== 'client-request' || typeof body.rpcId !== 'string' || body.rpcId.length > 200 || body.method !== endpoint) return new Response('Invalid request', { status: 400 });
        return Response.json({ type: 'server-response', rpcId: body.rpcId, result: await handle(endpoint, body.payload) });
      },
    });
  }
  ctx.on('dispose', () => { alive = false; cached.clear(); });
}
