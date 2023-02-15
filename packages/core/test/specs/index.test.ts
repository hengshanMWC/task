import { describe, expect, test, vi } from 'vitest'
import { Task } from '../../src/index'
import { wait } from '../utils'
const value = 2

class TestTask extends Task<number> {
  cut(next) {
    if (this.ctx === value + 1) {
      throw new Error('test')
    }
    else {
      Promise.resolve()
        .then(() => {
          next(() => {
            if (this.ctx) {
              this.ctx--
            }
            else {
              return true
            }
          })
        })
    }
    return this
  }
}
describe('test', () => {
  test('start->pause->start', async () => {
    const task = new TestTask()
    expect(task.status).toBe('idle')
    const p = task.start(value)
    p.then(() => {
      expect(task.status).toBe('end')
    })
    // 测试是否同一个Promise
    expect(p).toBe(task.start())
    expect(task.status).toBe('active')
    // 测试暂停
    task.pause()
    await wait()
    expect(task.status).toBe('pause')
    expect(value - 1).toBe(task.ctx)
    // 测试重新启动
    expect(p).toBe(task.start())
    expect(task.status).toBe('active')
  })
  test('cancel', () => {
    const task = new TestTask()
    task.start(value)
    task.cancel()
    expect(task.ctx).toBeUndefined()
    expect(task.status).toBe('end')
  })
  test('reset', async () => {
    const task = new TestTask()
    const p = task.start(value)
    const p2 = task.reset(value)
    expect(p).not.toBe(p2)
    await Promise.resolve()
    expect(value - 1).toBe(task.ctx)
  })
  test('error', async () => {
    const task = new TestTask()
    const fn = vi.fn()
    try {
      await task.start(value + 1)
    }
    catch {
      fn()
    }
    expect(fn).toHaveBeenCalled()
  })
})
