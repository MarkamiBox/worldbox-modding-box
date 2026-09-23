import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { contentApi } from './vite-plugins/content-api.js'
import { contentIndex } from './vite-plugins/content-index.js'
import { buildInfo } from './vite-plugins/build-info.js'

export default defineConfig({
  // relative base: works on github.io/<repo>/ and on any subpath
  base: './',
  plugins: [react(), tailwindcss(), contentApi(), contentIndex(), buildInfo()],
  build: {
    // Icons are small PNGs; inlining them as base64 would push every one of them into the
    // main JS chunk, which is the opposite of what the per-language split is for.
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // One chunk per language instead of one chunk per page: reading a page in Italian
        // fetches Italian once, and never the other nine languages.
        manualChunks(id) {
          const match = /[\\/]src[\\/]content[\\/]([a-z]{2})[\\/]/.exec(id)
          return match ? `content-${match[1]}` : undefined
        },
      },
    },
  },
  server: {
    watch: {
      usePolling: false,
    },
  },
})
