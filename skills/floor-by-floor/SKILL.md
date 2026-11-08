---
name: floor-by-floor
description: Draws a "floor by floor" building infographic of any company, with what it built in-house stacked as floors, what it bought as a second tower, and its infrastructure bet in the basement, plus a matching X post. Use when the user asks for a "floor by floor" chart, a "built vs bought" map, an acquisitions map, "what X built and what X bought", or wants to remake the Stripe floor-by-floor post for another company.
---

# Floor by floor

Turns a company into an isometric building, rendered as a 2160x2700 PNG (4:5, the size X shows uncropped).

- **Left tower: built in-house.** Each floor is a product layer, numbered from the bottom. Floor 01 is the core, and the top floor is the newest bet (highlighted).
- **Right tower: bought.** Each acquisition sits next to the floor it feeds, with year and disclosed price. Pending deals get a dashed border.
- **Basement (optional):** the infrastructure, chain, or compute the company stands on, plus partners.

Format credit: Gap ([@gaspardlezin](https://x.com/gaspardlezin)), from his [Stripe, floor by floor](https://x.com/gaspardlezin/status/2118716556117266453) post.

## Workflow

### 1. Research (do not skip, do not guess)

Collect three lists and save raw notes with source URLs:

1. **Built in-house products.** Use the official product pages, docs, and launch posts. Leave out anything that came from an acquisition.
2. **Acquisitions.** Record the date, target, price as reported, status (closed / pending / abandoned), and what it became inside the company. Good sources: the company newsroom, Reuters, Bloomberg, TechCrunch, Crunchbase news, and EU DMA notification lists. When a price is undisclosed, leave `value` empty. Never estimate a price.
3. **Basement.** The single biggest infrastructure dependency or bet: a chain, a compute program, a network. Name the partners and one number.

See `references/research-guide.md` for search queries and the fact rules.

### 2. Design the floors

- Use 4 to 7 floors. Six reads best.
- Order them bottom to top, from the original core business up to the newest frontier.
- Put 2 to 5 products on each floor. Keep labels to 2 or 3 words, and use `\n` to control line breaks.
- Put each acquisition on the floor whose product absorbed it. If there are more than 12 deals, show the most significant ones and state "N acquisitions; M shown" in the footer.
- Mark the top floor `highlight: true`.

### 3. Write the data file

Write `<company>.json` using the schema in `references/data-schema.md`. Start from `examples/openai.json` in the repo, or from the inline sample in the schema doc.

### 4. Render

```bash
node scripts/render.mjs <company>.json            # writes <company>.png and <company>.html
CHROME_PATH=/path/to/chrome node scripts/render.mjs data.json out.png
```

This needs Node 18 or later and Chrome, Chromium, or Edge. There are no npm dependencies. Fonts load from Google Fonts, so the render needs network access.

### 5. Inspect, then fix

Open the PNG and check for:

- labels clipped or spilling out of a cell (shorten the label or add `\n`)
- bought names wrapping mid-word (shorten the name, or set `"layout": "rows"`)
- a floor with 6 or more products (split it into two floors)
- a title running off the canvas (set `title_size`)

Re-render until the PNG is clean.

### 6. Draft the post

Mirror the original's structure:

```
<Company>, floor by floor.

> Six floors built in-house, from <bottom> up to <top>.
> Below ground: <basement>, <one line>.
> On the side: <N> companies it bought, from <first> to <biggest>.

<One closing line: the single number, or the pattern the chart reveals.>
```

Keep it under 280 characters. The closing line should say something the chart implies but does not spell out, such as acqui-hire share, deal pace, or where the money went. Credit the format to @gaspardlezin when you reply in his thread or post publicly.

## Rules

- Every number in the chart and the post needs a source in your notes.
- Reported ranges: use the lower figure, or a prefix such as `~` or `<`.
- Abandoned deals go in the footer, not the tower.
- Use generic text wordmarks only. Do not paste company logos into the chart.
