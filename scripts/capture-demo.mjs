import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.DEMO_URL ?? "http://localhost:3000";
const AMOUNT = process.env.DEMO_AMOUNT ?? "10000";
const OUT_DIR = join(process.cwd(), "docs", "demo");
const RAW_VIDEO = join(OUT_DIR, "demo.webm");
const OUT_GIF = join(OUT_DIR, "demo.gif");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ recordVideo: { dir: OUT_DIR, size: { width: 800, height: 600 } } });

try {
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });

  await page.fill("#amount", AMOUNT);
  await page.waitForTimeout(500);
  await page.click("button");
  await page.waitForTimeout(4000);
} finally {
  await browser.close();
}

const videoFile = execSync(`ls -t ${OUT_DIR}/*.webm | head -1`).toString().trim();
execSync(`ffmpeg -y -i "${videoFile}" -vf "fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ${OUT_GIF}`, {
  stdio: "inherit",
});

console.log(`GIF saved to ${OUT_GIF}`);