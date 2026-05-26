# Tripon shared components

Reusable HTML partials loaded by `assets/js/includes.js`.

| File | Purpose |
|------|---------|
| `navbar.html` | Desktop floating glass navbar |
| `mobile-menu.html` | Tablet/mobile drawer (slides from right) |
| `footer.html` | Site footer + mobile bottom navigation |
| `adventure-3d.html` | 3D locations carousel (shared section markup) |
| `blogs-3d.html` | 3D blogs carousel (shared section markup) |

Regenerate embedded sections on inner pages after editing homepage 3D blocks:

```bash
node scripts/sync-3d-sections.js
```

## Styles & scripts

- `assets/css/navbar.css` — navigation UI (injected automatically)
- `assets/js/navbar.js` — scroll, drawer, transitions, active states

## Page setup

```html
<div id="tripon-navbar-zone" class="tripon-include-mount" style="display:contents"></div>
<!-- page content -->
<div id="tripon-footer-zone" class="tripon-include-mount" style="display:contents"></div>
<script src="assets/js/includes.js"></script>
<script>window.triponBootMain();</script>
```

Set active section on `<body>`:

- `data-tripon-nav="home"` | `locations` | `packages` | `blogs` | `contact`
