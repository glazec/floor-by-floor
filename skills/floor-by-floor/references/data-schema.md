# Data schema

```jsonc
{
  "company": "OpenAI",                 // required
  "sign": "OpenAI",                    // rooftop sign text (default: company)
  "title_bold": "OpenAI, floor by floor:",       // optional
  "title_rest": "what it built, what it bought", // optional
  "title_size": 66,                    // optional px, auto-shrinks by default
  "author": { "name": "Jane", "handle": "@jane" }, // optional header row
  "accent": "#1a1a6e",                 // icon fill + highlighted floor label
  "highlight_bg": "#cfdfff",           // highlighted floor cell background
  "built_label": "Built in-house",     // optional strip labels
  "bought_label": "Bought",
  "floors": [                          // 2..8 floors, BOTTOM to TOP
    {
      "name": "Models",                // left label
      "icon": "cube",                  // left label icon (default: first product icon)
      "highlight": false,              // true on the newest floor
      "built": [
        { "label": "GPT-5", "icon": "cube" },
        { "label": "Custom\nchips", "sub": "w/ Broadcom", "icon": "chip", "flex": 1.2 }
      ],
      "bought": {
        "layout": "boxes",             // "boxes" (side by side) or "rows" (list); auto = rows when 3+
        "items": [
          { "name": "neptune.ai", "year": 2025, "value": "<$400M" },
          { "name": "Astral", "year": 2026, "pending": true },
          { "name": "Notch", "year": 2026, "note": "→ Ads" }
        ]
      }
    }
  ],
  "basement": {                        // optional; omitted = plain ground line
    "name": "STARGATE",
    "line": "with SoftBank · Oracle · MGX · 10 GW, $500B target",
    "icon": "servers"
  },
  "footer": "25 acquisitions since 2023; 11 shown. Sources: ...",
  "scale": 1.35                        // 1.35 -> 2160x2700 PNG
}
```

## Icons

`cube lock video image mic code chip core nodes sliders chat globe pulse phone terminal cursor search cart arrows grid megaphone heart flask spark card bank coin shield user doc db cloud bolt chart link robot servers box store`

Pick the closest match. An unknown icon name renders no icon, which is fine.

## Layout tips

- 3 or 4 products per floor reads best. With 5, cells switch to a smaller font automatically.
- Use `flex` to give a long label more width (for example `1.25`) and a short one less (`0.8`).
- Bought names: up to about 8 characters fit two to a floor, and up to about 16 fit alone. Longer names wrap.
