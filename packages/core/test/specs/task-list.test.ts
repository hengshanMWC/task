import { describe, expect, test, vi } from 'vitest'
import { AlarmClock, TaskList } from '../../src'
import { wait } from '../utils'
/**
 * @vitest-environment jsdom
 */
describe('test', () => {
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
      .then(handleSuccess)
    taskList.pause()
    await wait()
    expect(handleSuccess).not.toHaveBeenCalled()
    const p2 = taskList.start()
    await p2
    expect(handleSuccess).toHaveBeenCalled()
    expect(p2).toBe(p1)
  })
})
