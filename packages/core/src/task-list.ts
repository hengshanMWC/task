import type { BaseTask, TaskStatus } from './core'
import { Task } from './task'

export class TaskList extends Task {
  status: TaskStatus = 'idle'
  protected maxSync = 1
  taskList: BaseTask[] = []
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

  pause(value?: valuesType) {
    const list: BaseTask[] = []
    if (value === undefined) {
      list.push(...this.prepareTaskList)
    }
    else {
      list.push(
        ...this.getTasks(value).filter(task =>
          this.prepareTaskList.includes(task),
        ),
      )
    }
    this.executePause(list)
    if (this.resetStatus().status === 'pause') {
      return this
    }
    else {
      return this.cut()
    }
  }

  cancel(value?: valuesType) {
    const list: BaseTask[] = []
    if (value === undefined) {
      list.push(...this.taskList)
    }
    else {
      list.push(
        ...this.getTasks(value).filter(task =>
          this.taskList.includes(task),
        ),
      )
    }
    this.executeCancel(list)
    if (this.resetStatus().status === 'idle') {
      return this.clear()
    }
    else {
      return this.cut()
    }
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
    // 获取源的index
    const originIndex = this.getIndexs(originValue)[0]
    // 判断是正常的index
    if (!isNaN(originIndex)) {
      const originTask = this.taskList.splice(originIndex, 1)[0]
      const targetIndex = this.getIndexs(targetValue || 0)[0]
      if (!isNaN(targetIndex)) {
        this.taskList.splice(targetIndex, 0, originTask)
      }
    }
    return this
  }

  getTask(value: valueType) {
    return typeof value === 'number' ? this.taskList[value] : value
  }

  getTasks(value?: valuesType): BaseTask[] {
    if (value === undefined) {
      return this.taskList
    }
    const arr = Array.isArray(value) ? value : [value]
    return arr.map(value => this.getTask(value))
  }

  getIndex(value: valueType) {
    return typeof value === 'number' ? value : this.taskList.findIndex(task => task === value)
  }

  getIndexs(value?: valuesType): number[] {
    if (value === undefined) {
      return this.taskList.map((task, index) => index)
    }
    const arr = Array.isArray(value) ? value : [value]
    return arr.map(value => this.getIndex(value))
  }

  protected run(value?: valuesType) {
    // 筛选出不存在于队列的任务或者空闲的任务
    const list = this.getTasks(value).filter((task) => {
      const index = this.getIndex(task)
      return index === -1 || this.taskList[index].status !== 'active'
    })

    // 放到预备队列
    this.taskList.push(...list.splice(0, this.seat))
    return this
  }

  protected cut() {
    this.executableTaskList.forEach((task) => {
      task.start()
        .finally(() => this.next(!this.taskList.length))
    })
    return this
  }

  private pop(task: BaseTask) {
    const index = this.getIndex(task)
    if (index !== -1) {
      this.taskList.splice(index, 1)
    }
    return this
  }

  private executePause(list: BaseTask[]) {
    list.forEach(task => task.pause())
    return this
  }

  private executeCancel(list: BaseTask[]) {
    list.forEach((task) => {
      this.pop(task)
      task.cancel()
    })
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
}

type valueType = number | BaseTask
type valuesType = valueType | valueType[]
enum TaskMark {
  ING, // 进行中
  PREPARE, // 预备
  WAIT, // 等待
  PAUSE, // 等待
  END, // 结束
}

function getStatusTask(list: BaseTask[], status: TaskStatus,
) {
  return list.filter(item => item.status === status)
}
