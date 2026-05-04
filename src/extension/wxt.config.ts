import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Neat Stars',
    description: 'See the percentage of clean (non-suspicious) stars on any GitHub repo.',
    permissions: ['storage'],
    host_permissions: ['https://github.com/*'],
    icons: {
      '16': '/icon-16.png',
      '32': '/icon-32.png',
      '48': '/icon-48.png',
      '128': '/icon-128.png',
    },
  },
});
