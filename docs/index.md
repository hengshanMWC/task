# 介绍
用 __Task__ 构建世界，将行为抽象成一组具有 __start__、__pause__、__cancel__ 和 __reset__ 方法的接口，具体业务实现接口，统一方式调用

## 使用
下面例子展示：
- 继承抽象类 __Task__
- 实现抽象方法 __cut__
- 然后调用 __start__ 方法启动
### 模块引入
```
npm install @abmao/task
```
```js
import { Task } from '@abmao/task'

class TestTask extends Task {
  cut(next) {
    next(() => {
      if (this.ctx) {
        this.ctx--
      }
      else {
        return true
      }
    })
    return this
  }
}

const task = new TestTask()

task.start(1)
  .then(_task => _task === task)
````

### 标签引入

```html
<script src="https://unpkg.com/@abmao/task/dist/index.umd.js"></script>
<script>
  class TestTask extends AbmaoTask.Task {
    cut(next) {
      next(() => {
        if (this.ctx) {
          this.ctx--
        }
        else {
          return true
        }
      })
      return this
    }
  }

  const task = new TestTask()

  task.start(1)
    .then(_task => _task === task)
</script>
```