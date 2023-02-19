import type { Next } from './task'
import { Task } from './task'

class AlarmClock extends Task<AlarmClockParams, AlarmClockCtx> {
  timer: NodeJS.Timeout
  timerGroup: TimerGroup
  constructor(timerGroupValue: AlarmClockTimerGroup | TimerGroup = AlarmClockTimerGroup.FRAME) {
    super()
    if (typeof timerGroupValue === 'number') {
      this.timerGroup = timerGroup[timerGroupValue]
    }
    else {
      this.timerGroup = timerGroupValue
    }
  }

  protected cut(next) {
    this.timer = this.timing(() => {
      if (this.ctx) {
        this.dealWith(next, this.ctx)
      }
    })
    return this
  }

  protected interceptPause() {
    this.stop()
  }

  protected interceptCancel() {
    this.stop()
  }

  protected createCtx(params?: AlarmClockParams) {
    if (!this.ctx) {
      return this.createContext(params)
    }
  }

  protected proceed() {
    if (this.ctx) {
      const gap = Date.now() - this.ctx.currentTime
      this.ctx.currentTime = +gap
      this.ctx.endTime = +gap
    }
  }

  private createContext(params?: AlarmClockParams): AlarmClockCtx {
    const currentTime = Date.now()
    const time = params?.time || 60
    const startTime = params?.startTime || currentTime
    const endTime = params?.endTime || startTime + time * 1000
    return {
      time,
      startTime,
      currentTime,
      endTime,
      get endAlarmClockTime() {
        return Math.max(this.endTime - this.currentTime, 0)
      },
      get startAlarmClockTime() {
        return Math.max(this.startTime - this.currentTime, 0)
      },
      get status() {
        if (!this.endAlarmClockTime) {
          return AlarmClockStatus.END
        }
        else if (!this.startAlarmClockTime) {
          return AlarmClockStatus.ACTIVITY
        }
        else {
          return AlarmClockStatus.WAIT
        }
      },
      callback: params?.callback,
    }
  }

  private dealWith(next: Next, ctx: AlarmClockCtx) {
    next(() => {
      if (ctx.endAlarmClockTime) {
        ctx.currentTime = Date.now()
      }
      ctx.callback && ctx.callback(ctx)
      return ctx.status === AlarmClockStatus.END
    })
  }

  stop() {
    this.timerGroup.stop()(this.timer)
    return this
  }

  timing(fn: Function) {
    return this.timerGroup.timing()(fn)
  }
}

type AlarmClockCallback = (ctx: AlarmClockCtx) => void
interface AlarmClockParams {
  time?: number
  startTime?: number
  endTime?: number
  callback?: AlarmClockCallback
}

interface AlarmClockCtx {
  time: number
  startTime: number
  currentTime: number
  endTime: number
  readonly endAlarmClockTime: number
  readonly startAlarmClockTime: number
  readonly status: AlarmClockStatus
  callback?: AlarmClockCallback
}

enum AlarmClockStatus {
  WAIT,
  ACTIVITY,
  END,
}

enum AlarmClockTimerGroup {
  FRAME,
  TIMEOUT,
}
interface TimerGroup {
  stop: () => Function
  timing: () => Function
}

const timerGroup: Record<AlarmClockTimerGroup, TimerGroup> = {
  [AlarmClockTimerGroup.FRAME]: {
    stop: () => requestAnimationFrame,
    timing: () => cancelAnimationFrame,
  },
  [AlarmClockTimerGroup.TIMEOUT]: {
    stop: () => clearTimeout,
    timing: () => setTimeout,
  },
}
export {
  AlarmClock,
  AlarmClockParams,
  AlarmClockCtx,
  AlarmClockStatus,
  AlarmClockTimerGroup,
  TimerGroup,
}
