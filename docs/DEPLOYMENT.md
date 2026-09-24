# Deployment: GitHub Pages (app) + Railway (API)

This React app is a static site on GitHub Pages. The API ([mini-payment-server](https://github.com/maheshpcse/mini-payment-server)) runs on Railway; its `docs/DEPLOYMENT.md` covers Railway, MongoDB and Redis. Pages only serves files: it cannot run the API or proxy `/api`, so the browser calls the Railway URL directly (CORS).

## Files

| File | Purpose |
| --- | --- |
| `.github/workflows/deploy-pages.yml` | On push to `main` (or manual run): lint, test, `build:pages`, upload artifact, deploy to Pages |
| `build/github-pages.ts` | Validates Pages build settings; Vite plugin writes `404.html` (SPA fallback) and `.nojekyll` |
| `vite.config.ts` | `--mode pages` sets `base` to the repository path and enables the plugin |
| `src/main.tsx` | Router `basename` follows Vite's `BASE_URL` |
| `.env.production.example` | Reference for the public build values |

## One-time setup

1. **Deploy the API first** and note its HTTPS domain, e.g. `https://mini-payment-server-production.up.railway.app`. On Railway set `CORS_ORIGINS=https://maheshpcse.github.io` (origin only, no `/mini-payment-app`, no trailing slash).
2. In **this** repository: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions → **Variables** (repository variables, not environment-scoped, because the build job runs before the `github-pages` environment):

| Variable | Value |
| --- | --- |
| `API_BASE_URL` | `https://YOUR-SERVICE.up.railway.app/api/v1` — required, HTTPS, ends in `/api/v1` |
| `APP_ENV` | Optional label shown in the utility dock; defaults to `production` |

   These are public: they end up in the JavaScript bundle. Never put secrets in `VITE_*` values or workflow variables.
4. Push to `main` or run **Deploy to GitHub Pages** from the Actions tab. The site is published at `https://maheshpcse.github.io/mini-payment-app/`.

## How the build works

- `actions/configure-pages` provides the base path (`/mini-payment-app` for a project site, empty for a custom domain); the build normalises it to `/mini-payment-app/`.
- The build fails before bundling if `VITE_API_BASE_URL` is missing, not HTTPS, localhost, lacks `/api/v1`, or contains credentials/query/fragment, or if the base path is not a plain path.
- Deep links: Pages has no rewrites, so `/mini-payment-app/pay` would be a 404. The build copies `index.html` to `404.html`; Pages serves it for unknown paths and the app boots at the requested URL. The HTTP status is 404 even though the page renders (acceptable for an app shell; it is not indexed content). Unknown in-app routes show the app's own 404 page.
- `.nojekyll` disables Jekyll processing of the artifact.

## Local production build

```bash
cp .env.production.example .env.pages.local   # edit the API URL
npm run build:pages                            # output: dist/ (with 404.html and .nojekyll)
npm run preview:pages                          # serves at http://localhost:4173/mini-payment-app/
```

`vite preview` rewrites unknown paths, so to reproduce Pages exactly serve `dist/` with a static server that returns `404.html` for misses.

## Security notes

- Every `*.github.io` project site of the same account shares the origin `https://maheshpcse.github.io`, and therefore `localStorage`, cookies without a path and service-worker scope. Only non-sensitive preferences (theme, sidebar) use `localStorage` (prefixed `mini-pay.`). Access tokens must stay in memory (FE-004); never store tokens in `localStorage`.
- Cross-site authentication: Pages and Railway are different sites, so refresh-token cookies are third-party. See "Known constraint for authentication" in the server's `docs/DEPLOYMENT.md`; the API therefore sets the refresh cookie with `SameSite=None; Secure; Partitioned` when deployed (Railway variable `REFRESH_COOKIE_SAMESITE=none`). Browsers that block all third-party cookies will sign the user out on reload; a custom domain for both (e.g. `pay.example.com` + `api.example.com`) remains the long-term fix.
- GitHub Pages cannot set response headers (CSP, HSTS preload, frame-ancestors). If those become requirements, front the site with a CDN or move static hosting.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Workflow fails at "Require API_BASE_URL" | Add the repository variable (step 3) and re-run |
| Build error `GitHub Pages build configuration invalid` | The listed rule is violated by `API_BASE_URL` |
| Blank page, assets 404 | Pages source is not "GitHub Actions", or the site was built without `--mode pages` |
| Dock shows **API offline** | Railway not ready (`/api/v1/health/ready`), wrong `API_BASE_URL`, or the page origin is missing from Railway `CORS_ORIGINS` (browser console shows a CORS error) |
| Custom domain | Configure it in Pages settings; the base path becomes `/` automatically. Add the new origin to Railway `CORS_ORIGINS` |

## Status

Validated locally (see TASKS FE-026): configuration tests, `build:pages` with valid and invalid settings, and a Pages-like static server (no rewrites, `404.html` for misses) rendering deep links and unknown routes in Chrome. No live Pages deployment was made from this environment; the workflow runs once the repository settings above are in place.

References: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Vite static deploy](https://vite.dev/guide/static-deploy).
