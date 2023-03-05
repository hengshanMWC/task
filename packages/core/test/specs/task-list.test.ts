import { describe, expect, test, vi } from 'vitest'
import { TaskList } from '../../src'
import { TestTask, wait } from '../utils'
describe('base', () => {
  test('start', async () => {
    const handleSuccess = vi.fn()
    const taskList = new TaskList()
    try {
      await taskList.start()
      handleSuccess()
    }
    catch {
    }
    expect(handleSuccess).toHaveBeenCalled()
  })
  test('pause', async () => {
    const handleSuccess = vi.fn()
    const task = createAlarmClockList()[0]
    const taskList = new TaskList([task], (t) => {
      expect(t).toBe(task)
    })
    const p1 = taskList.start()

    expect(taskList.taskQueue[0].task).toBe(task)
    expect(taskList.taskList[0]).toBe(task)
    expect(taskList.taskList.length).toBe(1)
    expect(taskList.taskQueue.length).toBe(1)
    expect(taskList.undoneTaskList.length).toBe(1)
    expect(taskList.idle).toBeFalsy()

    p1.then(handleSuccess)
    taskList.pause()
    expect(taskList.idle).toBeTruthy()

    expect(taskList.taskQueue.length).toBe(0)

    await wait()

    expect(handleSuccess).not.toHaveBeenCalled()

    const p2 = taskList.start()

    expect(taskList.taskQueue.length).toBe(1)

    await p2

    expect(taskList.taskQueue.length).toBe(0)
    expect(taskList.undoneTaskList.length).toBe(0)
    expect(taskList.endTaskList.length).toBe(1)
    expect(handleSuccess).toHaveBeenCalled()
    expect(taskList.end).toBeTruthy()
    expect(p1).toBe(p2)
  })
  test('cancel', async () => {
    const handleSuccess = vi.fn()
    const handleSuccess2 = vi.fn()
    const task = createAlarmClockList()[0]
    const taskList = new TaskList([task])
    const p1 = taskList.start()
    p1.then(handleSuccess)
    expect(taskList.undoneTaskList.length).toBe(1)
    taskList.cancel()
    expect(taskList.undoneTaskList.length).toBe(0)
    await wait()
    expect(handleSuccess).not.toHaveBeenCalled()
    const p2 = taskList.start([task])
    p2.then(handleSuccess2)
    await p2
    expect(handleSuccess).not.toHaveBeenCalled()
    expect(handleSuccess2).toHaveBeenCalled()
    expect(p1).not.toBe(p2)
  })
  test('reset', async () => {
    const handleSuccess = vi.fn()
    const handleSuccess2 = vi.fn()
    const task = createAlarmClockList()[0]
    const taskList = new TaskList([task])
    const p1 = taskList.start()
    p1.then(handleSuccess)
    const p2 = taskList.reset([task])
    p2.then(handleSuccess2)
    await p2
    expect(handleSuccess).not.toHaveBeenCalled()
    expect(handleSuccess2).toHaveBeenCalled()
    expect(p1).not.toBe(p2)
  })
})

describe('ability', () => {
  test('setMaxSync', async () => {
    const callback = vi.fn()
    const tasks = createAlarmClockList(5)
    const taskList = new TaskList(tasks, callback, -1)
    const p = taskList.start(tasks[0])
    expect(taskList.executableTaskQueue.length).toBe(0)
    taskList.setMaxSync(2)
    expect(taskList.executableTaskQueue.length).toBe(1)
    taskList.setMaxSync(0)
    expect(taskList.executableTaskQueue.length).toBe(0)
    taskList.start(tasks[1])
    taskList.setMaxSync(2)
    expect(taskList.executableTaskQueue.length).toBe(2)
    taskList.setMaxSync(1)
    expect(taskList.executableTaskQueue.length).toBe(1)
    expect(taskList.executableTaskQueue[0].task).toBe(tasks[0])
    taskList.setMaxSync(3)
    expect(taskList.executableTaskQueue.length).toBe(2)
    taskList.start()
    await p
    expect(callback).toHaveBeenCalledTimes(5)
  })
  test('move', async () => {
    const tasks = createAlarmClockList(3)
    const task = createAlarmClockList()[0]
    const taskList = new TaskList(tasks)
    taskList.start()
    expect(taskList.taskList[0]).toBe(tasks[0])
    expect(taskList.taskList[1]).toBe(tasks[1])
    expect(taskList.taskList[2]).toBe(tasks[2])

    taskList.move(0, 1)
    expect(taskList.taskList[0]).toBe(tasks[1])
    expect(taskList.taskList[1]).toBe(tasks[0])
    expect(taskList.taskList[2]).toBe(tasks[2])

    function regular() {
      expect(taskList.taskList[0]).toBe(tasks[1])
      expect(taskList.taskList[1]).toBe(tasks[2])
      expect(taskList.taskList[2]).toBe(tasks[0])
    }

    taskList.move(tasks[2], tasks[0])
    regular()

    // 无效
    taskList.move(tasks[2], task)
    regular()

    // 无效
    taskList.move(task, tasks[2])
    regular()

    // 无效
    taskList.move(1, 3)
    regular()

    // 无效
    taskList.move(3, 1)
    regular()
  })
})

describe('on', () => {
  test('onParams', () => {
    const tasks = createAlarmClockList()
    const taskList = new TaskList(tasks)
    taskList.onParams((task, _taskList) => {
      expect(task).toBe(tasks[0])
      expect(taskList).toBe(_taskList)
      return 1
    })
    taskList.start()
    expect(taskList.taskQueue[0].task.ctx).toBe(1)
  })
})

function createAlarmClockList(num = 1) {
  return Array(num).fill(1).map((item, index) => new TestTask())
}
