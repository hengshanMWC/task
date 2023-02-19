import { describe, expect, test, vi } from 'vitest'
import type { AlarmClockCtx } from '../../src/index'
import { AlarmClock, AlarmClockStatus } from '../../src/index'
import { wait } from '../utils'
const time = 0.001
/**
 * @vitest-environment jsdom
 */
describe('test', () => {
  test('start', async () => {
    const task = new AlarmClock()
    await task.start({
      time,
    })
    if (task.ctx) {
      expect(task.ctx.status).toBe(AlarmClockStatus.END)
      expect(task.ctx.endAlarmClockTime).toBe(0)
      expect(task.ctx.startAlarmClockTime).toBe(0)
    }
  })
  test('pause', async () => {
    const task = new AlarmClock()
    const callback = vi.fn((ctx: AlarmClockCtx) => {
      expect(ctx.endTime).not.toBe(endTime)
    })
    const startTime = Date.now() + 1
    const endTime = startTime + 1
    const handlesSuccess = vi.fn(() => {
      if (task.ctx) {
        expect(task.ctx.status).toBe(AlarmClockStatus.END)
        expect(task.ctx.endTime).toBeGreaterThan(endTime)
      }
    })
    task.start({
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
  test('cancel', async () => {
    const task = new AlarmClock()
    const handlesSuccess = vi.fn()
    const callback = vi.fn()
    const p1 = task.start({ time, callback })
      .then(handlesSuccess)
    task.cancel()
    await wait()
    const p2 = task.start({
      time: 1,
    })
    expect(p2).not.toBe(p1)
    await p2
    expect(callback).not.toHaveBeenCalled()
    expect(handlesSuccess).not.toHaveBeenCalled()
  })
})
