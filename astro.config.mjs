import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://luzimpacto.org',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
});
