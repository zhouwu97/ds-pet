import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { DEFAULT_SETTINGS } from '../../dsh/src/core.mjs';

test('Web bubble follows the character in-card, after resizing and in floating mode', async ({ page }) => {
  await page.goto('/');
  const pet = page.locator('jingjing-pet');
  await expect(pet).toHaveAttribute('data-asset', 'ready');
  await pet.locator('summary').click();
  await pet.getByLabel('角色大小').fill('128');
  const sprite = page.locator('jingjing-pet .body, .jingjing-roamer .body'), bubble = page.locator('jingjing-pet .bubble, .jingjing-roamer .bubble');
  const beforePet = await sprite.boundingBox(), beforeBubble = await bubble.boundingBox();
  await page.mouse.move(beforePet.x + 64, beforePet.y + 70);
  await page.mouse.down(); await page.mouse.move(beforePet.x + 29, beforePet.y + 42, { steps: 6 }); await page.mouse.up();
  const afterPet = await sprite.boundingBox(), afterBubble = await bubble.boundingBox();
  expect(afterPet.x - beforePet.x).toBeCloseTo(-35, 0);
  expect(afterBubble.x - beforeBubble.x).toBeCloseTo(afterPet.x - beforePet.x, 0);
  expect(afterBubble.y - beforeBubble.y).toBeCloseTo(afterPet.y - beforePet.y, 0);
  await pet.getByRole('button', { name: '放出来 ↗' }).click();
  await expect.poll(() => page.locator('.jingjing-roamer').evaluate(el => el.getAnimations().length)).toBe(0);
  const floatPet = await sprite.boundingBox(), floatBubble = await bubble.boundingBox();
  await page.mouse.move(floatPet.x + 64, floatPet.y + 70);
  await page.mouse.down(); await page.mouse.move(floatPet.x - 80, floatPet.y - 30, { steps: 6 }); await page.mouse.up();
  const movedPet = await sprite.boundingBox(), movedBubble = await bubble.boundingBox();
  expect(movedBubble.x - floatBubble.x).toBeCloseTo(movedPet.x - floatPet.x, 0);
  expect(movedBubble.y - floatBubble.y).toBeCloseTo(movedPet.y - floatPet.y, 0);
  await pet.getByRole('button', { name: '回到原位' }).click();
  await expect(page.locator('.jingjing-roamer')).toHaveCount(0);
  await pet.evaluate(el => el.play('waving', '今天也请多多关照，鲸鲸会一直陪着你！'));
  await page.setViewportSize({ width: 390, height: 844 });
  const stage = await pet.locator('.stage').boundingBox(), text = await bubble.boundingBox();
  expect(text.x).toBeGreaterThanOrEqual(stage.x);
  expect(text.x + text.width).toBeLessThanOrEqual(stage.x + stage.width);
  expect(text.y).toBeGreaterThanOrEqual(stage.y);
  await page.screenshot({ path: 'docs/screenshots/web-bubble-follows.png' });
});

test('Web: gestures, sleep, floating bounds, preferences and reconnect', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  const pet = page.locator('jingjing-pet');
  await expect(pet).toHaveAttribute('data-asset', 'ready');
  await pet.getByRole('button', { name: '招招手', exact: true }).click();
  await expect(pet).toHaveAttribute('data-state', 'waving');
  await pet.getByRole('button', { name: '休息', exact: true }).click();
  await expect(pet).toHaveAttribute('data-state', 'sleep');
  await pet.getByRole('button', { name: '唤醒', exact: true }).click();
  await pet.getByRole('button', { name: '放出来 ↗' }).click();
  await expect(pet).toHaveAttribute('floating', '');
  const roamer = page.locator('.jingjing-roamer');
  await expect.poll(() => roamer.evaluate(el => el.getAnimations().length)).toBe(0);
  const body = roamer.locator('.body');
  let box = await body.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(3, 3, { steps: 8 }); await page.mouse.up();
  box = await roamer.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
  await page.setViewportSize({ width: 390, height: 844 });
  box = await roamer.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(391);
  await pet.getByRole('button', { name: '回到原位' }).click();
  await expect(pet).not.toHaveAttribute('floating', '');
  await pet.locator('summary').click();
  await pet.getByLabel('角色大小').fill('160');
  await page.reload();
  await expect(pet.getByLabel('角色大小')).toHaveValue('160');
  await pet.evaluate(el => { const parent = el.parentNode; el.remove(); parent.append(el); });
  await expect(pet).toHaveAttribute('data-asset', 'ready');
  await pet.getByRole('button', { name: '投喂', exact: true }).click();
  await expect(pet.locator('.bubble')).toContainText('谢谢');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('Web: return gestures, interruption, reduced motion and floating cleanup', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const pet = page.locator('jingjing-pet'), roamer = page.locator('.jingjing-roamer');
  await expect(pet).toHaveAttribute('data-asset', 'ready');
  await pet.locator('.float').click();
  await expect(roamer).toHaveCount(1);
  // Interrupt departure with an immediate recall; there must never be a second actor.
  await pet.locator('.recall').click();
  await expect(roamer).toHaveCount(0);
  await expect(pet.locator('.body')).toHaveCount(1);
  await pet.locator('.float').click();
  await roamer.locator('.body').dblclick();
  await expect(roamer).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await pet.locator('.float').click();
  await expect.poll(() => roamer.evaluate(el => el.getAnimations().length)).toBe(0);
  await roamer.locator('.body').focus(); await page.keyboard.press('Escape');
  await expect(roamer).toHaveCount(0);
  await pet.locator('.float').focus(); await page.keyboard.press('Enter');
  await expect(roamer).toHaveCount(1);
  await expect.poll(() => roamer.evaluate(el => el.getAnimations().length)).toBe(0);
  await pet.evaluate(el => el.remove());
  await expect(roamer).toHaveCount(0);
  expect(errors).toEqual([]);
});

