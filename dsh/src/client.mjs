import { DEFAULT_SETTINGS, validateSettings, chooseTopic, reportText } from './core.mjs';

export const name = 'ds-jingjing-pet';
export const inject = ['connection'];

const STATES = {
  idle: { row: 0, durations: [280, 110, 110, 140, 140, 320] },
  'running-right': { row: 1, durations: Array(8).fill(100) },
  'running-left': { row: 2, durations: Array(8).fill(100) },
  waving: { row: 3, durations: Array(4).fill(160) },
  jumping: { row: 4, durations: Array(5).fill(140) },
  failed: { row: 5, durations: Array(8).fill(160) },
  waiting: { row: 6, durations: Array(6).fill(180) },
  running: { row: 7, durations: Array(6).fill(160) },
  review: { row: 8, durations: Array(6).fill(160) },
};

/** Mount only this plugin's Shadow DOM; unload removes listeners and timers. */
export function apply(ctx) {
  ctx.effect(() => {
    const host = document.createElement('div');
    host.id = 'ds-jingjing-pet';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${PET_STYLE}</style>
      <section class="pet" aria-label="鲸鲸娘桌宠">
        <div class="report" role="status" aria-live="polite" hidden></div>
        <div class="resident" aria-label="哦鲸鲸">哦鲸鲸</div>
        <button class="sprite" aria-label="鲸鲸娘：点击播报，右键设置" title="点击播报 · 右键设置"></button>
        <button class="settings-trigger" aria-label="打开鲸鲸设置" title="鲸鲸设置">⚙</button>
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
          <fieldset><legend>宠物外观</legend><label><span>大小 <span class="size-value"></span> px</span><input name="size" type="range" min="128" max="320" step="1"></label><p class="hint">拖动宠物即可改变位置。「哦鲸鲸」气泡始终显示。</p></fieldset>
          <p class="status" role="status"></p><footer><button type="button" class="refresh secondary">刷新用量与余额</button><button type="button" class="speak secondary">立即播报</button><button type="submit" class="primary">保存设置</button></footer>
        </form>
      </dialog>`;
    document.body.append(host);
    const $ = selector => root.querySelector(selector);
    const pet = $('.pet'), sprite = $('.sprite'), bubble = $('.report'), panel = $('.settings'), form = $('form');
    let settings = structuredClone(DEFAULT_SETTINGS), state, disposed = false, busy = false;
    let nextReport = performance.now() + settings.intervalMinutes * 60000, hideReport = 0;
    let previous, cursor = 0, frameId, pollTimer, currentAnimation = 'idle', animationStart = performance.now();
    let transientUntil = 0, transientState = 'idle', dragging, moved = false, assetLoaded = false, assetBusy = false;
    const abort = new AbortController(), listeners = [];
    const on = (element, event, listener, options) => { element.addEventListener(event, listener, options); listeners.push(() => element.removeEventListener(event, listener, options)); };
    const call = async (endpoint, payload = { timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60 }) => {
      const response = await ctx.connection.rpc.call('/api', `jingjing/${endpoint}`, payload, abort.signal);
      if (!response.ok) throw Error(response.error.message);
      return response.value;
    };
    const status = text => { $('.status').textContent = text; };
    const showReport = text => {
      bubble.textContent = text; bubble.hidden = false; hideReport = performance.now() + settings.displaySeconds * 1000;
      const box = pet.getBoundingClientRect();
      bubble.style.left = `${Math.max(12, Math.min(innerWidth - bubble.offsetWidth - 12, box.right - bubble.offsetWidth))}px`;
      bubble.style.top = `${Math.max(12, Math.min(innerHeight - bubble.offsetHeight - 12, box.top - bubble.offsetHeight - 22))}px`;
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
      pet.style.setProperty('--scale', settings.size / 192);
      pet.style.width = `${settings.size}px`;
      pet.style.height = `${settings.size * 208 / 192}px`;
      if (settings.position) {
        pet.style.left = `${Math.max(0, innerWidth - settings.size) * settings.position.x}px`;
        pet.style.top = `${Math.max(0, innerHeight - settings.size * 208 / 192) * settings.position.y}px`;
        pet.style.right = pet.style.bottom = 'auto';
      }
    };
    const pull = async (force = false) => {
      if (busy || disposed) return;
      busy = true;
      try {
        const value = await call(force ? 'refresh' : 'state');
        if (disposed) return;
        if (!state || value.settings.intervalMinutes !== settings.intervalMinutes) nextReport = performance.now() + value.settings.intervalMinutes * 60000;
        state = value; settings = validateSettings(value.settings); positionPet();
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
      if (disposed) return;
      if (!document.hidden && settings.enabled && now >= nextReport) { speak('timer'); nextReport = now + settings.intervalMinutes * 60000; }
      if (!bubble.hidden && now >= hideReport) bubble.hidden = true;
      const action = dragging ? (dragging.dx < 0 ? 'running-left' : 'running-right') : now < transientUntil ? transientState : state?.activity ?? 'idle';
      if (currentAnimation !== action) { currentAnimation = action; animationStart = now; }
      const animation = STATES[currentAnimation] ?? STATES.idle;
      const cycle = animation.durations.reduce((a, b) => a + b, 0);
      let elapsed = (now - animationStart) % cycle, column = 0;
      while (column < animation.durations.length - 1 && elapsed >= animation.durations[column]) { elapsed -= animation.durations[column++]; }
      sprite.style.backgroundPosition = `${-192 * column}px ${-208 * animation.row}px`;
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
      for (const key of ['monthlyBudget', 'tokenBudget']) form.elements[key].value = settings[key] ?? '';
      for (const input of root.querySelectorAll('[name="topic"]')) input.checked = settings.topics.includes(input.value);
      $('.size-value').textContent = settings.size;
      $('.rates').replaceChildren();
      for (const route of new Set([...(state?.routes ?? []), ...Object.keys(settings.rates)])) rateRow(route, settings.rates[route]);
      panel.showModal(); status('设置保存在本机。花费为估算，余额来自账户接口。');
    };
    on($('.settings-trigger'), 'click', openSettings);
    on(sprite, 'contextmenu', event => { event.preventDefault(); openSettings(); });
    on($('.close'), 'click', () => panel.close());
    on($('.add-rate'), 'click', () => rateRow());
    on($('.speak'), 'click', () => speak());
    on($('.refresh'), 'click', () => pull(true));
    on(form.elements.size, 'input', () => { $('.size-value').textContent = form.elements.size.value; });
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
        const next = validateSettings({ ...settings, enabled: data.has('enabled'),
          topics: data.getAll('topic'), selection: data.get('selection'), scope: data.get('scope'), currency: data.get('currency'), rates,
          intervalMinutes: Number(data.get('intervalMinutes')), displaySeconds: Number(data.get('displaySeconds')), size: Number(data.get('size')),
          monthlyBudget: data.get('monthlyBudget') === '' ? null : Number(data.get('monthlyBudget')),
          tokenBudget: data.get('tokenBudget') === '' ? null : Number(data.get('tokenBudget')),
        });
        settings = validateSettings(await call('settings', next));
        nextReport = performance.now() + settings.intervalMinutes * 60000; previous = undefined; cursor = 0;
        positionPet(); await pull(); status('已保存，新的间隔从现在开始计时。');
      } catch (error) { status(error.message); }
      finally { button.disabled = false; }
    });
    on(sprite, 'pointerdown', event => {
      if (event.button !== 0) return;
      const box = pet.getBoundingClientRect(); moved = false;
      dragging = { pointer: event.pointerId, x: event.clientX, y: event.clientY, left: box.left, top: box.top, dx: 0 };
      sprite.setPointerCapture(event.pointerId);
    });
    on(sprite, 'pointermove', event => {
      if (!dragging) return;
      const dx = event.clientX - dragging.x, dy = event.clientY - dragging.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      dragging.dx = dx;
      if (!moved) return;
      pet.style.right = pet.style.bottom = 'auto';
      pet.style.left = `${Math.max(0, Math.min(innerWidth - settings.size, dragging.left + dx))}px`;
      pet.style.top = `${Math.max(0, Math.min(innerHeight - settings.size * 208 / 192, dragging.top + dy))}px`;
    });
    const endDrag = async event => {
      if (!dragging || event.pointerId !== dragging.pointer) return;
      dragging = undefined;
      if (moved) {
        const box = pet.getBoundingClientRect();
        const next = { ...settings, position: { x: box.left / Math.max(1, innerWidth - box.width), y: box.top / Math.max(1, innerHeight - box.height) } };
        try { settings = validateSettings(await call('settings', next)); } catch (error) { status(error.message); }
      } else { transientState = 'waving'; transientUntil = performance.now() + 1500; speak(); }
    };
    on(sprite, 'pointerup', endDrag); on(sprite, 'pointercancel', endDrag);
    on(window, 'resize', positionPet);
    on(document, 'visibilitychange', () => { if (!document.hidden) { nextReport = performance.now() + settings.intervalMinutes * 60000; void pull(); } });
    positionPet(); frameId = requestAnimationFrame(animate);
    void loadAsset();
    void pull(); pollTimer = setInterval(() => { if (!document.hidden) { void pull(); void loadAsset(); } }, 5000);
    return () => { disposed = true; abort.abort(); cancelAnimationFrame(frameId); clearInterval(pollTimer); listeners.forEach(dispose => dispose()); host.remove(); };
  });
}
