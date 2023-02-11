import type { BaseTask, TaskStatus } from './core'
import { CurrentPromise } from './core'
export abstract class Task extends CurrentPromise implements BaseTask {
  status: TaskStatus = 'idle'

  start(...params: any): Promise<any> {
    return this.createPromiseSingleton(...params).currentPromise as Promise<any>
  }

  pause() {
    this.status = 'pause'
    return this
  }

  cancel() {
    return this.clear()
  }

  reset() {
    return this.cancel().start()
  }

  clear() {
    this.status = 'idle'
    this.currentPromise = undefined
    this.currentReject = undefined
    this.currentResolve = undefined
    return this
  }

  private createPromiseSingleton(...params: any) {
    if (this.status === 'pause') {
      this.status = 'active'
      this.cut()
    }
    else if (this.status !== 'active') {
      this.status = 'active'
      this.currentPromise = new Promise((resolve, reject) => {
        this.currentResolve = resolve
        this.currentReject = reject
        this.run(...params).cut()
      })
      this.currentPromise.finally(() => this.status = 'end')
    }
    return this
  }

  protected next(end?: boolean) {
    if (end) {
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

  protected abstract run(...params: any): this
  protected abstract cut(): this
}