async function mountDSH(page) {
  const asset = (await readFile(new URL('../../codex/jingjing-spritesheet.png', import.meta.url))).toString('base64');
  const client = await readFile(new URL('../../dsh/lib/client.js', import.meta.url), 'utf8');
  await page.goto('/');
  await page.evaluate(({ defaults, asset }) => {
    document.body.innerHTML = '<h1 style="color:#dae3fc;font:28px system-ui;padding:40px">DSH · 鲸鲸娘交互验证</h1>';
    window.mockSettings = defaults; window.activity = 'idle'; window.writes = []; window.rpcCalls = 0;
    window.__ModuleLoader__ = { load({ factory }) {
      const plugin = factory();
      plugin.apply({ effect(fn) { window.unloadPet = fn(); }, connection: { rpc: { async call(_, endpoint, payload) {
        window.rpcCalls++;
        if (endpoint === 'jingjing/asset') return { ok: true, value: { dataUrl: 'data:image/png;base64,' + asset } };
        if (endpoint === 'jingjing/settings') { window.mockSettings = structuredClone(payload); window.writes.push(payload); return { ok: true, value: payload }; }
        return { ok: true, value: { settings: structuredClone(window.mockSettings), activity: window.activity, routes: [], usageStatus: 'loading', balance: { status: 'unavailable' } } };
      } } } });
    } };
  }, { defaults: DEFAULT_SETTINGS, asset });
  await page.addScriptTag({ content: client });
  await expect(page.locator('#ds-jingjing-pet')).toHaveAttribute('data-asset', 'ready');
  return page.locator('#ds-jingjing-pet');
}

test('DSH: gaze, hover, drag, keyboard, settings, session recovery and disposal', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const pet = await mountDSH(page), sprite = pet.locator('.sprite');
  await page.mouse.move(20, 20);
  await expect(sprite).toHaveAttribute('data-row', /9|10/);
  await sprite.hover(); await expect(sprite).toHaveAttribute('data-animation', 'jumping');
  await pet.locator('.sleep-toggle').click();
  await expect(sprite).toHaveAttribute('data-animation', 'sleep');
  await expect(sprite).toHaveCSS('background-position', '-576px 0px');
  await pet.locator('.sleep-toggle').click();
  await sprite.click(); await expect(sprite).toHaveAttribute('data-animation', 'waving');
  await page.mouse.move(20, 20);
  await expect(sprite).toHaveAttribute('data-animation', 'idle', { timeout: 4000 });
  let box = await sprite.boundingBox();
  await page.mouse.move(box.x + 100, box.y + 100); await page.mouse.down();
  await page.mouse.move(box.x - 120, box.y + 60, { steps: 8 });
  await expect(sprite).toHaveAttribute('data-animation', 'running-left');
  await page.mouse.up(); await page.mouse.move(20, 20);
  await expect.poll(() => page.evaluate(() => window.writes.length)).toBe(1);
  const before = await pet.locator('.pet').boundingBox();
  await page.waitForTimeout(5200); // Cross the real poll boundary: the pet must not snap back.
  const after = await pet.locator('.pet').boundingBox();
  expect(after.x).toBeCloseTo(before.x, 0);
  await sprite.focus(); await page.keyboard.press('ArrowLeft');
  await expect.poll(() => page.evaluate(() => window.writes.length)).toBe(2);
  await page.keyboard.press('Enter'); await expect(sprite).toHaveAttribute('data-animation', 'waving');
  await sprite.click({ button: 'right' });
  await expect(pet.locator('dialog')).toBeVisible();
  await pet.locator('[name=size]').fill('160');
  await expect(pet.locator('.pet')).toHaveCSS('width', '160px');
  await page.keyboard.press('Escape');
  await expect(pet.locator('.pet')).toHaveCSS('width', '192px');
  await sprite.click({ button: 'right' });
  await pet.getByLabel('减少动态效果', { exact: true }).check();
  await pet.getByRole('button', { name: '保存设置', exact: true }).click();
  await expect(pet.locator('.status')).toContainText('已保存');
  await pet.getByRole('button', { name: '关闭设置' }).click();
  await page.mouse.move(20, 20);
  await page.evaluate(() => { window.activity = 'running'; });
  await expect(sprite).toHaveAttribute('data-animation', 'running', { timeout: 7000 });
  await expect(sprite).toHaveCSS('background-position', '0px -1456px');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({ path: 'docs/screenshots/dsh-desktop.png' });
  await page.evaluate(() => window.unloadPet());
  await expect(pet).toHaveCount(0);
  const calls = await page.evaluate(() => window.rpcCalls);
  await page.waitForTimeout(5100);
  expect(await page.evaluate(() => window.rpcCalls)).toBe(calls);
  expect(errors).toEqual([]);
});

test('DSH: canceled drag and small viewport keep pet accessible', async ({ page }) => {
  const pet = await mountDSH(page);
  await page.setViewportSize({ width: 390, height: 640 });
  const sprite = pet.locator('.sprite');
  const initial = await sprite.boundingBox();
  await page.mouse.move(initial.x + 96, initial.y + 100); await page.mouse.down();
  await sprite.dispatchEvent('pointercancel', { pointerId: 1 });
  await page.mouse.up();
  const box = await pet.locator('.pet').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(391);
  await sprite.click({ button: 'right' });
  await pet.getByRole('button', { name: '回到原位' }).click();
  await expect.poll(() => page.evaluate(() => window.mockSettings.position)).toBe(null);
});
