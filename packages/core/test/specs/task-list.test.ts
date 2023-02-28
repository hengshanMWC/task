import { describe, expect, test, vi } from 'vitest'
import { AlarmClock, TaskList } from '../../src'
import { wait } from '../utils'
/**
 * @vitest-environment jsdom
 */
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
    const task = new AlarmClock({
      time: 0.001,
    })
    const taskList = new TaskList([task], (t) => {
      expect(t).toBe(task)
    })
    const p1 = taskList.start()

    expect(taskList.taskQueue[0]).toBe(task)
    expect(taskList.taskList[0]).toBe(task)
    expect(taskList.taskList.length).toBe(1)
    expect(taskList.taskQueue.length).toBe(1)
    expect(taskList.idleTaskList.length).toBe(0)
    expect(taskList.activeTaskList.length).toBe(1)
    expect(taskList.undoneTaskList.length).toBe(1)
    expect(taskList.idle).toBeFalsy()

    p1.then(handleSuccess)
    taskList.pause()
    expect(taskList.idle).toBeTruthy()

    expect(taskList.taskQueue.length).toBe(0)
    expect(taskList.activeTaskList.length).toBe(0)
    expect(taskList.pauseTaskList.length).toBe(1)

    await wait()

    expect(handleSuccess).not.toHaveBeenCalled()

    const p2 = taskList.start()

    expect(taskList.taskQueue.length).toBe(1)
    expect(taskList.activeTaskList.length).toBe(1)

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
    const task = new AlarmClock({
      time: 0.001,
    })
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
    const task = new AlarmClock({
      time: 0.001,
    })
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
    const tasks = createAlarmClockList(3)
    const taskList = new TaskList(tasks, callback, -1)
    taskList.start(tasks[0])
    expect(taskList.executableTaskQueue.length).toBe(0)
    taskList.setMaxSync(2)
    expect(taskList.executableTaskQueue.length).toBe(1)
    taskList.setMaxSync(0)
    expect(taskList.executableTaskQueue.length).toBe(0)
    taskList.start(tasks[1])
    taskList.setMaxSync(2)
    expect(taskList.executableTaskQueue.length).toBe(2)
    // await wait()
    // expect(callback).toHaveBeenCalledTimes(1)
  })
})

function createAlarmClockList(num = 10) {
  return Array(num).fill(1).map(() => new AlarmClock({
    time: 0.001,
  }))
}
