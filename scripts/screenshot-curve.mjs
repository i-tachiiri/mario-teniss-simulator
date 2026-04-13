/**
 * カーブ（右曲がり・左曲がり）のショット形状を確認するスクリーンショット
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const args = process.argv.slice(2);
const url = args.find(a => a.startsWith('--url='))?.split('=')[1] ?? 'http://localhost:5173';
mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await context.newPage();

async function clickCell(row, col) {
  await page.locator(`[data-row="${row}"][data-col="${col}"]`).click({ force: true });
  await page.waitForTimeout(400);
}

async function selectShotType(label) {
  const btn = page.locator('button', { hasText: 'SHOT' });
  await btn.click({ force: true });
  await page.waitForTimeout(400);
  await page.locator(`.shot-btn:has-text("${label}")`).first().click({ force: true });
  await page.waitForTimeout(300);
}

async function clickCurveButton(direction, times = 3) {
  // delta: +1 = 左→右, -1 = 右→左
  const delta = direction === 'right' ? 1 : -1;
  for (let i = 0; i < times; i++) {
    // ボタンはテキストに矢印記号があるので evaluate で直接クリック
    await page.evaluate((d) => {
      const buttons = [...document.querySelectorAll('button')];
      const label = d > 0 ? '左→右' : '右→左';
      const btn = buttons.find(b => b.textContent?.includes(label));
      btn?.click();
    }, delta);
    await page.waitForTimeout(150);
  }
  console.log(`  Applied ${times}x curve (delta=${delta})`);
}

// ---- 強フラット ノーカーブ ----
await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(600);
await selectShotType('強フラット');
await clickCell(2, 2);  // 相手コート中央左
await page.screenshot({ path: 'screenshots/curve-0-none.png' });
console.log('curve-0-none.png (no curve)');

// ---- 右カーブ (右→左 ボタンを3回) ----
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(600);
await selectShotType('強フラット');
await clickCell(2, 2);
await clickCurveButton('right', 3);
await page.screenshot({ path: 'screenshots/curve-1-right.png' });
console.log('curve-1-right.png (right curve x3)');

// ---- 左カーブ ----
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(600);
await selectShotType('強フラット');
await clickCell(2, 2);
await clickCurveButton('left', 3);
await page.screenshot({ path: 'screenshots/curve-2-left.png' });
console.log('curve-2-left.png (left curve x3)');

// ---- 強カーブ(5回) ----
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(600);
await selectShotType('強フラット');
await clickCell(2, 2);
await clickCurveButton('right', 5);
await page.screenshot({ path: 'screenshots/curve-3-max.png' });
console.log('curve-3-max.png (right curve x5 max)');

await browser.close();
console.log('\nDone. Check screenshots/curve-*.png');
