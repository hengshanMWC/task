import { describe, expect, test } from 'vitest'
import { Task } from '../../src/index'
class TestTask extends Task<number> {
  cut() {
    if (this.ctx) {
      Promise.resolve()
        .then(() => {
          this.ctx--
          this.next()
        })
      return this
    }
    else {
      return this.next(true)
    }
  }
}
describe('test', () => {
  test('base', async () => {
    const value = 2
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
    await Promise.resolve()
    expect(task.status).toBe('pause')
    expect(value - 1).toBe(task.ctx)
    // 测试重新启动
    expect(p).toBe(task.start())
    expect(task.status).toBe('active')
  })
})
