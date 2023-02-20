import type { BaseTask, TaskStatus } from '../../core'
import type { Next } from '../task'
import { Task } from '../task'
import { arrayDelete, getIndex, getIndexList, getList, getStatusTask, getTargetTaskList } from './utils'

class TaskList extends Task<TaskListParams, TaskListCtx> {
  protected maxSync = 1

  constructor(maxSync: number) {
    super()
    this.setMaxSync(maxSync)
  }

  get taskList() {
    return this.ctx?.taskList || []
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

  // 预备队列
  get prepareTaskList() {
    return this.activeTaskList.concat(this.idleTaskList)
  }

  // 等待队列
  get waitTaskList() {
    return this.idleTaskList.concat(this.pauseTaskList)
  }

  // 可执行队列
  get executableTaskQueue() {
    return this.ctx?.taskQueue.slice(0, this.seat) || []
  }

  // 未结束队列
  get undoneTaskList() {
    return this.taskList.filter(task => task.status !== 'end')
  }

  // 剩余可执行数量
  get seat() {
    return Math.max(this.maxSync - this.activeTaskList.length, 0)
  }

  setMaxSync(index: number) {
    const maxSync = Math.max(index, 0)
    const num = maxSync - this.maxSync
    if (num > 0) {
      this.start(this.waitTaskList.splice(0, num))
    }
    else if (num < 0) {
      const prepareTaskList = this.prepareTaskList.splice(num, Math.abs(num))
      this.pause(prepareTaskList)
    }
    this.maxSync = maxSync
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

  protected createCtx(params?: TaskListParams): TaskListCtx | undefined {
    let list: BaseTask[] = []
    if (params) {
      list = this.getNotActiveTask(params)
    }
    return {
      taskList: list,
      taskQueue: this.createQueueTasks(list),
    }
  }

  protected inProgress(params?: TaskListParams) {
    const list = this.getNotActiveTask(params)
    this.ctx?.taskList.push(...list)
    this.ctx?.taskQueue.push(...this.createQueueTasks(list))
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
    return ctx?.taskQueue.length === 0
  }

  protected interceptCancel(params?: TaskListParams) {
    const ctx = this.ctx
    if (ctx) {
      getList(ctx.taskList, params).forEach((task) => {
        task.cancel()
        arrayDelete(ctx.taskQueue, task)
      })
    }
    return ctx?.taskQueue.length === 0
  }

  private getNotActiveTask(params?: TaskListParams) {
    if (!this.ctx)
      return []
    return getList(this.taskList, params).filter((task) => {
      if (this.ctx) {
        const index = getIndex(this.taskList, task)
        return index === -1 || this.ctx?.taskList[index].status !== 'active'
      }
      else {
        return false
      }
    })
  }

  private createQueueTasks(list: BaseTask | BaseTask[]) {
    const tasks = Array.isArray(list) ? list : []
    return tasks.map(task => this.createQueueTask(task))
  }

  private createQueueTask(task: BaseTask) {
    return task
  }

  protected cut(next: Next) {
    this.ctx?.taskQueue.forEach((item) => {
      item.start()
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
