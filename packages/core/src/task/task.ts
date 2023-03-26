import type { BaseTask, TaskStatus } from '../core'
import { CurrentPromise } from '../core'
abstract class Task<T = any, Ctx = T> extends CurrentPromise implements BaseTask<T> {
  status: TaskStatus = 'idle'
  ctx: Ctx | undefined
  private sign = 0
  currentNext?: Next

  start(params?: T): Promise<any> {
    return this.createPromiseSingleton(this.interceptStartParams(params)).currentPromise as Promise<any>
  }

  pause(params?: T) {
    if (this.status === 'active' && this.interceptPause(params) !== false) {
      this.renew()
      this.status = 'pause'
    }
    return this
  }

  cancel(params?: T) {
    if (this.interceptCancel(params) !== false) {
      this.status = 'end'
      this.ctx = undefined
      this.clear()
    }
    return this
  }

  reset(params?: T) {
    return this.cancel().start(params)
  }

  protected abstract cut(next: Next): this

  protected cutter(next: Next) {
    try {
      this.cut(next)
    }
    catch (err) {
      this.triggerReject(err)
    }
    return this
  }

  protected createCtx(params?: T): CreateCtx<Ctx> {
    return params as CreateCtx<Ctx>
  }

  protected onProceed(params?: T) {}

  protected onExecute(params?: T) {}

  protected interceptStartParams(params?: T) {
    return params
  }

  protected interceptPause(params?: T): boolean | void {
  }

  protected interceptCancel(params?: T): boolean | void {
  }

  private clear() {
    this.currentPromise = undefined
    this.currentReject = undefined
    this.currentResolve = undefined
    return this
  }

  private run(params?: T) {
    const ctx = this.createCtx(params)
    if (this.status === 'end' || ctx !== undefined) {
      this.ctx = ctx
    }
    return this
  }

  private execute(next: Next, param?: NextParam) {
    const end = typeof param === 'function' ? param() : param
    if (end === true) {
      this.triggerResolve(this)
    }
    else if (this.status === 'active') {
      this.cutter(next)
    }
    return this
  }

  private createPromiseSingleton(params?: T) {
    if (this.status === 'pause') {
      this.status = 'active'
      this.onProceed(params)
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
      })
        .finally(() => {
          this.status = 'end'
        })
    }
    else {
      this.onExecute(params)
    }
    return this
  }

  private createNext() {
    const sign = this.renew()
    const next: Next = (param) => {
      if (sign === this.sign) {
        this.execute(next, param)
      }
      return this
    }
    this.currentNext = next
    return next
  }

  private renew() {
    return ++this.sign
  }
}
type NextParam = boolean | (() => boolean)
type Next<T = Task> = (param?: NextParam) => T
type CreateCtx<Ctx = any> = Ctx | undefined
export {
  Task,
  NextParam,
  Next,
}
