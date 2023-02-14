import type { BaseTask, TaskStatus } from './core'
import { CurrentPromise } from './core'
abstract class Task<T = any> extends CurrentPromise implements BaseTask<T> {
  status: TaskStatus = 'idle'
  ctx: T

  start(params?: T): Promise<any> {
    return this.createPromiseSingleton(params).currentPromise as Promise<any>
  }

  pause() {
    this.status = 'pause'
    return this
  }

  cancel() {
    this.status = 'end'
    return this.clear()
  }

  reset() {
    return this.cancel().start()
  }

  clear() {
    this.currentPromise = undefined
    this.currentReject = undefined
    this.currentResolve = undefined
    return this
  }

  private createPromiseSingleton(params?: T) {
    if (this.status === 'pause') {
      this.status = 'active'
      this.cut()
    }
    else if (this.status !== 'active') {
      this.status = 'active'
      this.currentPromise = new Promise((resolve, reject) => {
        this.currentResolve = resolve
        this.currentReject = reject
        this.run(params).cut()
      }).finally(() => {
        this.clear()
        this.status = 'end'
      })
    }
    return this
  }

  protected next(end?: boolean) {
    if (end === true) {
      this.triggerResolve()
    }
    else if (this.status === 'active') {
      try {
        this.cut()
      }
      catch (err) {
        this.triggerReject(err)
      }
    }
    return this
  }

  protected run(params?: T) {
    if (params !== undefined) {
      this.ctx = params
    }
    return this
  }
  protected abstract cut(): this
}

export {
  Task,
}
