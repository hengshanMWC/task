# TaskList
用来管理task的队列

## 使用
- ### 类型
```ts
declare class TaskList extends Task<TaskListParams, TaskListCtx> {
    constructor(list?: Task[], callback?: TaskList['callback'], maxSync?: number);
    get taskList(): Task<any, any>[];
    get taskQueue(): QueueItem[];
    get carryTaskQueue(): Task<any, any>[];
    get endTaskList(): Task<any, any>[];
    get executableTaskQueue(): QueueItem[];
    get waitExecutableTaskQueue(): QueueItem[];
    get endTaskQueue(): QueueItem[];
    get undoneTaskList(): Task<any, any>[];
    get idle(): boolean;
    get end(): boolean;
    setMaxSync(index: number): this;
    move(originValue: valueType, targetValue?: valueType): this | undefined;
    onError(errorCallback: TaskList['errorCallback']): void;
    onParams(paramsCallback: TaskList['paramsCallback']): void;
    protected createCtx(params?: TaskListParams): TaskListCtx | undefined;
}
```
- ### 基本使用
```ts
import { TaskList } from '@abmao/task'
// 示例1
const taskList = new TaskList()
// 传递预设任务数组
const list = [new TestList, new, TestList]
const taskList2 = new TaskList(list, (task: TestList) => {
  console.log(list.includes(task)) // true
}, 2)
```
## API
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

