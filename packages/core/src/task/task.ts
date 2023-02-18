import type { BaseTask, TaskStatus } from '../core'
import { CurrentPromise } from '../core'
abstract class Task<T = any, Ctx = T> extends CurrentPromise implements BaseTask<T> {
  status: TaskStatus = 'idle'
  ctx: Ctx | undefined
  sign = 0

  start(params?: T): Promise<any> {
    return this.createPromiseSingleton(params).currentPromise as Promise<any>
  }

  pause() {
    if (this.interceptPause() !== false) {
      this.status = 'pause'
    }
    return this
  }

  cancel() {
    if (this.interceptCancel() !== false) {
      this.status = 'end'
      this.clear()
    }
    return this
  }

  reset(params?: T) {
    return this.cancel().start(params)
  }

  clear() {
    this.currentPromise = undefined
    this.currentReject = undefined
    this.currentResolve = undefined
    return this
  }

  protected abstract cut(next: Next): this
  protected interceptPause(): any {
  }

  protected interceptCancel(): any {
  }

  protected run(params?: T) {
    const ctx = this.createCtx(params)
    // if (this.status === 'end' || ctx !== undefined) {
    this.ctx = ctx
    // }
    return this
  }

  protected createCtx(params?: T): CreateCtx<Ctx> {
    return params as CreateCtx<Ctx>
  }

  protected proceed(params?: T) {}

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
      this.proceed(params)
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
type CreateCtx<Ctx = any> = Ctx | undefined
export {
  Task,
  NextParam,
  Next,
}
