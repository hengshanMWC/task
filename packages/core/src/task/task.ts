import type { BaseTask, TaskStatus } from '../core'
import { CurrentPromise } from '../core'
abstract class Task<T = any> extends CurrentPromise implements BaseTask<T> {
  status: TaskStatus = 'idle'
  ctx: T | undefined
  sign = 0
  protected _next: Next

  start(params?: T): Promise<any> {
    return this.createPromiseSingleton(params).currentPromise as Promise<any>
  }

  pause() {
    if (this.interceptPause()) {
      this.status = 'pause'
    }
    return this
  }

  cancel() {
    if (this.interceptCancel()) {
      this.status = 'end'
      this.clear()
    }
    return this
  }

  reset(params?: T) {
    return this.cancel().start(params)
  }

  clear() {
    this.ctx = undefined
    this.currentPromise = undefined
    this.currentReject = undefined
    this.currentResolve = undefined
    return this
  }

  protected abstract cut(next: Next): this
  protected interceptPause() {
    return true
  }

  protected interceptCancel() {
    return true
  }

  protected run(params?: T) {
    if (params !== undefined) {
      this.ctx = params
    }
    return this
  }

  private execute(next: Next, param?: NextParam) {
    const end = typeof param === 'function' ? param() : param
    if (end === true) {
      this.triggerResolve()
    }
    else if (this.status === 'active') {
      this.cutter(next)
    }
    return this
  }

  private cutter(next: Next) {
    try {
      this.cut(next)
    }
    catch (err) {
      this.triggerReject(err)
    }
    return this
  }

  private createPromiseSingleton(params?: T) {
    if (this.status === 'pause') {
      this.status = 'active'
      const next = this.createNext()
      this.cutter(next)
    }
    else if (this.status !== 'active') {
      this.status = 'active'
      const next = this.createNext()
      this.currentPromise = new Promise((resolve, reject) => {
        this.currentResolve = resolve
        this.currentReject = reject

        this.run(params).cutter(next)
      }).finally(() => {
        this.clear()
        this.status = 'end'
      })
    }
    return this
  }

  private createNext() {
    const sign = ++this.sign
    const next: Next = (param) => {
      if (sign === this.sign) {
        this.execute(next, param)
      }
      return this
    }
    return next
  }
}
type NextParam = boolean | (() => boolean)
type Next<T = BaseTask> = (param?: NextParam) => T
export {
  Task,
  NextParam,
  Next,
}
