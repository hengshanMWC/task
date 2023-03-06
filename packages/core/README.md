# 介绍
用 __Task__ 构建世界，将行为抽象成一组具有 __start__、__pause__、__cancel__ 和 __reset__ 方法的接口，具体业务实现接口，统一方式调用

例如吃饭🍚，通过 __start__ 开始吃米饭，__pause__ 放下碗筷，__cancel__ 倒掉米饭，__reset__ 再吃一顿

[@abmao/task](https://www.npmjs.com/package/@abmao/task)提供核心 __Task__ 抽象，并基于此实现了部分任务功能
## 引用
```
npm install @abmao/task
```
```html
<script src="https://unpkg.com/@abmao/task/dist/index.umd.js"></script>
```