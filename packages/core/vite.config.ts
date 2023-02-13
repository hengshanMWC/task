/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['es', 'umd'],
      fileName: 'index',
    },
  },
  test: {
    threads: false, // process.chdir() is not supported in workers
    globals: true,
    watch: false,
  },
})
