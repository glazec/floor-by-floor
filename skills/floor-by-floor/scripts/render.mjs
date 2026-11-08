#!/usr/bin/env node
// floor-by-floor renderer: JSON -> HTML -> 2160x2700 PNG (via headless Chrome).
// Zero dependencies. Usage: node render.mjs <data.json> [out.png]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname, basename, join } from "node:path";
import { pathToFileURL } from "node:url";

const [, , inPath, outArg] = process.argv;
if (!inPath) {
  console.error("Usage: node render.mjs <data.json> [out.png]");
  process.exit(1);
}
const data = JSON.parse(readFileSync(inPath, "utf8"));
const outPng = resolve(outArg || join(dirname(inPath), basename(inPath, ".json") + ".png"));
const outHtml = outPng.replace(/\.png$/i, ".html");

// ---------- icons (24x24, stroke = ink, fills = accent) ----------
const A = "var(--accent)";
const ICONS = {
  cube: `<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke="${A}"/>`,
  lock: `<rect x="5" y="10" width="14" height="10"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/><circle cx="12" cy="15" r="1.8" fill="${A}"/>`,
  video: `<rect x="3" y="6" width="13" height="12"/><path d="M16 10l5-3v10l-5-3z" fill="${A}"/>`,
  image: `<rect x="3" y="4" width="18" height="16"/><path d="M3 17l6-6 4 4 3-3 5 5"/><circle cx="16" cy="8.5" r="1.8" fill="${A}"/>`,
  mic: `<rect x="9" y="3" width="6" height="11" rx="3" fill="${A}"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>`,
  code: `<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/><path d="M14 5l-4 14" stroke="${A}" stroke-width="2.2"/>`,
  chip: `<rect x="6" y="6" width="12" height="12"/><rect x="9" y="9" width="6" height="6" fill="${A}"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>`,
  core: `<rect x="7" y="7" width="10" height="10" fill="${A}"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>`,
  nodes: `<circle cx="6" cy="6" r="2.5" fill="${A}"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 6.5l7 4.5M8.5 17.5l7-4.5"/>`,
  sliders: `<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2" fill="${A}"/><circle cx="8" cy="17" r="2" fill="${A}"/>`,
  chat: `<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5" stroke="${A}"/>`,
  globe: `<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>`,
  pulse: `<path d="M3 12h4l2-5 4 10 2-5h6" stroke="${A}" stroke-width="2.2"/>`,
  phone: `<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 9l5 3-5 3z" fill="${A}"/>`,
  terminal: `<rect x="3" y="4" width="18" height="16"/><path d="M7 10l3 2.5L7 15M12 15h5"/><rect x="3" y="4" width="18" height="3" fill="${A}"/>`,
  cursor: `<path d="M5 3l14 7-6 2-2 6z" fill="${A}"/>`,
  search: `<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20" stroke-width="2.6"/><circle cx="10" cy="10" r="2.5" fill="${A}"/>`,
  cart: `<path d="M3 4h2.5l2.2 11h10.5l2-8H6.6"/><circle cx="9" cy="19" r="1.6" fill="${A}"/><circle cx="17" cy="19" r="1.6" fill="${A}"/>`,
  arrows: `<path d="M4 8h13l-3-3M20 16H7l3 3"/><circle cx="20" cy="8" r="1.8" fill="${A}"/>`,
  grid: `<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7" fill="${A}"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>`,
  megaphone: `<path d="M4 10v4h3l7 4V6L7 10z" fill="${A}"/><path d="M17 9a4 4 0 0 1 0 6"/>`,
  heart: `<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="${A}"/>`,
  flask: `<path d="M9 3h6M10 3v6l-5 10a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10l2 4.5H5z" fill="${A}"/>`,
  spark: `<path d="M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7z" fill="${A}"/>`,
  card: `<rect x="3" y="6" width="18" height="12" rx="1"/><rect x="3" y="9" width="18" height="3" fill="${A}"/>`,
  bank: `<path d="M3 9l9-5 9 5z" fill="${A}"/><path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18"/>`,
  coin: `<ellipse cx="12" cy="8" rx="7" ry="3" fill="${A}"/><path d="M5 8v8c0 1.7 3.1 3 7 3s7-1.3 7-3V8M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>`,
  shield: `<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4" stroke="${A}" stroke-width="2.2"/>`,
  user: `<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6z" fill="${A}"/>`,
  doc: `<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 13h6M9 16h4" stroke="${A}"/>`,
  db: `<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/><ellipse cx="12" cy="6" rx="7" ry="2.5" fill="${A}"/>`,
  cloud: `<path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 4.5 4.5 0 0 1 17 18z"/><path d="M9 14h6" stroke="${A}" stroke-width="2.2"/>`,
  bolt: `<path d="M13 3L5 14h6l-1 7 8-11h-6z" fill="${A}"/>`,
  chart: `<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="6" fill="${A}"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13" fill="${A}"/>`,
  link: `<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" stroke="${A}"/>`,
  robot: `<rect x="5" y="8" width="14" height="11" rx="2"/><circle cx="9.5" cy="13" r="1.5" fill="${A}"/><circle cx="14.5" cy="13" r="1.5" fill="${A}"/><path d="M12 4v4M9 17h6"/>`,
  servers: `<rect x="1" y="3" width="10" height="14"/><rect x="14" y="3" width="10" height="14" fill="${A}"/><path d="M3 7h6M3 10h6M3 13h6"/>`,
  box: `<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10" stroke="${A}"/>`,
  store: `<path d="M4 9l1.5-5h13L20 9z" fill="${A}"/><path d="M5 9v11h14V9M10 20v-6h4v6"/>`,
};
const icon = (name, cls = "") =>
  name && ICONS[name]
    ? `<svg class="${cls}" viewBox="0 0 ${name === "servers" ? "25 20" : "24 24"}" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${ICONS[name]}</svg>`
    : "";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const txt = (s) => esc(s).replace(/\n/g, "<br>");

