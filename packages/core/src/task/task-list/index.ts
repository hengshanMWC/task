import type { Next } from '../task'
import { Task } from '../task'
import { arrayDelete, createItem, getIndex, getList, getNotActiveTask, nonExistent } from './utils'

class TaskList extends Task<TaskListParams, TaskListCtx> {
  private maxSync: number
  private callback?: (task: Task) => void
  private errorCallback: (error: Error, task: Task, taskList: TaskList) => void = (error) => { throw error }
  private initList: Task[]

  constructor(list: Task[] = [], callback?: TaskList['callback'], maxSync = 1) {
    super()
    this.initList = list
    this.setMaxSync(maxSync)
    this.callback = callback
  }

  get taskList() {
    return this.ctx?.taskList || []
  }

  get taskQueue() {
    return this.ctx?.taskQueue || []
  }

  get carryTaskQueue() {
    return this.taskQueue.map(({ task }) => task)
  }

  // 结束列表
  get endTaskList() {
    return this.taskList.filter(item => item.status === 'end')
  }

  // 执行队列
  get executableTaskQueue() {
    return this.taskQueue.slice(0, this.maxSync)
  }

  // 等待可执行队列
  get waitExecutableTaskQueue() {
    return this.executableTaskQueue.filter(item => item.task.status !== 'active')
  }

  // 执行完成队列
  get endTaskQueue() {
    return this.executableTaskQueue.filter(item => item.task.status === 'end')
  }

  // 未结束队列
  get undoneTaskList() {
    return this.taskList.filter(task => task.status !== 'end')
  }

  // 空闲
  get idle() {
    return this.taskQueue.length === 0
  }

  // 结束
  get end() {
    return this.taskList.length === this.endTaskList.length
  }

  setMaxSync(index: number) {
    const ctx = this.ctx
    const oldMaxSync = this.maxSync
    const maxSync = Math.max(index, 0)
    const num = maxSync - oldMaxSync
    this.maxSync = maxSync
    if (ctx) {
      if (num > 0) {
        this.start(this.waitExecutableTaskQueue.map(item => item.task))
      }
      else if (num < 0) {
        const list = index === 0 ? ctx.taskQueue : ctx.taskQueue.slice(oldMaxSync, maxSync)
        list.forEach(item => item.task.pause())
      }
    }
    return this
  }

  // 移动到对应的位置
  move(originValue: valueType, targetValue?: valueType) {
    if (!this.ctx)
      return
    // 获取源的index
    const list = this.taskList
    const originIndex = getIndex(list, originValue)
    let targetIndex = getIndex(list, targetValue || 0)
    // 判断是正常的index
    if (
      originIndex !== -1
      && targetIndex !== -1
      && originIndex < list.length
      && targetIndex < list.length) {
      const originTask = list.splice(originIndex, 1)[0]
      targetIndex = getIndex(list, targetValue || 0)
      list.splice(targetIndex, 0, originTask)
    }
    return this
  }

  onError(errorCallback: TaskList['errorCallback']) {
    this.errorCallback = errorCallback
  }

  protected createCtx(params?: TaskListParams): TaskListCtx | undefined {
    const list: Task[] = [...this.initList]
    if (Array.isArray(params) && typeof params[0] !== 'number') {
      list.push(...params as Task[])
    }
    else if (params !== undefined && typeof params !== 'number') {
      list.push(params as Task)
    }

    const taskList: Task[] = [...new Set(list)]
    const carryTaskQueue: Task[] = getNotActiveTask(taskList, params)
    return {
      taskList,
      taskQueue: carryTaskQueue.map(task => createItem(task)),
    }
  }

  protected onExecute(params?: TaskListParams) {
    const ctx = this.addTasks(params).ctx
    if (ctx && this.currentNext) {
      this.cutter(this.currentNext)
    }
  }

  protected onProceed(params?: TaskListParams | undefined): void {
    this.addTasks(params)
  }

  protected interceptPause(params?: TaskListParams) {
    return this.handleIntercept((task: Task) => task.pause(), params)
  }

  protected interceptCancel(params?: TaskListParams) {
    return this.handleIntercept((task: Task) => task.cancel(), params)
  }

  protected cut(next: Next) {
    if (this.end) {
      next(true)
    }
    else {
      this.waitExecutableTaskQueue.forEach((item) => {
        const p = item.task.start()
        this.cutNext(next, item, p)
      })
    }
    return this
  }

  private async cutNext(next: Next, item: QueueItem, p: Promise<Task>) {
    const task = item.task
    const isClean = !item.promise
    item.promise = p
    try {
      const t = await p
      if (isClean) {
        next(() => {
          try {
            this.callback && this.callback(t)
            arrayDelete(this.taskQueue, this.endTaskQueue.map(item => item.task))
          }
          catch (error) {
            this.handleError(error, task)
          }
          return this.end
        })
      }
    }
    catch (error) {
      if (isClean) {
        next(() => {
          this.handleError(error, task)
          return this.end
        })
      }
    }
  }

  private handleError(error: Error, task: Task) {
    try {
      this.errorCallback(error, task, this)
    }
    catch (err) {
      this.triggerReject(error)
    }
  }

  private addTasks(params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      if (params !== undefined) {
        const list = Array.isArray(params) ? params : [params]
        list.forEach((item) => {
          if (nonExistent(ctx.taskList, item)) {
            ctx.taskList.push(item as Task)
          }
          if (nonExistent(this.carryTaskQueue, item)) {
            ctx.taskQueue.push(createItem(item as Task))
          }
        })
      }
      // items为undefined则是全部
      else {
        ctx.taskList.forEach((task) => {
          if (!this.carryTaskQueue.includes(task)) {
            ctx.taskQueue.push(createItem(task))
          }
        })
      }
    }
    return this
  }

  private handleIntercept(callback: (task: Task) => void, params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      const list = getList(ctx.taskList, params)
      list.forEach(task => callback(task))
      arrayDelete(ctx.taskQueue, list)
    }
    return this.idle
  }
}

type valueType = number | Task
type TaskListParams = valueType | valueType[]
interface QueueItem {
  task: Task
  promise: Promise<Task> | null
}
interface TaskListCtx {
  taskList: Task[]
  taskQueue: QueueItem[]
}

export {
  TaskList,
  valueType,
  TaskListParams,
  QueueItem,
}
