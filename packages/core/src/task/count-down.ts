import type { Next } from './task'
import { Task } from './task'

class CountDown extends Task<CountDownParams, CountDownCtx> {
  timer: NodeJS.Timeout
  callback?: (ctx: CountDownCtx) => void
  constructor() {
    super()
  }

  protected cut(next) {
    this.timer = this.forward(() => {
      if (this.ctx) {
        this.dealWith(next, this.ctx)
      }
    })
    return this
  }

  protected interceptCancel() {
    this.stop()
  }

  protected createCtx(params?: CountDownParams): CountDownCtx {
    const now = Date.now()
    const time = params?.time || 60
    const startTime = params?.startTime || now
    const endTime = params?.endTime || startTime + time * 1000
    return {
      time,
      startTime,
      currentTime: now,
      endTime,
      get endCountDownTime() {
        return Math.max(this.endTime - this.currentTime, 0)
      },
      get startCountDownTime() {
        return Math.max(this.startCountDownTime - this.currentTime, 0)
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
    clearTimeout(this.timer)
    return this
  }

  private forward(fn: Parameters<typeof setTimeout>[0]) {
    return setTimeout(fn)
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

export {
  CountDown,
  CountDownParams,
  CountDownCtx,
  CountDownStatus,
}
