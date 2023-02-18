import type { Next } from './task'
import { Task } from './task'

class CountDown extends Task<CountDownParams, CountDownCtx> {
  timer: NodeJS.Timeout
  callback?: (ctx: CountDownCtx) => void
  timerGroup: TimerGroup
  constructor(timerGroupValue: CountDownTimerGroup | TimerGroup = CountDownTimerGroup.TIMEOUT) {
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

  protected interceptCancel() {
    this.stop()
  }

  protected createCtx(params?: CountDownParams) {
    if (!this.ctx) {
      const currentTime = Date.now()
      const time = params?.time || 60
      const startTime = params?.startTime || currentTime
      const endTime = params?.endTime || startTime + time * 1000
      return {
        time,
        startTime,
        currentTime,
        endTime,
        get endCountDownTime() {
          return Math.max(this.endTime - this.currentTime, 0)
        },
        get startCountDownTime() {
          return Math.max(this.startTime - this.currentTime, 0)
        },
        get status() {
          if (!this.endCountDownTime) {
            return CountDownStatus.END
          }
          else if (!this.startCountDownTime) {
            return CountDownStatus.ACTIVITY
          }
          else {
            return CountDownStatus.WAIT
          }
        },
      }
    }
  }

  private dealWith(next: Next, ctx: CountDownCtx) {
    next(() => {
      if (ctx.endCountDownTime) {
        ctx.currentTime = Date.now()
      }
      this.callback && this.callback(ctx)
      return ctx.status === CountDownStatus.END
    })
  }

  private stop() {
    this.timerGroup.stop(this.timer)
    return this
  }

  private timing(fn: Function) {
    return this.timerGroup.timing(fn)
  }
}
interface CountDownParams {
  time?: number
  startTime?: number
  endTime?: number
  callback?: CountDown['callback']
}

interface CountDownCtx {
  time: number
  startTime: number
  currentTime: number
  endTime: number
  readonly endCountDownTime: number
  readonly startCountDownTime: number
  readonly status: CountDownStatus
}

enum CountDownStatus {
  WAIT,
  ACTIVITY,
  END,
}

enum CountDownTimerGroup {
  TIMEOUT,
}
interface TimerGroup {
  stop: Function
  timing: Function
}

const timerGroup: Record<CountDownTimerGroup, TimerGroup> = {
  [CountDownTimerGroup.TIMEOUT]: {
    stop: clearTimeout,
    timing: setTimeout,
  },
}
export {
  CountDown,
  CountDownParams,
  CountDownCtx,
  CountDownStatus,
  CountDownTimerGroup,
  TimerGroup,
}
