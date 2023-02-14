import { describe, expect, test } from 'vitest'
import { Task } from '../../src/index'
import { wait } from '../utils'
describe('test', () => {
  test('demo', async () => {
    class TestTask extends Task {
      cut() {
        return this.next(true)
      }

      run() {
        return this
      }
    }
    const task = new TestTask()
    expect(task.status).toBe('idle')
    const p = task.start()
    expect(p).toBe(task.start())
    expect(task.status).toBe('active')
    await wait(1000)
    expect(p).toBe(task.start())
    expect(task.status).toBe('end')
  })
})
