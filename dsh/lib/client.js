window.__ModuleLoader__.load({id:"ds-jingjing-pet",factory:(require)=>{const PET_STYLE=":host { all: initial; color-scheme: light; font-family: \"Segoe UI\", \"Microsoft YaHei\", sans-serif; color: #243552; }\r\n* { box-sizing: border-box; }\r\nbutton, input, select { font: inherit; }\r\nbutton { cursor: pointer; }\r\n[hidden] { display: none !important; }\r\n.pet { --scale: 1; position: fixed; right: 28px; bottom: 24px; z-index: 10000; pointer-events: none; }\r\n.sprite { position: absolute; left: 0; top: 0; width: 192px; height: 208px; transform: scale(var(--scale)); transform-origin: top left; background-repeat: no-repeat; background-size: 1536px 2288px; background-color: transparent; border: 0; padding: 0; touch-action: none; pointer-events: auto; clip-path: polygon(0 38px, 103px 38px, 103px 0, 100% 0, 100% 100%, 0 100%); }\r\n.sprite:focus-visible { outline: 2px solid #648af0; outline-offset: -3px; }\r\n.resident { position: fixed; width: max-content; min-width: 110px; max-width: min(310px, calc(100vw - 24px)); min-height: 48px; padding: 10px 22px 18px; color: #292e65; font-size: 15px; line-height: 20px; font-weight: 850; text-align: center; overflow-wrap: anywhere; }\r\n.bubble-outline { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }\r\n.bubble-outline path { fill: #fff; stroke: #292e65; stroke-width: 3; vector-effect: non-scaling-stroke; stroke-linejoin: round; }\r\n.bubble-text { position: relative; display: block; white-space: pre-line; }\r\n.resident.speaking { padding: 14px 34px 24px; font-size: 14px; line-height: 1.6; font-weight: 700; }\r\n.resident::before, .resident::after { content: ''; position: absolute; border: 3px solid #292e65; border-radius: 50%; background: #fff; transform: rotate(-12deg); }\r\n.resident::before { bottom: -12px; left: 29%; width: 15px; height: 12px; }\r\n.resident::after { bottom: -27px; left: 43%; width: 10px; height: 9px; }\r\n.settings-trigger { position: absolute; bottom: 0; right: 0; pointer-events: auto; border: 1px solid #c5d2eb; border-radius: 50%; width: 29px; height: 29px; color: #536f9d; background: #fff; font-size: 17px; opacity: 0; transition: opacity .15s; }\r\n.pet:hover .settings-trigger, .settings-trigger:focus-visible { opacity: 1; }\r\n.settings { border: 1px solid #d3deee; border-radius: 20px; padding: 0; width: min(590px, calc(100vw - 32px)); max-height: calc(100vh - 40px); color: #243552; background: #fff; box-shadow: 0 20px 70px #162c5740; font-size: 14px; }\r\n.settings::backdrop { background: #1827483b; }\r\nheader { display: flex; justify-content: space-between; align-items: start; padding: 24px 26px 12px; }\r\nh2 { font-size: 22px; margin: 0 0 6px; }\r\nheader p { margin: 0; color: #6d7c93; }\r\n.close { border: none; font-size: 27px; background: transparent; color: #7b8798; padding: 0 3px; }\r\nform { padding: 4px 26px 24px; }\r\nfieldset { border: 0; padding: 18px 0 0; margin: 15px 0 0; border-top: 1px solid #e7ecf5; }\r\nlegend { font-weight: 700; padding: 0 8px 0 0; }\r\nlabel { display: flex; flex-direction: column; gap: 7px; font-size: 13px; }\r\n.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 15px; }\r\ninput:not([type=\"checkbox\"]):not([type=\"range\"]), select { width: 100%; height: 36px; border: 1px solid #ced9ea; border-radius: 8px; padding: 7px 9px; color: #243552; background: #fdfefe; min-width: 0; }\r\ninput:focus, select:focus { outline: 2px solid #a8c0ef; outline-offset: 1px; }\r\ninput[type=\"checkbox\"] { accent-color: #567ed2; }\r\n.check, .topics label { flex-direction: row; align-items: center; gap: 6px; }\r\n.topics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }\r\n.hint { color: #728098; font-size: 12px; line-height: 1.6; margin: 0 0 13px; }\r\n.rate-row { margin-top: 12px; border: 1px solid #e1e9f4; background: #f8fafd; border-radius: 10px; padding: 12px; }\r\n.price-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin: 12px 0; }\r\n.secondary, .primary { border: 1px solid #d4deef; border-radius: 9px; padding: 8px 11px; background: #fff; color: #48668f; font-size: 13px; }\r\n.primary { background: #4f74c9; border-color: #4f74c9; color: #fff; }\r\n.primary:disabled { opacity: .5; cursor: wait; }\r\n.add-rate { margin-top: 12px; }\r\nfooter { display: flex; flex-wrap: wrap; justify-content: end; gap: 8px; margin-top: 14px; }\r\n.status { color: #697b98; font-size: 12px; line-height: 1.6; min-height: 20px; margin: 17px 0 0; }\r\ninput[type=\"range\"] { accent-color: #557bc9; width: 100%; }\r\n@media(max-width: 450px) { .grid, .price-grid { grid-template-columns: 1fr 1fr; } form { padding: 4px 18px 20px; } }\r\n@media(prefers-reduced-motion: reduce) { .settings-trigger { transition: none; } }\r\n\r\n.pet-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.check{margin-top:10px}\r\n.sprite{cursor:grab}.sprite:active{cursor:grabbing}.pet:focus-within .settings-trigger{opacity:1}\r\n@media(hover:none){.settings-trigger{opacity:1;min-width:36px;min-height:36px}}\r\n\r\n.pet-toolbar{position:absolute;top:calc(100% + 5px);left:50%;transform:translateX(-50%);display:flex;gap:2px;pointer-events:auto;padding:3px;background:#f6f8fff2;border:1px solid #c5d2eb;border-radius:12px;box-shadow:0 4px 16px #162c5714;opacity:0;transition:opacity .15s;white-space:nowrap}\r\n.pet:hover .pet-toolbar,.pet:focus-within .pet-toolbar{opacity:1}.pet-toolbar button{background:transparent;border:0;border-radius:8px;padding:4px 9px;font-size:11px;color:#48638e}.pet-toolbar button:hover{background:#dbe5fb}.pet-toolbar button:focus-visible{outline:2px solid #648af0;outline-offset:1px}\r\n@media(hover:none){.pet-toolbar{opacity:1}.pet-toolbar button{min-height:30px}}\r\n@media(prefers-reduced-motion:reduce){.pet-toolbar{transition:none}}\r\n";
// Canonical Work Pets v2 timing, shared by the Web and DSH adapters.
const PET_STATES = Object.freeze({
  idle: { row: 0, durations: [280, 110, 110, 140, 140, 320] },
  'running-right': { row: 1, durations: Array(8).fill(100) },
  'running-left': { row: 2, durations: Array(8).fill(100) },
  waving: { row: 3, durations: Array(4).fill(160) },
  jumping: { row: 4, durations: Array(5).fill(140) },
  failed: { row: 5, durations: Array(8).fill(160) },
  waiting: { row: 6, durations: Array(6).fill(180) },
  running: { row: 7, durations: Array(6).fill(160) },
  review: { row: 8, durations: Array(6).fill(160) },
});

function petFrame(state, elapsed, reducedMotion = false) {
  const animation = PET_STATES[state] ?? PET_STATES.idle;
  const cycle = animation.durations.reduce((a, b) => a + b, 0);
  let remaining = reducedMotion ? 0 : Math.max(0, elapsed) % cycle;
  let column = 0;
  while (column < animation.durations.length - 1 && remaining >= animation.durations[column]) {
    remaining -= animation.durations[column++];
  }
  return { row: animation.row, column };
}

function petDirection(dx, dy) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.hypot(dx, dy) < 24) return null;
  const direction = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) / 22.5) % 16;
  return { row: 9 + Math.floor(direction / 8), column: direction % 8 };
}

