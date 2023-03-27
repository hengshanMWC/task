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
type valueType = number | Task
type TaskListParams = valueType | valueType[]
```
- ### 示例
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
- ### 构造函数
```TS
{
  constructor(list?: Task[], callback?: TaskList['callback'], maxSync?: number);
}
```
- list: 预设任务，启动start的时候会自动添加到数组头部
- callback: 每个任务完成后的回调，回调返回的参数是该次完成的任务
- maxSync: 任务执行并发数，默认为1

## API

### ctx
属性：当次任务的数据状态上下文

- #### 类型
```TS
interface TaskListCtx {
  taskList: Task[]
  taskQueue: QueueItem[]
}
```
- #### 详细信息
- taskList: 任务数组，这个数组储存构造函数预设和start的任务
- taskQueue: 任务队列，这个队列储存执行任务
### start
方法：任务启动

- #### 类型
```ts
start(params?: TaskListParams | undefined): Promise<this>
```

- #### 详细信息
生成该次任务的Promise，会将state更改成active状态，以下是调用start的内部流程

![start-flow](/img/start-flow.png)

- #### 示例
```TS
taskList.start() // 执行所有任务
taskList.start(1) // 执行下标1的任务
taskList.start([1, 2]) // 执行下标1和2的任务
taskList.start(task) // 执行task，如果任务数组没有该task，将添加到数组尾部
taskList.start([task, task2]) // 执行task和task2，如果任务数组没有数组中的任务，则将添加到数组尾部
```
### pause
方法：任务暂停

- #### 详细信息
调用该方法时，当满足以下条件，status将会更新为pause，
- status为active
- 并且interceptPause返回不为false
- #### 示例
```TS
taskList.pause() // 暂停所有任务
taskList.pause(1) // 暂停下标1的任务
taskList.pause([1, 2]) // 暂停下标1和2的任务
taskList.pause(task) // 暂停task
taskList.pause([task, task2]) // 暂停task和task2
```
### cancel
方法：任务取消

- #### 详细信息
当interceptCancel返回不为false时，status更新成end状态
- #### 示例
```TS
taskList.cancel() // 取消所有任务
taskList.cancel(1) // 取消下标1的任务
taskList.cancel([1, 2]) // 取消下标1和2的任务
taskList.cancel(task) // 取消task
taskList.cancel([task, task2]) // 取消task和task2
```
### reset
方法：任务重置

- #### 详细信息
取消任务后，再开始新任务，相当于调用了cancel后再调用start
- #### 示例
```TS
taskList.reset() // 重置所有任务
taskList.reset(1) // 重置下标1的任务
taskList.reset([1, 2]) // 重置下标1和2的任务
taskList.reset(task) // 重置task
taskList.reset([task, task2]) // 重置task和task2
```
### setMaxSync
方法：修改任务执行并发数量

- #### 详细信息
默认并发执行是1，最低到0
- #### 示例
```TS
taskList.setMaxSync(2) // 并发为2
taskList.setMaxSync(-1) // 并发为0
```


