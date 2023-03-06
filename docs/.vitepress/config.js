import { defineConfig } from 'vitepress'
export default defineConfig({
  title: 'Task',
  description: '用 Task 构建世界',
  base: '/',
  themeConfig: {
    siteTitle: 'Task',
    sidebar: [
      {
        text: '指南',
        collapsible: true,
        items: [
          {
            text: '简介',
            link: '/',
          },
        ],
      },
    ],
  },
})
