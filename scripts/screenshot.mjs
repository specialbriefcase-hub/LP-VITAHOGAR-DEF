// Screenshot helper: drives headless Chrome via puppeteer.
// Usage: node screenshot.mjs http://localhost:5501 [label]
// Saves to temporary_screenshots/screenshot-N(-label).png (auto-incremented).
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://localhost:5501';
const label = process.argv[3] || '';
const root = resolve(process.cwd());
const outDir = join(root, 'temporary_screenshots');
if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

// Find the next index by scanning existing files.
const existing = await readdir(outDir).catch(() => []);
const nums = existing
  .map(n => n.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map(m => Number(m[1]));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const filename = `screenshot-${next}${label ? '-' + label : ''}.png`;
const outPath = join(outDir, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('requestfailed', r => errors.push('requestfailed: ' + r.url() + ' ' + r.failure()?.errorText));

await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
// Give Tailwind CDN a beat to apply generated styles.
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: outPath, fullPage: true });

const consoleLog = errors.length ? '\n\nConsole/page issues:\n' + errors.join('\n') : '';
await writeFile(outPath + '.log.txt',
  `URL: ${url}\nLabel: ${label || '(none)'}\nSaved: ${outPath}${consoleLog}\n`,
  'utf8');

await browser.close();
console.log('Saved:', outPath);
if (errors.length) console.log('Issues:\n' + errors.join('\n'));
