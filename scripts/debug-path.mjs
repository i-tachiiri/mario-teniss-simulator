/**
 * SVGパスのd属性を取得してバグを診断 (確定ショット比較)
 *
 * フロー:
 * 1. セルA (上コート) をクリック → awaiting
 * 2. セルB (下コート) をクリック → セルAのショットを自動確定 + 新awaiting
 * 3. 戻すボタン → セルBのawaitingをキャンセル → セルAのショットがidle表示される
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const args = process.argv.slice(2);
const url = args.find(a => a.startsWith('--url='))?.split('=')[1] ?? 'http://localhost:5173';

mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await context.newPage();

async function getSvgPaths() {
  return page.evaluate(() => {
    const paths = document.querySelectorAll('svg path');
    return Array.from(paths).map(p => ({
      d: p.getAttribute('d'),
      stroke: p.getAttribute('stroke'),
    })).filter(p => p.d);
  });
}

async function clickCell(row, col) {
  await page.locator(`[data-row="${row}"][data-col="${col}"]`).click({ force: true });
  await page.waitForTimeout(400);
}

async function selectShotType(label) {
  const shotBtn = page.locator('button', { hasText: 'SHOT' });
  if (await shotBtn.count() > 0) {
    await shotBtn.click({ force: true });
    await page.waitForTimeout(400);
    const typeBtn = page.locator(`.shot-btn:has-text("${label}")`).first();
    if (await typeBtn.count() > 0) {
      await typeBtn.click({ force: true });
      await page.waitForTimeout(300);
    }
  }
}

async function cancelAwaiting() {
  // 戻すボタンでawaitingをキャンセル
  const undoBtn = page.locator('button:has-text("戻す")');
  if (await undoBtn.count() > 0) {
    await undoBtn.click({ force: true });
    await page.waitForTimeout(300);
  }
}

function printPaths(paths, indent = "  ") {
  for (const p of paths) {
    console.log(`${indent}${p.stroke}: ${p.d}`);
  }
}

// ---- 強フラット: confirmed idle state ----
await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(600);
await selectShotType('強フラット');

// Shot 1: 上コート (row=2, col=2)
await clickCell(2, 2);
console.log("Step 1: After clicking [2,2] (awaiting):");
printPaths(await getSvgPaths());
await page.screenshot({ path: "screenshots/debug-flat-awaiting.png" });

// Shot 2: 下コート (row=7, col=2) → Shot 1 が自動確定される
await clickCell(7, 2);
console.log("\nStep 2: After clicking [7,2] (shot1 confirmed, shot2 awaiting):");
printPaths(await getSvgPaths());
await page.screenshot({ path: "screenshots/debug-flat-after-2nd-click.png" });

// Shot 2のawaitingをキャンセル → Shot 1 idle表示
await cancelAwaiting();
console.log("\nStep 3: After cancel (shot1 idle display):");
printPaths(await getSvgPaths());
await page.screenshot({ path: "screenshots/debug-flat-idle.png" });

// ---- ドロップ ----
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await selectShotType('ドロップ');
await clickCell(2, 2);
await clickCell(7, 2);
await cancelAwaiting();
console.log("\n=== ドロップ (shot1 idle display) ===");
printPaths(await getSvgPaths());
await page.screenshot({ path: "screenshots/debug-drop-idle.png" });

await browser.close();

console.log("\n✓ Screenshots saved in screenshots/ directory");
