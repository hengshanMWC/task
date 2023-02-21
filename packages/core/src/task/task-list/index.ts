import type { BaseTask } from '../../core'
import type { Next } from '../task'
import { Task } from '../task'
import { arrayDelete, getIndexList, getList, getNotActiveTask, getStatusTask } from './utils'

class TaskList extends Task<TaskListParams, TaskListCtx> {
  private maxSync: number
  private callback?: (task: BaseTask, params: any) => void
  private initList: BaseTask[]

  constructor(list: BaseTask[] = [], callback?: TaskList['callback'], maxSync = 1) {
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

  // 执行中队列
  get activeTaskList() {
    return getStatusTask(this.taskList, 'active')
  }

  // 空闲队列
  get idleTaskList() {
    return getStatusTask(this.taskList, 'idle')
  }

  // 暂停队列
  get pauseTaskList() {
    return getStatusTask(this.taskList, 'pause')
  }

  // 结束队列
  get endTaskList() {
    return getStatusTask(this.taskList, 'end')
  }

  // 执行队列
  get executableTaskQueue() {
    return this.taskQueue.slice(0, this.seat)
  }

  // 未结束队列
  get undoneTaskList() {
    return this.taskList.filter(task => task.status !== 'end')
  }

  // 剩余可执行数量
  get seat() {
    return Math.max(this.maxSync - this.taskQueue.length, 0)
  }

  // 队列空闲
  get standby() {
    return this.taskQueue.length === 0
  }

  setMaxSync(index: number) {
    const ctx = this.ctx
    const oldMaxSync = this.maxSync
    const maxSync = Math.max(index, 0)
    const num = maxSync - oldMaxSync
    this.maxSync = maxSync
    if (ctx) {
      if (num > 0) {
        this.start(ctx.taskQueue.splice(oldMaxSync, num))
      }
      else if (num < 0) {
        this.pause(ctx.taskQueue.splice(maxSync, Math.abs(num)))
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

  // TODO大问题
  protected createCtx(params?: TaskListParams): TaskListCtx | undefined {
    const list: BaseTask[] = [...this.initList]
    const taskList: BaseTask[] = []
    const taskQueue: BaseTask[] = []
    if (Array.isArray(params)) {
      if (typeof params[0] === 'number') {
        getNotActiveTask(this.initList, params)
      }
      else {
        // this.initList
      }
    }
    return {
      taskList: list,
      taskQueue: this.createQueueTasks(list),
    }
  }

  protected onExecute(params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      const list = getNotActiveTask(ctx.taskList, params)
      ctx.taskList.push(...list)
      ctx.taskQueue.push(...this.createQueueTasks(list))
    }
    return this
  }

  protected interceptPause(params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      getList(ctx.taskList, params).forEach((task) => {
        task.pause()
        arrayDelete(ctx.taskQueue, task)
      })
    }
    return this.standby
  }

  protected interceptCancel(params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      getList(ctx.taskList, params).forEach((task) => {
        task.cancel()
        arrayDelete(ctx.taskQueue, task)
      })
    }
    return this.standby
  }

  private createQueueTasks(list: BaseTask | BaseTask[]) {
    const tasks = Array.isArray(list) ? list : []
    return tasks.map(task => this.createQueueTask(task))
  }

  private createQueueTask(task: BaseTask) {
    return task
  }

  protected cut(next: Next) {
    this.taskQueue.forEach((task) => {
      task.start()
        .then((...params) => this.callback && this.callback(task, ...params))
        .catch(err => this.triggerReject(err))
        .finally(() => next(!this.taskList.length))
    })
    return this
  }
}

type valueType = number | BaseTask
type TaskListParams = valueType | valueType[]
interface TaskListCtx {
  taskList: BaseTask[]
  taskQueue: BaseTask[]
}

export {
  TaskList,
  valueType,
  TaskListParams,
}
