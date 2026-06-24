# theraseek.ai

Landing page and early-access waitlist for **TheraSeek** — a gentle, always-available AI companion for mental wellbeing.

A static site: no framework, no build step, no dependencies. Plain HTML, CSS, and vanilla JavaScript.

## Develop

Serve the folder with any static file server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Markup |
| `styles.css` | Styles — pink brand theme, design tokens under `:root` |
| `waves.js` | Interactive ASCII water-ripple background (canvas) |
| `script.js` | Form validation, submission, and UI states |
| `config.js` | Waitlist endpoint configuration |
| `waitlist.gs` | Google Apps Script backend (deployed separately) |
| `assets/` | Logo and mascot |

## Waitlist

Signups are sent to a Google Apps Script web app that appends each entry to a
Google Sheet. To connect it:

1. Deploy `waitlist.gs` as a web app (setup steps are documented in the file).
2. Set `WAITLIST_ENDPOINT` in `config.js` to the deployed URL.

Until an endpoint is configured the form runs in demo mode and stores nothing.

## Accessibility & motion

The background animation respects `prefers-reduced-motion` and settles to a
static frame when reduced motion is requested.
