import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Neat Stars',
    description: 'See the percentage of clean (non-suspicious) stars on any GitHub repo.',
    permissions: ['storage'],
    host_permissions: ['https://github.com/*'],
  },
});