function petPosition(x, y, width, height, petWidth, petHeight, top = 0) {
  return {
    x: Math.max(0, Math.min(Math.max(0, width - petWidth), x)),
    y: Math.max(Math.min(top, Math.max(0, height - petHeight)), Math.min(Math.max(0, height - petHeight), y)),
  };
}

// Attach the bubble to the upper-left of the character, clamping only at edges.
function petBubble(pet, bubbleWidth, bubbleHeight, width, height) {
  const clamp = (value, min, max) => Math.max(min, Math.min(Math.max(min, max), value));
  const x = clamp(pet.x + pet.width * .38 - bubbleWidth * .9, 8, width - bubbleWidth - 8);
  const y = clamp(pet.y + pet.height * .14 - bubbleHeight - 18, 8, height - bubbleHeight - 18);
  return { x, y, tailX: clamp(pet.x + pet.width * .42 - x, 14, bubbleWidth - 20) };
}

/** Pure settings, token accounting and report selection shared by both faces. */
const DEFAULT_SETTINGS = Object.freeze({
  enabled: true, intervalMinutes: 10, displaySeconds: 8, selection: 'random',
  topics: ['tokens', 'cost', 'balance', 'quota'], scope: 'today', size: 192,
  currency: 'CNY', rates: {}, monthlyBudget: null, tokenBudget: null,
  position: null, followPointer: true, reduceMotion: false,
});
const count = value => Number.isSafeInteger(value) && value >= 0;
const bounded = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;

