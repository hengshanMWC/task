import type { Next } from '../task'
import { Task } from '../task'
import { arrayDelete, getIndexList, getItem, getList, getNotActiveTask, getStatusTask, nonExistent } from './utils'

class TaskList extends Task<TaskListParams, TaskListCtx> {
  private maxSync: number
  private callback?: (task: Task) => void
  private errorCallback: (error: Error, task: Task, taskList: TaskList) => Promise<void> = error => Promise.reject(error)
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

  // 执行中列表
  get activeTaskList() {
    return getStatusTask(this.taskList, 'active')
  }

  // 空闲列表
  get idleTaskList() {
    return getStatusTask(this.taskList, 'idle')
  }

  // 暂停列表
  get pauseTaskList() {
    return getStatusTask(this.taskList, 'pause')
  }

  // 结束列表
  get endTaskList() {
    return getStatusTask(this.taskList, 'end')
  }

  // 执行队列
  get executableTaskQueue() {
    return this.taskQueue.slice(0, this.maxSync)
  }

  // 等待可执行队列
  get waitExecutableTaskQueue() {
    const list = this.executableTaskQueue
    const index = list.findIndex(task => task.status === 'active')
    return list.slice(Math.max(index, 0))
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
        this.start(this.waitExecutableTaskQueue)
      }
      else if (num < 0) {
        const value = Math.abs(num)
        const list = index === 0 ? ctx.taskQueue : ctx.taskQueue.slice(maxSync, value)
        list.forEach(task => task.pause())
      }
    }
    return this
  }

  // 移动到对应的位置
  move(originValue: valueType, targetValue?: valueType) {
    if (!this.ctx)
      return
    // 获取源的index
    const originIndex = getIndexList(this.taskList, originValue)[0]
    // 判断是正常的index
    if (!isNaN(originIndex)) {
      const originTask = this.taskList.splice(originIndex, 1)[0]
      const targetIndex = getIndexList(this.taskList, targetValue || 0)[0]
      if (!isNaN(targetIndex)) {
        this.taskList.splice(targetIndex, 0, originTask)
      }
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
    const taskQueue: Task[] = getNotActiveTask(taskList, params)
    return {
      taskList,
      taskQueue,
    }
  }

  protected onExecute(params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      if (params !== undefined) {
        const list = Array.isArray(params) ? params : [params]
        list.forEach((item) => {
          if (nonExistent(ctx.taskList, item)) {
            ctx.taskList.push(item as Task)
          }
          if (nonExistent(ctx.taskQueue, item)) {
            ctx.taskQueue.push(item as Task)
          }
        })
      }
      // items为undefined则是全部
      else {
        ctx.taskList.forEach((task) => {
          if (!ctx.taskQueue.includes(task)) {
            ctx.taskQueue.push(task)
          }
        })
      }
      if (this.currentNext) {
        this.cutter(this.currentNext)
      }
    }
    return this
  }

  protected onProceed(params?: TaskListParams | undefined): void {
    this.onExecute(params)
  }

  protected interceptPause(params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      getList(ctx.taskList, params).forEach((task) => {
        task.pause()
        arrayDelete(ctx.taskQueue, task)
      })
    }
    return this.idle
  }

  protected interceptCancel(params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      getList(ctx.taskList, params).forEach((task) => {
        task.cancel()
        arrayDelete(ctx.taskQueue, task)
      })
    }
    return this.idle
  }

  protected cut(next: Next) {
    if (this.end) {
      next(true)
    }
    else {
      this.waitExecutableTaskQueue.forEach((task) => {
        task.start()
          .then((t) => {
            this.callback && this.callback(t)
            arrayDelete(this.taskQueue, task)
          })
          .catch(error => this.errorCallback(error, task, this))
          .then(() => next(this.end))
          .catch(error => this.triggerReject(error))
      })
    }

    return this
  }
}

type valueType = number | Task
type TaskListParams = valueType | valueType[]
interface TaskListCtx {
  taskList: Task[]
  taskQueue: Task[]
}

export {
  TaskList,
  valueType,
  TaskListParams,
}
