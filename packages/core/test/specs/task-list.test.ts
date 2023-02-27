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
    const taskList = new TaskList([task])
    const p1 = taskList.start()
    p1.then(handleSuccess)
    taskList.pause()
    await wait()
    expect(handleSuccess).not.toHaveBeenCalled()
    const p2 = taskList.start()
    await p2
    expect(handleSuccess).toHaveBeenCalled()
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
    taskList.cancel()
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

})
