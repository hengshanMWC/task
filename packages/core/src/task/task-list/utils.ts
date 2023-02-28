import type { TaskStatus } from '../../core'
import type { Task } from '../task'
import type { TaskListParams, valueType } from './index'

function getItem(list: Task[], value: valueType) {
  return typeof value === 'number' ? list[value] : value
}

function getList(list: Task[], value?: TaskListParams): Task[] {
  if (value === undefined) {
    return list
  }
  const arr = Array.isArray(value) ? value : [value]
  return arr.map(value => getItem(list, value))
}

function getIndex(list: Task[], value: valueType) {
  return typeof value === 'number' ? value : list.findIndex(task => task === value)
}

function getIndexList(list: Task[], value?: TaskListParams): number[] {
  if (value === undefined) {
    return list.map((task, index) => index)
  }
  const arr = Array.isArray(value) ? value : [value]
  return arr.map(value => this.getIndex(list, value))
}

function arrayDelete(list: Task[], task: Task) {
  const index = getIndex(list, task)
  if (index !== -1) {
    list.splice(index, 1)
  }
}

function getStatusTask(list: Task[], status: TaskStatus,
) {
  return list.filter(item => item.status === status)
}

function getNotActiveTask(list: Task[], params?: TaskListParams) {
  return getList(list, params).filter((task) => {
    const index = getIndex(list, task)
    return index === -1 || list[index]?.status !== 'active'
  })
}

function nonExistent(list: Task[], item: valueType) {
  return typeof item !== 'number' && !list.includes(item)
}

export {
  getList,
  getIndexList,
  arrayDelete,
  getStatusTask,
  getNotActiveTask,
  nonExistent,
}
