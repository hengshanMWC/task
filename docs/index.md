# 介绍
用 __Task__ 构建世界，将行为抽象成一组具有 __start__、__pause__、__cancel__ 和 __reset__ 方法的接口，具体业务实现接口，统一方式调用

## 使用
```
npm install @abmao/task
```
继承抽象类 __Task__，实现抽象方法 __cut__
```js
import { Task } from '@abmao/task'

class TestTask extends Task {
  cut(next) {
    Promise.resolve()
      .then(() => {
        next(() => {
          if (this.ctx) {
            this.ctx--
          }
          else {
            return true
          }
        })
      })
    return this
  }
}

const task = new TestTask()

task.start(1)
  .then(_task => _task === task)
````