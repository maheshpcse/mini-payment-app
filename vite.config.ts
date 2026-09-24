import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import { githubPagesFallback, resolvePagesSettings } from './build/github-pages.ts';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig(({ mode }) => {
  const isPages = mode === 'pages';
  let base = '/';
  if (isPages) {
    const { settings, errors } = resolvePagesSettings({ ...loadEnv(mode, process.cwd(), ''), ...process.env });
    if (errors.length > 0) throw new Error(`GitHub Pages build configuration invalid:\n- ${errors.join('\n- ')}`);
    base = settings.basePath;
  }

  return {
    base,
    plugins: [react(), isPages && githubPagesFallback()],
    define: {
      __APP_VERSION__: JSON.stringify(version),
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: { modules: { classNameStrategy: 'non-scoped' } },
      restoreMocks: true,
    },
  };
});
