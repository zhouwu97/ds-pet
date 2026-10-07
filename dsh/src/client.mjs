import { petFrame, petDirection, petPosition, petBubble } from './motion.js';
import { DEFAULT_SETTINGS, validateSettings, chooseTopic, reportText } from './core.mjs';

export const name = 'ds-jingjing-pet';
export const inject = ['connection'];

/** Mount only this plugin's Shadow DOM; unload removes listeners and timers. */
export function apply(ctx) {
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
