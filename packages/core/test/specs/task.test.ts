import { describe, expect, test, vi } from 'vitest'
import { TestTask, wait } from '../utils'

describe('test', () => {
  test('start->pause->start', async () => {
    const task = new TestTask()
    expect(task.status).toBe('idle')
    const p = task.start(TestTask.value)
    p.then((t) => {
      expect(t).toBe(task)
      expect(task.status).toBe('end')
    })
    const p2 = task.start()
    // 测试是否同一个Promise
    expect(p).toBe(p2)
    expect(task.status).toBe('active')
    // 测试暂停
    task.pause()
    await wait()
    expect(task.status).toBe('pause')
    expect(TestTask.value).toBe(task.ctx)
    const p3 = task.start()
    // 测试重新启动
    expect(p).toBe(p3)
    expect(task.status).toBe('active')
  })
  test('cancel', () => {
    const task = new TestTask()
    task.start(TestTask.value)
    task.cancel()
    expect(task.status).toBe('end')
  })
  test('reset', async () => {
    const task = new TestTask()
    const p = task.start(TestTask.value)
    const p2 = task.reset(TestTask.value)
    expect(p).not.toBe(p2)
    await Promise.resolve()
    expect(TestTask.value - 1).toBe(task.ctx)
  })
  test('error', async () => {
    const task = new TestTask()
    const fn = vi.fn()
    try {
      await task.start(TestTask.errorValue)
    }
    catch {
      fn()
    }
    expect(fn).toHaveBeenCalled()
  })
})
