import { defineConfig } from 'astro/config';

const base = process.env.PUBLIC_BASE_PATH || '/';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://ricky2036.github.io/os_updates_archive',
  base,
  output: 'static',
  compressHTML: true,
  devToolbar: {
    enabled: false,
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
});
