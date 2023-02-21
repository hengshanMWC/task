import { describe, expect, test, vi } from 'vitest'
import type { AlarmClockCtx } from '../../src/index'
import { AlarmClock, AlarmClockStatus, AlarmClockTimerGroup, timerGroup } from '../../src/index'
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
    const startTime = Date.now() + 500 // 为了测试wait状态
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
    const task = new AlarmClock(undefined, AlarmClockTimerGroup.TIMEOUT)
    const handlesSuccess = vi.fn()
    const callback = vi.fn()
    const p1 = task.start({ time, callback })
      .then(handlesSuccess)
    task.cancel()
    await wait()
    const p2 = task.start({
      time,
    })
    expect(p2).not.toBe(p1)
    await p2
    expect(callback).not.toHaveBeenCalled()
    expect(handlesSuccess).not.toHaveBeenCalled()
  })
  test('reset', async () => {
    const task = new AlarmClock(undefined, timerGroup[AlarmClockTimerGroup.TIMEOUT])
    const handlesSuccess = vi.fn()
    const callback = vi.fn()
    const p1 = task.start({ time, callback })
      .then(handlesSuccess)
    const p2 = task.reset({
      time,
    })
    expect(p2).not.toBe(p1)
    await p2
    expect(callback).not.toHaveBeenCalled()
    expect(handlesSuccess).not.toHaveBeenCalled()
  })
})
