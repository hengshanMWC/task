import { defineConfig } from 'vitepress'
export default defineConfig({
  title: 'task',
  description: 'task',
  base: '/',
  themeConfig: {
    siteTitle: 'task',
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
