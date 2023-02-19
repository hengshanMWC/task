import { describe, expect, test, vi } from 'vitest'
import type { AlarmClockCtx } from '../../src/index'
import { AlarmClock, AlarmClockStatus } from '../../src/index'
import { wait } from '../utils'

describe('test', () => {
  test('start', () => {
    const time = 60
    const task = new AlarmClock()
    task.start({
      callback(ctx) {
        expect(ctx.time).toBe(time)
        expect(ctx.endAlarmClockTime).not.toBe(0)
      },
    })
      .then(() => {
        if (task.ctx) {
          expect(task.ctx.status).toBe(AlarmClockStatus.END)
          expect(task.ctx.endAlarmClockTime).toBe(0)
          expect(task.ctx.startAlarmClockTime).toBe(0)
        }
      })
  })
  test('pause', async () => {
    const task = new AlarmClock()
    const callback = vi.fn((ctx: AlarmClockCtx) => {
      expect(ctx.endTime).not.toBe(endTime)
    })
    const handlesSuccess = vi.fn(() => {
      if (task.ctx) {
        expect(task.ctx.time).toBe(time)
        expect(task.ctx.status).toBe(AlarmClockStatus.END)
      }
    })
    const time = 1
    const startTime = Date.now()
    const endTime = startTime + 1000
    task.start({
      time,
      startTime,
      endTime,
      callback,
    })
      .then(handlesSuccess)
    task.pause()
    await wait()
    expect(callback).not.toHaveBeenCalled()
    await task.start()
    expect(callback).toHaveBeenCalled()
    expect(handlesSuccess).toHaveBeenCalled()
  })
})
