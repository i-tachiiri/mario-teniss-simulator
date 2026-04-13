/**
 * スクリーンショットスクリプト
 * 使い方: npm run screenshot [-- --url=http://localhost:5173] [-- --out=screenshots/current.png]
 *
 * 前提: 開発サーバーが起動していること (npm run dev)
 */

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname } from "path";

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : def;
};

const url = getArg("url", "http://localhost:5173");
const outPath = getArg("out", "screenshots/current.png");
const width = parseInt(getArg("width", "390"), 10);  // iPhone 14 Pro width
const height = parseInt(getArg("height", "844"), 10); // iPhone 14 Pro height

mkdirSync(dirname(outPath), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

console.log(`Navigating to ${url} ...`);
await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });

// アニメーションが落ち着くまで少し待つ
await page.waitForTimeout(500);

await page.screenshot({ path: outPath, fullPage: false });
console.log(`Screenshot saved: ${outPath}`);

await browser.close();
