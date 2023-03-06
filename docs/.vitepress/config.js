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
          {
            text: '使用',
            link: '/use',
          },
        ],
      },
      {
        text: '功能',
        collapsible: true,
        items: [
          {
            text: 'Task',
            link: '/task/task',
          },
          {
            text: 'TaskList',
            link: '/task/task-list',
          },
          {
            text: 'FileRead',
            link: '/task/file-read',
          },
          {
            text: 'AlarmClock',
            link: '/task/alarm-clock',
          },
        ],
      },
    ],
  },
})