/** Validate settings received over RPC or loaded from local storage. */
function validateSettings(value) {
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
function foldUsage(snapshot) {
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
function periodStart(scope, now, offsetSeconds) {
  if (scope === 'all') return 0;
  const shifted = new Date(now + offsetSeconds * 1000);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), scope === 'today' ? shifted.getUTCDate() : 1) - offsetSeconds * 1000;
}

/** No money is invented for an unpriced route or unknown input bucket. */
function summarize(records, settings, now, offsetSeconds, scope = settings.scope) {
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
function chooseTopic(settings, previous, cursor, random = Math.random) {
  const pool = settings.topics;
  if (settings.selection === 'cycle') return pool[cursor % pool.length];
  const candidates = pool.length > 1 ? pool.filter(v => v !== previous) : pool;
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
}

/** Human-readable reports preserve unavailable and partial-data states. */
function reportText(topic, state) {
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


const name = 'ds-jingjing-pet';
const inject = ['connection'];

/** Mount only this plugin's Shadow DOM; unload removes listeners and timers. */
function apply(ctx) {
  ctx.effect(() => {
    const host = document.createElement('div');
    host.id = 'ds-jingjing-pet';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${PET_STYLE}</style>
      <section class="pet" aria-label="鲸鲸娘桌宠">
        <div class="resident" role="status" aria-live="polite">
          <svg class="bubble-outline" viewBox="0 0 280 145" preserveAspectRatio="none" aria-hidden="true"><path d="M74 122 C32 111 7 91 7 65 C7 30 65 7 140 7 C215 7 273 30 273 65 C273 100 215 124 140 124 C125 124 113 124 103 123 C100 139 78 140 74 122 Z"/></svg>
          <span class="bubble-text">哦鲸鲸…</span>
        </div>
        <button class="sprite" aria-label="鲸鲸娘：点击播报，方向键移动，右键设置" title="点击播报 · 右键设置"></button>
        <button class="settings-trigger" aria-label="打开鲸鲸设置" title="鲸鲸设置">⚙</button>
        <div class="pet-toolbar" role="group" aria-label="桌宠互动"><button data-pet-action="waving" title="打招呼" aria-label="打招呼">招手</button><button data-pet-action="jumping" title="投喂" aria-label="投喂">投喂</button><button class="sleep-toggle" aria-pressed="false">休息</button></div>
      </section>
      <dialog class="settings" aria-label="鲸鲸设置">
        <header><div><h2>鲸鲸设置</h2><p>让大肥鱼按你的节奏提醒</p></div><button class="close" aria-label="关闭设置">×</button></header>
        <form>
          <fieldset><legend>定时气泡</legend>
            <label class="check"><input name="enabled" type="checkbox">开启定时提醒</label>
            <div class="grid"><label>每隔多少分钟<input name="intervalMinutes" type="number" min="1" max="1440" step="0.1" required></label><label>每次显示多少秒<input name="displaySeconds" type="number" min="3" max="60" required></label></div>
            <div class="grid"><label>播报方式<select name="selection"><option value="random">随机挑选，不连续重复</option><option value="cycle">按顺序轮播</option></select></label><label>用量统计范围<select name="scope"><option value="today">今天</option><option value="month">本月</option><option value="all">全部历史</option></select></label></div>
            <div class="topics"><label><input type="checkbox" name="topic" value="tokens">Token 用量</label><label><input type="checkbox" name="topic" value="cost">估算花费</label><label><input type="checkbox" name="topic" value="balance">账户余额</label><label><input type="checkbox" name="topic" value="quota">预算剩余</label></div>
          </fieldset>
          <fieldset><legend>本月自设预算</legend><p class="hint">预算是你设置的提醒目标，不是账户官方额度；留空表示不设置。</p>
            <div class="grid"><label>金额预算<input name="monthlyBudget" type="number" min="0" max="1000000000000" step="0.01" placeholder="可留空"></label><label>Token 预算<input name="tokenBudget" type="number" min="0" max="1000000000000" step="1" placeholder="可留空"></label></div>
          </fieldset>
          <fieldset><legend>花费估算单价</legend><p class="hint">填写当前模型每百万 Token 的单价。缓存命中、缓存写入和普通输入分别计费；未配置的模型不会按零元计算。</p>
            <label>货币<select name="currency"><option value="CNY">人民币 CNY</option><option value="USD">美元 USD</option></select></label>
            <div class="rates"></div><button class="add-rate secondary" type="button">添加模型单价</button>
          </fieldset>
          <fieldset><legend>宠物外观</legend><label><span>大小 <span class="size-value"></span> px</span><input name="size" type="range" min="128" max="320" step="1"></label><p class="hint">拖动移动 · 悬停跳跃 · 点击挥手播报 · 方向键微调位置</p><label class="check"><input name="followPointer" type="checkbox">闲暇时看向鼠标</label><label class="check"><input name="reduceMotion" type="checkbox">减少动态效果</label><div class="pet-actions"><button type="button" class="secondary" data-pet-action="waving">打招呼</button><button type="button" class="secondary" data-pet-action="jumping">投喂</button><button type="button" class="secondary reset-position">回到原位</button></div></fieldset>
          <p class="status" role="status"></p><footer><button type="button" class="refresh secondary">刷新用量与余额</button><button type="button" class="speak secondary">立即播报</button><button type="submit" class="primary">保存设置</button></footer>
        </form>
      </dialog>`;
    document.body.append(host);
    const $ = selector => root.querySelector(selector);
    const pet = $('.pet'), sprite = $('.sprite'), bubble = $('.resident'), bubbleText = $('.bubble-text'), panel = $('.settings'), form = $('form');
    let settings = structuredClone(DEFAULT_SETTINGS), state, disposed = false, busy = false;
    let nextReport = performance.now() + settings.intervalMinutes * 60000, hideReport = 0;
    let previous, cursor = 0, frameId, pollTimer, currentAnimation = 'idle', animationStart = performance.now();
    let transientUntil = 0, transientState = 'idle', dragging, moved = false, hovered = false, assetLoaded = false, assetBusy = false;
    let sleeping = false, previewSize = null;
    let gaze = null, gazeUntil = 0, lastPointerX = 0, revision = 0, pendingSaves = 0, positionQueue = Promise.resolve();
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const abort = new AbortController(), listeners = [];
    const on = (element, event, listener, options) => { element.addEventListener(event, listener, options); listeners.push(() => element.removeEventListener(event, listener, options)); };
    const call = async (endpoint, payload = { timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60 }) => {
      const response = await ctx.connection.rpc.call('/api', `jingjing/${endpoint}`, payload, abort.signal);
      if (!response.ok) throw Error(response.error.message);
      return response.value;
    };
    const status = text => { $('.status').textContent = text; };
    const positionBubble = () => {
      const box = pet.getBoundingClientRect();
      const point = petBubble({ x: box.left, y: box.top, width: box.width, height: box.height }, bubble.offsetWidth, bubble.offsetHeight, innerWidth, innerHeight);
      bubble.style.left = `${point.x}px`;
      bubble.style.top = `${Math.max(12, Math.min(innerHeight - bubble.offsetHeight - 40, box.top + 4 - bubble.offsetHeight))}px`;
    };
    const showReport = text => {
      bubbleText.textContent = text; bubble.classList.add('speaking'); hideReport = performance.now() + settings.displaySeconds * 1000;
      positionBubble();
    };
    const restBubble = () => {
      bubbleText.textContent = sleeping ? '休息一下，等你回来…' : '哦鲸鲸…'; bubble.classList.remove('speaking'); hideReport = 0; positionBubble();
    };
    const loadAsset = async () => {
      if (assetBusy || assetLoaded || disposed) return;
      assetBusy = true;
      try {
        const { dataUrl } = await call('asset');
        const image = new Image(); image.src = dataUrl; await image.decode();
        if (disposed) return;
        if (image.width !== 1536 || image.height !== 2288) throw Error('宠物素材尺寸不正确');
        sprite.style.backgroundImage = `url("${dataUrl}")`; assetLoaded = true; host.dataset.asset = 'ready';
      } catch { if (!disposed && host.dataset.asset !== 'failed') { host.dataset.asset = 'failed'; showReport('鲸鲸素材暂时没加载成功，将自动重试。'); } }
      finally { assetBusy = false; }
    };
    const positionPet = () => {
      if (dragging) return;
      const size = Math.min(previewSize ?? settings.size, innerWidth, Math.max(128, (innerHeight - 120) * 192 / 208));
      pet.style.setProperty('--scale', size / 192);
      pet.style.width = `${size}px`;
      pet.style.height = `${size * 208 / 192}px`;
      if (settings.position) {
        pet.style.left = `${Math.max(0, innerWidth - size) * settings.position.x}px`;
        pet.style.top = `${Math.max(0, innerHeight - size * 208 / 192 - 40) * settings.position.y}px`;
        pet.style.right = pet.style.bottom = 'auto';
      } else { pet.style.left = pet.style.top = 'auto'; pet.style.right = '20px'; pet.style.bottom = '58px'; }
      positionBubble();
    };
    const pull = async (force = false) => {
      if (busy || disposed) return;
      busy = true;
      const requestedRevision = revision;
      try {
        const value = await call(force ? 'refresh' : 'state');
        if (disposed) return;
        if (!state || value.settings.intervalMinutes !== settings.intervalMinutes) nextReport = performance.now() + value.settings.intervalMinutes * 60000;
        state = value;
        if (!dragging && !pendingSaves && requestedRevision === revision && !panel.open) { settings = validateSettings(value.settings); positionPet(); }
        if (panel.open) status(`用量${state.usageStatus === 'ready' ? '已更新' : state.usageStatus === 'loading' ? '读取中' : '部分暂不可用'} · ${state.balance.status === 'ready' ? '账户余额已更新' : '账户余额暂不可用'}`);
      } catch (error) { if (!disposed) status(`暂时无法刷新：${error.message}`); }
      finally { busy = false; }
    };
    const speak = (source = 'manual') => {
      host.dataset.lastReportSource = source; host.dataset.lastReportAt = new Date().toISOString();
      if (!state) { showReport('正在读取用量，等鲸鲸一下…'); return; }
      const topic = chooseTopic(settings, previous, cursor++);
      previous = topic; showReport(reportText(topic, state));
    };
    const animate = now => {
      frameId = 0;
      if (disposed || document.hidden) return;
      if (!document.hidden && settings.enabled && now >= nextReport) { speak('timer'); nextReport = now + settings.intervalMinutes * 60000; }
      if (hideReport && now >= hideReport) restBubble();
      const action = dragging && moved ? (dragging.dx < 0 ? 'running-left' : 'running-right') : sleeping ? 'sleep' : now < transientUntil ? transientState : hovered ? 'jumping' : state?.activity ?? 'idle';
      if (currentAnimation !== action) { currentAnimation = action; animationStart = now; }
      let cell = sleeping && !dragging ? { row: 0, column: 3 } : petFrame(currentAnimation, now - animationStart, reducedMotion.matches || settings.reduceMotion);
      if (action === 'idle' && settings.followPointer && !reducedMotion.matches && !settings.reduceMotion && gaze && now < gazeUntil) cell = gaze;
      const nextPosition = `${-192 * cell.column}px ${-208 * cell.row}px`;
      if (sprite.style.backgroundPosition !== nextPosition) sprite.style.backgroundPosition = nextPosition;
      sprite.dataset.animation = currentAnimation;
      sprite.dataset.row = String(cell.row);
      frameId = requestAnimationFrame(animate);
    };
    const rateRow = (route = '', value = null) => {
      const row = document.createElement('div'); row.className = 'rate-row';
      row.innerHTML = `<label class="route-label">模型（provider/model）<input class="route" placeholder="deepseek/模型 ID" maxlength="160"></label><div class="price-grid"><label>普通输入<input data-rate="input" type="number" min="0" max="1000000" step="0.0001"></label><label>缓存命中<input data-rate="cached" type="number" min="0" max="1000000" step="0.0001"></label><label>输出<input data-rate="output" type="number" min="0" max="1000000" step="0.0001"></label><label>缓存写入<input data-rate="cacheWrite" type="number" min="0" max="1000000" step="0.0001"></label></div><button type="button" class="remove-rate secondary">移除此模型</button>`;
      row.querySelector('.route').value = route;
      for (const input of row.querySelectorAll('[data-rate]')) input.value = value ? value[input.dataset.rate] : '';
      row.querySelector('.remove-rate').addEventListener('click', () => row.remove());
      $('.rates').append(row);
    };
    const openSettings = () => {
      for (const key of ['intervalMinutes', 'displaySeconds', 'selection', 'scope', 'size', 'currency']) form.elements[key].value = settings[key];
      form.elements.enabled.checked = settings.enabled;
      form.elements.followPointer.checked = settings.followPointer;
      form.elements.reduceMotion.checked = settings.reduceMotion;
      for (const key of ['monthlyBudget', 'tokenBudget']) form.elements[key].value = settings[key] ?? '';
      for (const input of root.querySelectorAll('[name="topic"]')) input.checked = settings.topics.includes(input.value);
      $('.size-value').textContent = settings.size;
      $('.rates').replaceChildren();
      for (const route of new Set([...(state?.routes ?? []), ...Object.keys(settings.rates)])) rateRow(route, settings.rates[route]);
      hovered = false; gaze = null; if (!panel.open) panel.showModal(); status('设置保存在本机。花费为估算，余额来自账户接口。');
    };
    on($('.settings-trigger'), 'click', openSettings);
    on(sprite, 'contextmenu', event => { event.preventDefault(); openSettings(); });
    on($('.close'), 'click', () => panel.close());
    on(panel, 'close', () => { previewSize = null; positionPet(); $('.settings-trigger').focus(); });
    on($('.add-rate'), 'click', () => rateRow());
    on($('.speak'), 'click', () => speak());
    on($('.refresh'), 'click', () => pull(true));
    on(form.elements.size, 'input', () => { $('.size-value').textContent = form.elements.size.value; previewSize = Number(form.elements.size.value); positionPet(); });
    on(form, 'submit', async event => {
      event.preventDefault();
      const button = $('.primary'); button.disabled = true;
      try {
        const data = new FormData(form), rates = {};
        for (const row of root.querySelectorAll('.rate-row')) {
          const route = row.querySelector('.route').value.trim();
          const prices = [...row.querySelectorAll('[data-rate]')];
          if (!prices.some(input => input.value !== '')) continue;
          if (!route || route in rates || prices.some(input => input.value === '')) throw Error('请为每个模型填写四项单价；未使用的缓存写入可填 0');
          rates[route] = Object.fromEntries(prices.map(input => [input.dataset.rate, Number(input.value)]));
        }
        const next = validateSettings({ ...settings, enabled: data.has('enabled'), followPointer: data.has('followPointer'), reduceMotion: data.has('reduceMotion'),
          topics: data.getAll('topic'), selection: data.get('selection'), scope: data.get('scope'), currency: data.get('currency'), rates,
          intervalMinutes: Number(data.get('intervalMinutes')), displaySeconds: Number(data.get('displaySeconds')), size: Number(data.get('size')),
          monthlyBudget: data.get('monthlyBudget') === '' ? null : Number(data.get('monthlyBudget')),
          tokenBudget: data.get('tokenBudget') === '' ? null : Number(data.get('tokenBudget')),
        });
        revision++;
        await positionQueue;
        settings = validateSettings(await call('settings', next));
        nextReport = performance.now() + settings.intervalMinutes * 60000; previous = undefined; cursor = 0;
        positionPet(); await pull(); status('已保存，新的间隔从现在开始计时。');
      } catch (error) { status(error.message); }
      finally { button.disabled = false; }
    });
    const transient = (action, text) => { sleeping = false; $('.sleep-toggle').textContent = '休息'; $('.sleep-toggle').setAttribute('aria-pressed', 'false'); transientState = action; transientUntil = performance.now() + 1500; if (text) showReport(text); };
    const persistPosition = position => {
      settings = { ...settings, position }; revision++; pendingSaves++;
      positionQueue = positionQueue.catch(() => {}).then(async () => {
        if (disposed) return;
        try { await call('settings', { ...settings, position }); }
        catch (error) { if (!disposed) { status(error.message); showReport('位置暂时没保存成功，可以再拖动重试。'); } }
        finally { pendingSaves--; }
      });
      return positionQueue;
    };
    const saveCurrentPosition = () => {
      const box = pet.getBoundingClientRect();
      return persistPosition({ x: Math.max(0, Math.min(1, box.left / Math.max(1, innerWidth - box.width))), y: Math.max(0, Math.min(1, box.top / Math.max(1, innerHeight - box.height - 40))) });
    };
    const move = (x, y) => {
      const box = pet.getBoundingClientRect();
      const point = petPosition(x, y, innerWidth, Math.max(0, innerHeight - 40), box.width, box.height, Math.min(80, innerHeight / 4));
      pet.style.right = pet.style.bottom = 'auto'; pet.style.left = `${point.x}px`; pet.style.top = `${point.y}px`; positionBubble();
    };
    const cancelDrag = () => {
      const active = dragging; dragging = undefined; hovered = false; gaze = null;
      if (active && sprite.hasPointerCapture(active.pointer)) sprite.releasePointerCapture(active.pointer);
      if (active && moved) void saveCurrentPosition();
    };
    for (const button of root.querySelectorAll('[data-pet-action]')) on(button, 'click', () => { if (panel.open) panel.close(); transient(button.dataset.petAction, button.dataset.petAction === 'jumping' ? '啊呜，谢谢投喂！' : '在呢，今天也要开心呀！'); });
    on($('.sleep-toggle'), 'click', () => { sleeping = !sleeping; transientUntil = 0; hovered = false; gaze = null; $('.sleep-toggle').textContent = sleeping ? '唤醒' : '休息'; $('.sleep-toggle').setAttribute('aria-pressed', String(sleeping)); restBubble(); });
    on($('.reset-position'), 'click', () => { cancelDrag(); void persistPosition(null); positionPet(); transient('waving', '回到小窝啦'); });
    on(sprite, 'pointerenter', event => { if (event.pointerType !== 'touch' && !panel.open) hovered = true; });
    on(sprite, 'pointerleave', () => { hovered = false; });
    on(window, 'blur', cancelDrag);
    on(document, 'pointermove', event => {
      if (event.pointerType === 'touch' || dragging || panel.open || document.hidden || !settings.followPointer) return;
      const box = sprite.getBoundingClientRect();
      gaze = petDirection(event.clientX - box.left - box.width / 2, event.clientY - box.top - box.height * .4);
      gazeUntil = performance.now() + 2500;
    }, { passive: true });
    on(document, 'pointerout', event => { if (!event.relatedTarget) gaze = null; });
    on(sprite, 'pointerdown', event => {
      if (event.button !== 0 || dragging) return;
      const box = pet.getBoundingClientRect(); moved = false; lastPointerX = event.clientX;
      dragging = { pointer: event.pointerId, x: event.clientX, y: event.clientY, left: box.left, top: box.top, dx: 0 };
      sprite.setPointerCapture(event.pointerId);
    });
    on(sprite, 'pointermove', event => {
      if (!dragging || event.pointerId !== dragging.pointer) return;
      const dx = event.clientX - dragging.x, dy = event.clientY - dragging.y;
      if (Math.hypot(dx, dy) > 5) moved = true;
      dragging.dx = event.clientX - lastPointerX; lastPointerX = event.clientX;
      if (moved) move(dragging.left + dx, dragging.top + dy);
    });
    on(sprite, 'pointerup', event => {
      if (!dragging || event.pointerId !== dragging.pointer) return;
      cancelDrag();
    });
    on(sprite, 'click', () => { if (moved) { moved = false; return; } transient('waving'); speak(); });
    on(sprite, 'pointercancel', cancelDrag);
    on(sprite, 'lostpointercapture', () => { if (dragging) cancelDrag(); });
    on(sprite, 'keydown', event => {
      const delta = { ArrowLeft: [-12,0], ArrowRight: [12,0], ArrowUp: [0,-12], ArrowDown: [0,12] }[event.key];
      if (delta) { event.preventDefault(); const box = pet.getBoundingClientRect(); move(box.left + delta[0], box.top + delta[1]); void saveCurrentPosition(); }
    });
    on(window, 'resize', () => { cancelDrag(); positionPet(); const box = pet.getBoundingClientRect(); move(box.left, box.top); });
    on(document, 'visibilitychange', () => {
      cancelDrag();
      if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; }
      else { nextReport = performance.now() + settings.intervalMinutes * 60000; animationStart = performance.now(); if (!frameId) frameId = requestAnimationFrame(animate); void pull(); }
    });
    positionPet(); frameId = requestAnimationFrame(animate);
    void loadAsset();
    void pull(); pollTimer = setInterval(() => { if (!document.hidden) { void pull(); void loadAsset(); } }, 5000);
    return () => { disposed = true; abort.abort(); cancelAnimationFrame(frameId); clearInterval(pollTimer); listeners.forEach(dispose => dispose()); host.remove(); };
  });
}

return { name, inject, apply };
}});
