# 介绍
用 __Task__ 构建世界，将行为抽象成一组具有 __start__、__pause__、__cancel__ 和 __reset__ 方法的接口，统一方式调用

例如倒水，通过 __start__ 开始倒水，__pause__ 暂停倒水，__cancel__ 把水倒掉，__reset__ 重新倒水

[@abmao/task](https://www.npmjs.com/package/@abmao/task)提供核心 __Task__ 抽象，并基于此实现了部分任务功能

## 思想
Task可以通过两个地方做状态初始化，如new实例的时候和调用start方法。

内部提供一些钩子方法，方便做一些拦截操作