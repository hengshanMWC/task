import { describe, expect, test, vi } from 'vitest'
import { CountDown } from '../../src/index'
import { wait } from '../utils'

describe('test', () => {
  test('default', async () => {
    const time = 60
    const task = new CountDown()
    vi.useFakeTimers()
    task.start()
      .then(() => {
        if (task.ctx) {
          expect(task.ctx.time).toBe(time)
        }
      })
  })
})
