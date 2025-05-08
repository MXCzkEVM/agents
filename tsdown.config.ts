import { defineConfig } from 'tsdown'
import { dependencies } from './package.json'

export default defineConfig({
  fixedExtension: true,
  entry: [
    'src/index.ts',
    'src/next.ts',
  ],
  format: ['esm'],
  clean: true,
  dts: true,
  external: Object.keys(dependencies || {}),
})
