import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/api.ts'],
  format: ['esm'],
  target: 'es2022',
  clean: true,
  dts: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
