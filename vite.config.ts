import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // React 相关
          'react-vendor': ['react', 'react-dom'],
          
          // TanStack 相关
          'tanstack-router': ['@tanstack/react-router', '@tanstack/react-router-devtools'],
          'tanstack-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'tanstack-form': ['@tanstack/react-form'],
          'tanstack-store': ['@tanstack/react-store', '@tanstack/store'],
          
          // Radix UI 组件库
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-use-controllable-state'
          ],
          
          // 工具库
          'utils': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'date-fns',
            'zod',
            'axios'
          ],
          
          // UI 组件
          'ui-components': [
            'cmdk',
            'embla-carousel-react',
            'input-otp',
            'lucide-react',
            'react-day-picker',
            'react-resizable-panels',
            'react-syntax-highlighter',
            'sonner',
            'vaul',
            'use-stick-to-bottom'
          ],
          
          // 动画和图表
          'animation-charts': [
            'gsap',
            '@gsap/react',
            'recharts'
          ],
          
          // 主题和样式
          'theming': [
            'next-themes'
          ],
          
          // 表单处理
          'forms': [
            'react-hook-form',
            '@hookform/resolvers'
          ],
          
          // AI 相关
          'ai': [
            'ai',
            'streamdown'
          ]
        }
      }
    },
    // 增加 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 优化依赖预构建
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
})
