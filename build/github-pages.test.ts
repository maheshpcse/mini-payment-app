import { describe, expect, it } from 'vitest';
import { normalizeBasePath, resolvePagesSettings } from './github-pages.ts';

const API = 'https://mini-payment-server-production.up.railway.app/api/v1';

describe('normalizeBasePath', () => {
  it.each([
    [undefined, '/'],
    ['', '/'],
    ['/', '/'],
    ['mini-payment-app', '/mini-payment-app/'],
    ['/mini-payment-app', '/mini-payment-app/'],
    ['/mini-payment-app/', '/mini-payment-app/'],
  ])('%s → %s', (raw, expected) => {
    expect(normalizeBasePath(raw)).toBe(expected);
  });
});

describe('resolvePagesSettings', () => {
  it('accepts the Actions-provided base path and a Railway API URL', () => {
    const result = resolvePagesSettings({ PAGES_BASE_PATH: '/mini-payment-app', VITE_API_BASE_URL: `${API}/` });
    expect(result.errors).toEqual([]);
    expect(result.settings).toEqual({ basePath: '/mini-payment-app/', apiBaseUrl: API });
  });

  it('accepts a custom domain at the root', () => {
    expect(resolvePagesSettings({ PAGES_BASE_PATH: '', VITE_API_BASE_URL: 'https://api.example.com/api/v1' }).errors).toEqual([]);
  });

  it.each([
    [{ VITE_API_BASE_URL: '' }, /is required/],
    [{ VITE_API_BASE_URL: 'not a url' }, /absolute URL/],
    [{ VITE_API_BASE_URL: 'http://api.example.com/api/v1' }, /https/],
    [{ VITE_API_BASE_URL: 'https://localhost/api/v1' }, /localhost/],
    [{ VITE_API_BASE_URL: 'https://api.example.com/api' }, /\/api\/v1/],
    [{ VITE_API_BASE_URL: 'https://user:pw@api.example.com/api/v1' }, /credentials/],
    [{ VITE_API_BASE_URL: API, PAGES_BASE_PATH: '/../evil' }, /PAGES_BASE_PATH/],
    [{ VITE_API_BASE_URL: API, PAGES_BASE_PATH: '/a b/' }, /PAGES_BASE_PATH/],
  ])('rejects %o', (env, message) => {
    expect(resolvePagesSettings(env).errors.join('\n')).toMatch(message);
  });
});
