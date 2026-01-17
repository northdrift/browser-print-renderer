import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 设置 base 为仓库名称，以便在 GitHub Pages 下正常运行
  base: '/browser-print-renderer/',
  server: {
    allowedHosts: true,
    host: true
  }
})
