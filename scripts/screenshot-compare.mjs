/**
 * ドロップ vs フラットのショット線を比較するスクリーンショット
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

async function runScenario(shotLabel, fileLabel) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(500);

  // SHOTボタンをクリックしてシートを開く
  const shotBtn = page.locator('button', { hasText: "SHOT" });
  if (await shotBtn.count() > 0) {
    await shotBtn.click({ force: true });
    await page.waitForTimeout(500);

    // ショット種別ボタンをクリック
    const typeBtn = page.locator(`.shot-btn:has-text("${shotLabel}")`).first();
    if (await typeBtn.count() > 0) {
      await typeBtn.click({ force: true });
      await page.waitForTimeout(300);
      console.log(`  Selected: ${shotLabel}`);
    } else {
      console.warn(`  Shot button not found: ${shotLabel}`);
    }
    await page.waitForTimeout(300);
  }

  // 相手コートのセルをクリック (row=2, col=2) - P1からP2へのショット
  await page.locator('[data-row="2"][data-col="2"]').click({ force: true });
  await page.waitForTimeout(400);

  await page.screenshot({ path: `screenshots/compare-${fileLabel}.png` });
  console.log(`Screenshot: compare-${fileLabel}.png (${shotLabel})`);

  await browser.close();
}

console.log("Comparing drop vs flat shot paths...");
await runScenario("強フラット", "strong-flat");
await runScenario("ドロップ", "drop");
await runScenario("飛びつき", "jump");
console.log("Done. Compare screenshots/compare-*.png");
