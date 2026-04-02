import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  // 确保构建输出使用 UTF-8
  build: {
    charset: 'utf8',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 80,
    host: '0.0.0.0',
    // 开发时走同源代理，避免通过局域网 IP 访问页面时仍请求 localhost:8010 连不上执行引擎
    proxy: {
      '/engine': {
        target: 'http://127.0.0.1:8010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/engine/, '')
      }
    }
  }
})
