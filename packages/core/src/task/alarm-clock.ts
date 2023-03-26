import type { Next } from './task'
import { Task } from './task'

class AlarmClock extends Task<AlarmClockParams, AlarmClockCtx> {
  timer: NodeJS.Timeout
  timerGroup: TimerGroup
  private params?: AlarmClockParams
  constructor(params?: AlarmClockParams, timerGroupValue: AlarmClockTimerGroup | TimerGroup = AlarmClockTimerGroup.FRAME) {
    super()
    this.params = params
    if (typeof timerGroupValue === 'number') {
      this.timerGroup = timerGroup[timerGroupValue]
    }
    else {
      this.timerGroup = timerGroupValue
    }
  }

  protected interceptStartParams(params?: AlarmClockParams) {
    if (this.params !== undefined || params !== undefined) {
      return {
        ...this.params,
        ...params,
      } as AlarmClockParams
    }
  }

  protected cut(next) {
    this.timer = this.timing(() => {
      if (this._ctx) {
        this.dealWith(next, this._ctx)
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
    if (!this._ctx) {
      return this.createContext(params)
    }
  }

  protected onProceed() {
    if (this._ctx) {
      const gap = Date.now() - this._ctx.currentTime
      this._ctx.currentTime += gap
      this._ctx.endTime += gap
    }
  }

  private createContext(params?: AlarmClockParams): AlarmClockCtx {
    const time = params?.time || 60
    const currentTime = Date.now()
    const startTime = params?.startTime || currentTime
    const endTime = params?.endTime || startTime + time * 1000
    return {
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
    this.timerGroup.stop(this.timer)
    return this
  }

  timing(fn: Function) {
    return this.timerGroup.timing(fn)
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
  timing: (...params: any) => any
  stop: (...params: any) => any
}

const timerGroup: Record<AlarmClockTimerGroup, TimerGroup> = {
  [AlarmClockTimerGroup.FRAME]: {
    timing: (...params: Parameters<typeof requestAnimationFrame>) => requestAnimationFrame(...params),
    stop: (...params: Parameters<typeof cancelAnimationFrame>) => cancelAnimationFrame(...params),
  },
  [AlarmClockTimerGroup.TIMEOUT]: {
    timing: (...params: Parameters<typeof setTimeout>) => setTimeout(...params),
    stop: (...params: Parameters<typeof clearTimeout>) => clearTimeout(...params),
  },
}
export {
  AlarmClock,
  AlarmClockParams,
  AlarmClockCtx,
  AlarmClockStatus,
  AlarmClockTimerGroup,
  TimerGroup,
  timerGroup,
}
