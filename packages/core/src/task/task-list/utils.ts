import type { BaseTask, TaskStatus } from '../../core'
import type { TaskListParams, valueType } from './index'

function getItem(list: BaseTask[], value: valueType) {
  return typeof value === 'number' ? list[value] : value
}

function getList(list: BaseTask[], value?: TaskListParams): BaseTask[] {
  if (value === undefined) {
    return list
  }
  const arr = Array.isArray(value) ? value : [value]
  return arr.map(value => getItem(list, value))
}

function getIndex(list: BaseTask[], value: valueType) {
  return typeof value === 'number' ? value : list.findIndex(task => task === value)
}

function getIndexList(list: BaseTask[], value?: TaskListParams): number[] {
  if (value === undefined) {
    return list.map((task, index) => index)
  }
  const arr = Array.isArray(value) ? value : [value]
  return arr.map(value => this.getIndex(list, value))
}

function arrayDelete(list: BaseTask[], task: BaseTask) {
  const index = getIndex(list, task)
  if (index !== -1) {
    list.splice(index, 1)
  }
}

function getStatusTask(list: BaseTask[], status: TaskStatus,
) {
  return list.filter(item => item.status === status)
}

function getNotActiveTask(list: BaseTask[], params?: TaskListParams) {
  return getList(list, params).filter((task) => {
    const index = getIndex(list, task)
    return index === -1 || list[index]?.status !== 'active'
  })
}

export {
  getList,
  getIndexList,
  arrayDelete,
  getStatusTask,
  getNotActiveTask,
}
