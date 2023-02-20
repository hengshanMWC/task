import type { BaseTask, TaskStatus } from '../../core'
import type { Next } from '../task'
import { Task } from '../task'
import { getIndex, getIndexList, getList } from './utils'

class TaskList extends Task<valuesType, TaskListCtx> {
  status: TaskStatus = 'idle'
  taskList: BaseTask[] = []
  protected maxSync = 1

  constructor(maxSync: number) {
    super()
    this.setMaxSync(maxSync)
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
  get executableTaskList() {
    return this.prepareTaskList.slice(0, this.seat)
  }

  // 未结束队列
  get undoneTaskList() {
    return this.taskList.filter(task => task.status !== 'end')
  }

  // 剩余可执行数量
  get seat() {
    return Math.max(this.maxSync - this.activeTaskList.length, 0)
  }

  protected interceptPause(params?: valuesType) {
    const ctx = this.ctx
    if (ctx) {
      const list = getList(ctx.taskQueue, params)
      list.forEach((task) => {
        task.pause()
        this.pop(ctx.taskQueue, task)
      })
    }
  }

  pause(value?: valuesType) {
    this.getTargetTaskList(this.prepareTaskList, value).forEach(task => task.pause())
    if (this.resetStatus().status === 'pause') {
      return this
    }
    else {
      this.start()
      return this
    }
  }

  cancel(value?: valuesType) {
    this.getTargetTaskList(this.taskList, value).forEach((task) => {
      this.pop(this.taskList, task)
      task.cancel()
    })
    if (this.resetStatus('end').status === 'end') {
      return this.clear()
    }
    else {
      this.start()
      return this
    }
  }

  reset(value?: valuesType) {
    this.getTargetTaskList(this.taskList, value).forEach(task => task.cancel())
    return this.resetStatus().start()
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
    const originIndex = getIndexList(this.ctx?.taskList, originValue)[0]
    // 判断是正常的index
    if (!isNaN(originIndex)) {
      const originTask = this.taskList.splice(originIndex, 1)[0]
      const targetIndex = getIndexList(this.ctx?.taskList, targetValue || 0)[0]
      if (!isNaN(targetIndex)) {
        this.taskList.splice(targetIndex, 0, originTask)
      }
    }
    return this
  }

  protected createCtx(params?: valuesType): TaskListCtx | undefined {
    let list: BaseTask[] = []
    if (params) {
      list = this.getNotActiveTask(params)
    }
    return {
      taskList: list,
      taskQueue: this.createQueueTasks(list),
    }
  }

  protected inProgress(params?: valuesType) {
    const list = this.getNotActiveTask(params)
    this.ctx?.taskList.push(...list)
    this.ctx?.taskQueue.push(...this.createQueueTasks(list))
    return this
  }

  private getNotActiveTask(params?: valuesType) {
    if (!this.ctx)
      return []
    return getList(this.ctx.taskList, params).filter((task) => {
      if (this.ctx) {
        const index = getIndex(this.ctx.taskList, task)
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
        .finally(() => next(!this.ctx?.taskList.length))
    })
    return this
  }

  private pop(list: BaseTask[], task: BaseTask) {
    const index = getIndex(list, task)
    if (index !== -1) {
      list.splice(index, 1)
    }
    return this
  }

  private resetStatus(status: TaskStatus = 'idle') {
    const taskListLength = this.taskList.length
    if (this.prepareTaskList.length) {
      this.status = 'active'
    }
    else if (this.pauseTaskList.length === taskListLength) {
      this.status = 'pause'
    }
    else {
      this.status = status
    }
    return this
  }

  private getTargetTaskList(originTask: BaseTask[], value?: valuesType) {
    if (value === undefined) {
      return originTask
    }
    else {
      return getList(originTask, value).filter(task => originTask.includes(task))
    }
  }
}

type valueType = number | BaseTask
type valuesType = valueType | valueType[]
interface TaskListCtx {
  taskList: BaseTask[]
  taskQueue: BaseTask[]
}

function getStatusTask(list: BaseTask[], status: TaskStatus,
) {
  return list.filter(item => item.status === status)
}

export {
  TaskList,
  valueType,
  valuesType,
}