// ---------- layout ----------
const floors = data.floors || []; // bottom -> top
const N = floors.length;
if (N < 2 || N > 8) throw new Error("floors must have 2..8 entries (bottom to top)");
const TOP = 552, BOTTOM = 1640, FH = (BOTTOM - TOP) / N;
const ordered = [...floors].reverse(); // top -> bottom for drawing (k = 0 is the top floor)

let mainSeps = "", boughtBands = "", floorDivs = "", boughtDivs = "", labelDivs = "";

ordered.forEach((f, k) => {
  const num = String(N - k).padStart(2, "0");
  const yTop = TOP + k * FH;
  const yBot = TOP + (k + 1) * FH;
  const sep = k === 0 ? 5 : 9;
  mainSeps += `<rect x="382" y="${yTop}" width="650" height="${sep}"/>`;

  // built cells
  const built = f.built || [];
  const small = built.length >= 5 || built.some((b) => String(b.label).replace(/\n/g, " ").length > 22);
  const cells = built
    .map(
      (b) =>
        `<div class="cell${f.highlight ? " hi" : ""}${small ? " sm" : ""}" style="flex:${b.flex || 1} 1 0">${icon(b.icon)}${txt(b.label)}${
          b.sub ? `<span class="subl">${txt(b.sub)}</span>` : ""
        }</div>`
    )
    .join("");
  floorDivs += `<div class="floor" style="top:${yTop + sep}px;height:${yBot - yTop - sep}px">${cells}</div>`;

  // bought column (offset up by 20 for perspective)
  const bandTop = k === 0 ? 532 : yTop - 26;
  const bandH = k === 0 ? 14 : 18;
  boughtBands += `<rect x="1052" y="${bandTop}" width="386" height="${bandH}" fill="url(#hatchLight)"/>`;
  const bTop = bandTop + bandH;
  const bBot = k === N - 1 ? 1620 : TOP + (k + 1) * FH - 26;
  const items = f.bought?.items || [];
  const layout = f.bought?.layout || (items.length >= 3 ? "rows" : "boxes");
  const meta = (it) =>
    [it.year, it.value ? `<b>${esc(it.value)}</b>` : "", it.pending ? "<b>pending</b>" : "", it.note ? esc(it.note) : ""]
      .filter(Boolean)
      .join(" ");
  let inner = "";
  if (items.length && layout === "rows") {
    inner = items
      .map((it) => {
        const fs = it.name.length > 11 ? 24 : 28;
        return `<div class="row${it.pending ? " pending" : ""}"><span class="wm" style="font-size:${fs}px">${esc(it.name)}</span><span class="meta">${meta(it)}</span></div>`;
      })
      .join("");
    boughtDivs += `<div class="bought rows" style="top:${bTop}px;height:${bBot - bTop}px">${inner}</div>`;
  } else if (items.length) {
    inner = items
      .map((it) => {
        const max = items.length === 1 ? 16 : 8;
        const fs = it.name.length > max ? (items.length === 1 ? 28 : 24) : 34;
        const m = meta(it);
        const metaHtml = it.pending && items.length > 1
          ? `${it.year ?? ""}${it.value ? ` <b>${esc(it.value)}</b>` : ""}<br><b>pending</b>`
          : m;
        return `<div class="bx${it.pending ? " pending" : ""}" style="flex:${it.flex || 1}"><span class="wm" style="font-size:${fs}px">${esc(it.name)}</span><span class="meta">${metaHtml}</span></div>`;
      })
      .join("");
    boughtDivs += `<div class="bought" style="top:${bTop}px;height:${bBot - bTop}px">${inner}</div>`;
  } else {
    boughtDivs += `<div class="bought" style="top:${bTop}px;height:${bBot - bTop}px"><div class="bx empty">nothing bought</div></div>`;
  }

  // left label
  labelDivs += `<div class="label" style="top:${yTop + FH / 2 - 30}px">${icon(f.icon || built[0]?.icon)}<div><div class="n">${num}</div><div class="t"${
    f.highlight ? ' style="color:var(--accent)"' : ""
  }>${esc(f.name)}</div></div><div class="dash"></div></div>`;
});

