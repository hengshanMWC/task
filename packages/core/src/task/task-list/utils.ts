import type { BaseTask } from '../../core'
import type { valueType, valuesType } from './index'
function getItem(list: BaseTask[], value: valueType) {
  return typeof value === 'number' ? list[value] : value
}

function getList(list: BaseTask[], value?: valuesType): BaseTask[] {
  if (value === undefined) {
    return list
  }
  const arr = Array.isArray(value) ? value : [value]
  return arr.map(value => getItem(list, value))
}

function getIndex(list: BaseTask[], value: valueType) {
  return typeof value === 'number' ? value : list.findIndex(task => task === value)
}

function getIndexList(list: BaseTask[], value?: valuesType): number[] {
  if (value === undefined) {
    return list.map((task, index) => index)
  }
  const arr = Array.isArray(value) ? value : [value]
  return arr.map(value => this.getIndex(list, value))
}

export {
  getList,
  getIndex,
  getIndexList,
}
