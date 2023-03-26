# Task
task的核心抽象类，业务通过继承该类实现对应场景逻辑

## API
Task类型
```ts
declare abstract class Task<T = any, Ctx = T> extends CurrentPromise implements BaseTask<T> {
    status: TaskStatus;
    ctx: Ctx | undefined;
    private sign;
    currentNext?: Next;
    start(params?: T): Promise<any>;
    pause(params?: T): this;
    cancel(params?: T): this;
    reset(params?: T): Promise<any>;
    protected abstract cut(next: Next): this;
    protected cutter(next: Next): this;
    protected createCtx(params?: T): CreateCtx<Ctx>;
    protected onProceed(params?: T): void;
    protected onExecute(params?: T): void;
    protected interceptStartParams(params?: T): T | undefined;
    protected interceptPause(params?: T): boolean | void;
    protected interceptCancel(params?: T): boolean | void;
}
```
基本使用
```TS
import { Task } from '@abmao/task'

class TestTask extends Task<number, number> {
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
```
### status
属性：任务的状态，整个任务的生命周期分为四种状态，__idle__ 、__active__、__pause__、__end__
- #### 详细信息
默认处于 __idle__ 状态，通过 __start__ 方法更新为 __active__ 状态， __pause__ 方法更新为 __pause__，任务结束后修更新成 __end__ 状态。

### ctx
属性：当次任务的数据状态上下文

- #### 详细信息
调用start的时候，当判断状态是end或者ctx是undefined的时候，会创建ctx
### start
方法：任务启动

- #### 详细信息
生成该次任务的Promise，会将state更改成active状态，以下是调用start的内部流程

![start-flow](/img/start-flow.png)
### pause
方法：任务暂停

- #### 详细信息
调用该方法时，当满足以下条件，status将会更新为pause，
- status为active
- 并且interceptPause返回不为false
### cancel
方法：任务取消

- #### 详细信息
当interceptCancel返回不为false时，status更新成end状态
### reset
方法：任务重置

- #### 详细信息
取消任务后，再开始新任务，相当于调用了cancel后再调用start
### cut
方法：任务分片，需要实现的抽象方法

- #### 详细信息
通过参数next进行调度，用于对整个任务进行细颗粒度处理

### cutter
方法 cut 方法包装调用

- #### 详细信息
内部添加了对于cut的catch逻辑
### createCtx
方法：创建ctx方法

- #### 详细信息
任务状态更新成active时，通过createCtx方法生成一个ctx
### onProceed
方法：pause状态下调用start方法触发的钩子
- #### 详细信息
当status是pause，调用start方法会触发onProceed钩子
### onExecute
方法：当次任务的数据状态上下文

- #### 详细信息
当status是active，调用start方法会触发onExecute钩子

### interceptStartParams
方法：start方法的参数拦截

- #### 详细信息
对参数做处理，返回处理后的参数
### interceptPause
方法：调用pause会触发interceptPause

- #### 详细信息
返回false的话，不执行pause逻辑
### interceptCancel
方法：调用cancel会触发interceptCancel

- #### 详细信息
返回false的话，不执行cancel逻辑



