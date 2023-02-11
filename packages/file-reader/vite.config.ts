/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    threads: false, // process.chdir() is not supported in workers
    globals: true,
    watch: false,
  },
})
