// File: vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Dòng này giúp máy hiểu @ là src
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },
})