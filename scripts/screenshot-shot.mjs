/**
 * ショット確認用スクリーンショット
 * フラット/スライス等のショット線バグを視覚的に確認するためのスクリプト
 *
 * 使い方:
 *   node scripts/screenshot-shot.mjs [--url=http://localhost:5173]
 *
 * 操作内容:
 * 1. 自コート (row=7, col=2) をクリック → ショット入力開始
 * 2. 相手コート (row=2, col=2) をクリック → ショット確定
 * -> ショット線が1バウンド目以降も伸びているかを確認
 */

import { chromium } from "playwright";
import { mkdirSync } from "fs";

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : def;
};

const url = getArg("url", "http://localhost:5173");
const width = 390;
const height = 844;

mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

console.log(`Navigating to ${url} ...`);
await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
await page.waitForTimeout(500);

// ---- ヘルパー ----
async function clickCell(row, col, label = "") {
  const cell = page.locator(`[data-row="${row}"][data-col="${col}"]`);
  const count = await cell.count();
  if (count === 0) {
    console.warn(`Cell [${row},${col}] not found`);
    return false;
  }
  // force: true でオーバーレイ要素を無視してクリック
  await cell.click({ force: true });
  await page.waitForTimeout(300);
  if (label) console.log(`  Clicked cell [${row},${col}] ${label}`);
  return true;
}

async function shot(label) {
  await page.screenshot({ path: `screenshots/${label}.png` });
  console.log(`Screenshot: ${label}.png`);
}

// ---- 初期状態 ----
await shot("01-initial");

// ---- 自コート側のセル一覧確認 ----
const allCells = await page.locator("[data-row][data-col]").all();
console.log(`Found ${allCells.length} cells with data-row/data-col`);

if (allCells.length === 0) {
  console.error("No cells found. Check if data-row/data-col attributes are set.");
  await browser.close();
  process.exit(1);
}

// グリッドのrow/col範囲を確認
const rowCols = await Promise.all(
  allCells.slice(0, 5).map(async (c) => {
    const r = await c.getAttribute("data-row");
    const co = await c.getAttribute("data-col");
    return `[${r},${co}]`;
  })
);
console.log("Sample cells:", rowCols.join(", "));

// ---- ショット1球: 自コート(row=7,col=2) → 相手コート(row=2,col=2) ----
console.log("\n--- Setting up flat shot ---");
await clickCell(7, 2, "(P1 hit)");
await shot("02-first-click");

await clickCell(2, 2, "(bounce target)");
await shot("03-second-click");

// P2アイコンをドラッグして返球位置を確定させる (もし必要なら)
// とりあえず別のセルをクリックしてautoFinalizeを試みる
await clickCell(6, 3, "(next click to auto-finalize)");
await shot("04-after-auto-finalize");

console.log("\nDone. Check screenshots/ directory.");
await browser.close();