const company = data.company || "Company";
const titleBold = data.title_bold || `${company}, floor by floor:`;
const titleRest = data.title_rest ?? "what it built, what it bought";
const sign = data.sign || company;
const accent = data.accent || "#1a1a6e";
const highlightBg = data.highlight_bg || "#cfdfff";
const bm = data.basement;
const basementHtml = bm
  ? `<div class="base">${icon(bm.icon || "servers", "bicon")}<div><div class="big">${esc(bm.name)}</div>${
      bm.line ? `<div class="mono bl">${esc(bm.line)}</div>` : ""
    }</div></div>`
  : "";
const author = data.author
  ? `<div class="author"><span class="an">${esc(data.author.name || "")}</span><span class="ah">${esc(data.author.handle || "")}</span></div>`
  : "";

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{--ink:#0b0b1a;--accent:${accent};--hi:${highlightBg};--grey:#7a7a85}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1600px;height:2000px;background:#fff;overflow:hidden}
body{font-family:'Inter',Helvetica,Arial,sans-serif;color:var(--ink);position:relative}
.mono{font-family:'IBM Plex Mono',Menlo,monospace}
svg.deco{position:absolute;left:0;top:0}
.author{position:absolute;left:92px;top:66px;font-size:34px;display:flex;gap:18px;align-items:baseline}
.author .an{font-weight:600}.author .ah{color:var(--grey);font-size:30px}
h1{position:absolute;left:88px;top:150px;font-size:${data.title_size || Math.min(66, Math.floor((66 * 53) / (titleBold.length + titleRest.length + 1)))}px;letter-spacing:-2.6px;font-weight:400;white-space:nowrap}
h1 b{font-weight:800}
.strip{position:absolute;height:38px;border:3px solid var(--ink);border-bottom:none;background:#fff;font-family:'IBM Plex Mono',monospace;font-size:24px;padding:3px 18px}
.floor{position:absolute;left:385px;width:644px;display:flex;gap:12px;padding:13px}
.cell{flex:1;border:2.5px solid var(--ink);background:#fff;position:relative;padding:14px 16px;display:flex;flex-direction:column;justify-content:flex-end;font-size:25px;font-weight:500;line-height:1.15}
.cell.hi{background:var(--hi)}
.cell svg{position:absolute;left:16px;top:16px;width:34px;height:34px}
.cell.sm{font-size:22px;padding:12px 10px}.cell.sm svg{left:10px}
.subl{font-size:20px;font-weight:500;margin-top:2px}
.label{position:absolute;left:92px;width:280px;display:flex;align-items:center;gap:20px}
.label svg{width:44px;height:44px;flex:none}
.label .n{font-size:22px;color:var(--grey)}
.label .t{font-size:29px;font-weight:500;margin-top:2px;white-space:nowrap}
.label .dash{flex:1;border-top:2px dashed #999;height:0;margin-top:22px;min-width:10px}
.bought{position:absolute;left:1055px;width:380px;display:flex;gap:12px;padding:13px}
.bx{flex:1;border:2.5px solid var(--ink);background:#fff;padding:14px 16px;display:flex;flex-direction:column;justify-content:center;min-width:0}
.bx.pending,.row.pending{border:3px dashed var(--ink)}
.bx.empty{border:2.5px dashed #aaa;color:#999;font-family:'IBM Plex Mono',monospace;font-size:20px;align-items:center}
.wm{font-size:34px;font-weight:800;letter-spacing:-1px;line-height:1.05;overflow-wrap:anywhere}
.meta{font-family:'IBM Plex Mono',monospace;font-size:22px;color:#333;margin-top:10px;line-height:1.25}
.meta b{color:var(--ink)}
.rows{flex-direction:column;gap:8px}
.row{border:2.5px solid var(--ink);background:#fff;flex:1;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 16px;min-height:0}
.row .meta{margin:0;white-space:nowrap;font-size:21px}
.base{position:absolute;left:346px;top:1698px;width:1062px;height:96px;background:#fff;border:3px solid var(--ink);display:flex;align-items:center;justify-content:center;gap:26px}
.base .bicon{width:54px;height:44px}
.base .big{font-size:46px;font-weight:800;font-style:italic;letter-spacing:-1px;line-height:1}
.base .bl{font-size:22px;margin-top:6px}
.src{position:absolute;left:92px;top:1900px;font-family:'IBM Plex Mono',monospace;font-size:18px;color:var(--grey);max-width:1420px}
.sign{position:absolute;left:588px;top:336px;width:322px;height:100px;border:3.5px solid var(--ink);background:#fff;display:flex;align-items:center;justify-content:center;font-size:${sign.length > 9 ? 42 : 58}px;font-weight:800;letter-spacing:-2px;white-space:nowrap;overflow:hidden}
</style></head><body>
${author}
<h1><b>${esc(titleBold)}</b> ${esc(titleRest)}</h1>
<svg class="deco" width="1600" height="2000" viewBox="0 0 1600 2000">
<defs>
<pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#fff"/><line x1="0" y1="0" x2="0" y2="12" stroke="#0b0b1a" stroke-width="2.4"/></pattern>
<pattern id="hatchLight" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#fff"/><line x1="0" y1="0" x2="0" y2="14" stroke="#9a9aa5" stroke-width="2"/></pattern>
</defs>
<g stroke="#0b0b1a" stroke-width="3" stroke-linejoin="round">
${bm ? `<polygon points="1425,1680 1548,1557 1548,1685 1425,1810" fill="url(#hatch)"/><rect x="328" y="1680" width="1097" height="130" fill="url(#hatch)"/><line x1="340" y1="1664" x2="1440" y2="1664" stroke-dasharray="26 18" stroke-width="2.5"/>` : `<line x1="300" y1="1664" x2="1560" y2="1664" stroke-width="3"/>`}
<polygon points="380,1640 1425,1640 1548,1557 1505,1557" fill="none" stroke-width="2"/>
<polygon points="1052,495 1438,495 1505,428 1119,428" fill="#fff"/>
<polygon points="1438,495 1505,428 1505,1555 1438,1622" fill="url(#hatch)"/>
<rect x="1052" y="495" width="386" height="1127" fill="#fff" stroke-width="3.5"/>
<polygon points="382,515 1032,515 1117,430 467,430" fill="#fff"/>
<polygon points="1032,515 1117,430 1117,1560 1052,1625" fill="url(#hatch)"/>
<rect x="382" y="515" width="650" height="1127" fill="#fff" stroke-width="3.5"/>
<polygon points="480,425 585,425 605,402 500,402" fill="#fff"/><rect x="480" y="425" width="105" height="34" fill="url(#hatchLight)"/>
<polygon points="890,430 1022,430 1047,396 915,396" fill="#fff"/><rect x="890" y="430" width="132" height="34" fill="url(#hatchLight)"/>
<polygon points="1138,420 1240,420 1258,404 1156,404" fill="#fff"/><rect x="1138" y="420" width="102" height="32" fill="url(#hatchLight)"/>
<line x1="652" y1="436" x2="652" y2="472" stroke-width="4"/><line x1="848" y1="436" x2="848" y2="472" stroke-width="4"/>
</g>
<g fill="#0b0b1a">${mainSeps}</g>
<g stroke="#0b0b1a" stroke-width="2.5">${boughtBands}</g>
</svg>
<div class="sign">${esc(sign)}</div>
<div class="strip" style="left:382px;top:515px;width:650px">${esc(data.built_label || "Built in-house")}</div>
<div class="strip" style="left:1052px;top:495px;width:386px">${esc(data.bought_label || "Bought")}</div>
${floorDivs}
${boughtDivs}
${labelDivs}
${basementHtml}
${data.footer ? `<div class="src">${esc(data.footer)}</div>` : ""}
</body></html>`;

writeFileSync(outHtml, html);
console.log("HTML:", outHtml);

// ---------- screenshot ----------
const candidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.error("No Chrome/Chromium found. Set CHROME_PATH, or open the HTML at 1600x2000 and screenshot it.");
  process.exit(2);
}
execFileSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1600,2000",
    `--force-device-scale-factor=${data.scale || 1.35}`,
    "--virtual-time-budget=6000",
    `--screenshot=${outPng}`,
    pathToFileURL(outHtml).href,
  ],
  { stdio: "ignore" }
);
console.log("PNG: ", outPng);
