# Research guide

## Queries that work

- `"<Company> acquires"` and `"<Company> to acquire"`, on the company newsroom and on Reuters
- `<Company> acquisitions list <year>`. Crunchbase News and acquisition trackers are useful for finding deals, but confirm each one against a primary source.
- `"<Company>" acqui-hire` and `"team joins <Company>"`. These catch team-only deals that never get a press release.
- EU DMA notifications (digital-markets-act-cases.ec.europa.eu/acquisitions) for gatekeepers
- `<Company> product launches <year>` and the company changelog or blog, for the built side

## Fact rules

| Situation | What to do |
|---|---|
| Price undisclosed | Leave `value` empty |
| Two reported prices | Use the lower one, with `~` |
| "Less than $X" reported | `<$X` |
| Deal announced, not closed | `"pending": true` |
| Deal abandoned | Footer only, never in the tower |
| Acqui-hire (team only, product shut) | Count it as an acquisition, and say so in the post if it matters |
| Product built on an acquired company | It belongs on the bought side, not the built side |

## What makes the post land

AI founders, engineers, and investors skip inventory. Give them a pattern:

- the acqui-hire share (team deals versus product deals)
- deal pace (how many of the N came this year)
- which floor absorbed the most deals, since that shows where the company feels behind
- the biggest single check, compared with the rest
