import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

export interface PagesSettings {
  basePath: string;
  apiBaseUrl: string;
}

/** `mini-payment-app`, `/mini-payment-app` or `/mini-payment-app/` → `/mini-payment-app/`; empty → `/` (custom domain). */
export function normalizeBasePath(raw: string | undefined): string {
  const trimmed = (raw ?? '').trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

/**
 * Validates the public values baked into a GitHub Pages build. Everything here
 * ships to browsers, so it must never contain secrets.
 */
export function resolvePagesSettings(env: Record<string, string | undefined>): { settings: PagesSettings; errors: string[] } {
  const errors: string[] = [];
  const basePath = normalizeBasePath(env.PAGES_BASE_PATH);
  if (!/^\/([A-Za-z0-9._-]+\/)*$/.test(basePath) || basePath.split('/').some((segment) => segment === '..' || segment === '.')) {
    errors.push('PAGES_BASE_PATH must be a plain path such as /mini-payment-app/');
  }

  const apiBaseUrl = (env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
  if (!apiBaseUrl) {
    errors.push('VITE_API_BASE_URL is required (set the API_BASE_URL repository variable, e.g. https://YOUR-SERVICE.up.railway.app/api/v1)');
  } else {
    let url: URL | undefined;
    try {
      url = new URL(apiBaseUrl);
    } catch {
      errors.push('VITE_API_BASE_URL must be an absolute URL');
    }
    if (url) {
      if (url.protocol !== 'https:') errors.push('VITE_API_BASE_URL must use https:// (GitHub Pages is served over HTTPS)');
      if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname)) errors.push('VITE_API_BASE_URL must not point to localhost');
      if (!url.pathname.endsWith('/api/v1')) errors.push('VITE_API_BASE_URL must end with /api/v1');
      if (url.username || url.password || url.search || url.hash) {
        errors.push('VITE_API_BASE_URL must not contain credentials, a query string or a fragment');
      }
    }
  }
  return { settings: { basePath, apiBaseUrl }, errors };
}

/**
 * GitHub Pages has no rewrites: unknown paths serve `404.html`. A copy of
 * `index.html` there boots the SPA at the requested URL (with HTTP status 404,
 * which browsers render normally). `.nojekyll` stops Jekyll from dropping
 * files that start with an underscore.
 */
export function githubPagesFallback(): Plugin {
  let outDir = 'dist';
  return {
    name: 'mini-pay:github-pages-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'));
      writeFileSync(join(outDir, '.nojekyll'), '');
    },
  };
}
