import type { BaseTask, TaskStatus } from '@task/core'
import { CurrentPromise } from '@task/core'

function getStatusTask(statusTaskList: StatusTask[], status: TaskStatus,
) {
  return statusTaskList
    .filter(statusTask => statusTask.status === status)
    .map(statusTask => statusTask.task)
}

export abstract class TaskList extends CurrentPromise implements BaseTask {
  status: TaskStatus = 'idle'
  protected maxSync = 1
  statusTaskList: StatusTask[] = []
  constructor(maxSync: number) {
    super()
    this.setMaxSync(maxSync)
  }

  get taskList() {
    return this.statusTaskList.map(statusTask => statusTask.task)
  }

  // 执行中队列
  get activeTaskList() {
    return getStatusTask(this.statusTaskList, 'active')
  }

  // 预备队列
  get prepareTaskList() {
    return getStatusTask(this.statusTaskList, 'idle')
  }

  // 暂停队列
  get pauseTaskList() {
    return getStatusTask(this.statusTaskList, 'pause')
  }

  // 会变化的队列
  get entropyTaskList() {
    return this.activeTaskList.concat(this.prepareTaskList)
  }

  // 等待队列
  get waitTaskList() {
    return this.prepareTaskList.concat(this.pauseTaskList)
  }

  // 可执行队列
  get executableTaskList() {
    return this.prepareTaskList.slice(0, this.seat)
  }

  // 剩余可执行数量
  get seat() {
    return Math.max(this.maxSync - this.activeTaskList.length, 0)
  }

  start(value?: valuesType) {
    // 筛选出不存在于队列的任务或者空闲的任务
    const list = this.getTasks(value).filter((task) => {
      const index = this.getTaskPlace(task)
      return index === -1 || this.statusTaskList[index].status !== 'active'
    })

    // 放到预备队列
    this.statusTaskList.push(
      ...this.createStatusTask(list.splice(0, this.seat)),
    )

    if (this.status !== 'active') {
      this.status = 'active'
      this.currentPromise = new Promise((resolve, reject) => {
        this.currentResolve = resolve
        this.currentReject = reject
        this.run()
      })
      this.currentPromise.finally(() => this.status = 'end')
    }

    return this.currentPromise as Promise<BaseTask>
  }

  pause(value?: valuesType) {
    const list: BaseTask[] = []
    if (value === undefined) {
      this.status = 'pause'
      list.push(...this.entropyTaskList)
    }
    else {
      list.push(
        ...this.getTasks(value).filter(task =>
          this.entropyTaskList.includes(task),
        ),
      )
    }
    return this.executePause(list).run()
  }

  cancel(value?: valuesType) {
    const list: BaseTask[] = []
    if (value === undefined) {
      this.status = 'idle'
      this.prepareTaskList.length = 0
      this.currentPromise = undefined
      this.currentReject = undefined
      this.currentResolve = undefined
      list.push(...this.activeTaskList)
    }
    else {
      list.push(
        ...this.getTasks(value).filter(task =>
          this.activeTaskList.includes(task),
        ),
      )
    }
    return this.executeCancel(list).run()
  }

  clear() {
    this.cancel()
    this.statusTaskList.length = 0
  }

  setMaxSync(index: number) {
    const maxSync = Math.max(index, 0)
    const num = maxSync - this.maxSync
    if (num > 0) {
      this.start(this.waitTaskList.splice(0, num))
    }
    else if (num < 0) {
      const entropyTaskList = this.entropyTaskList.splice(num, Math.abs(num))
      this.pause(entropyTaskList)
    }
    this.maxSync = maxSync
    return this
  }

  move(originValue: valueType, targetValue?: valueType) {
    const originIndex = this.getIndexs(originValue)[0]
    if (!isNaN(originIndex)) {
      const targetIndex = this.getIndexs(targetValue || 0)[0]
      if (originIndex !== targetIndex) {
        const statusTask = this.statusTaskList.splice(originIndex, 1)[0]
        this.statusTaskList.splice(targetIndex, 0, statusTask)
      }
    }
    return this
  }

  createStatusTask(taskList: BaseTask | BaseTask[], status: TaskStatus = 'idle') {
    const list = Array.isArray(taskList) ? taskList : [taskList]
    return list.map(task => ({
      status,
      task,
    }))
  }

  getTaskPlace(task: BaseTask) {
    return this.taskList.findIndex(item => item === task)
  }

  getTask(index: number) {
    return this.taskList[index]
  }

  getTasks(value?: valuesType): BaseTask[] {
    if (value === undefined) {
      return this.taskList
    }
    const arr = Array.isArray(value) ? value : [value]
    if (arr[0] instanceof Number) {
      return (arr as number[]).map(index => this.getTask(index))
    }
    else {
      return arr as BaseTask[]
    }
  }

  getIndexs(value?: valuesType): number[] {
    if (value === undefined) {
      return this.taskList.map((task, index) => index)
    }
    const arr = Array.isArray(value) ? value : [value]
    if (arr[0] instanceof Number) {
      return arr as number[]
    }
    else {
      return arr.map(task => this.getTaskPlace(task as BaseTask))
    }
  }

  private run() {
    if (this.status === 'active') {
      if (this.executableTaskList.length) {
        this.executableTaskList.forEach((task) => {
          const index = this.getTaskPlace(task)
          const statusTask = this.statusTaskList[index]
          statusTask.status = 'active'
          statusTask.task.start().then(() => {
            this.pop(task).run()
          })
        })
      }
      else {
        this.triggerResolve(this)
      }
    }
    return this
  }

  private pop(task: BaseTask) {
    const index = this.getTaskPlace(task)
    if (index !== -1) {
      this.statusTaskList.splice(index, 1)
    }
    return this
  }

  private executePause(list: BaseTask[]) {
    list.forEach((task) => {
      this.setStatusTaskStatus(task, 'pause')
      task.pause()
    })
    return this
  }

  private executeCancel(list: BaseTask[]) {
    list.forEach((task) => {
      this.pop(task)
      task.cancel()
    })
    return this
  }

  private setStatusTaskStatus(task: BaseTask, status: TaskStatus) {
    const statusTask = this.statusTaskList.find(
      statusTask => statusTask.task === task,
    )
    if (statusTask) {
      statusTask.status = status
    }
    return this
  }
}

interface StatusTask {
  task: BaseTask
  status: TaskStatus
}
type valueType = number | BaseTask
type valuesType = valueType | valueType[]
