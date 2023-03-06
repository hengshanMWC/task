# 使用
下面例子展示：
- 继承抽象类 __Task__
- 实现抽象方法 __cut__
- 然后调用 __start__ 方法启动
## 模块引用
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

## 标签引用

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