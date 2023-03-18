type CurrentResolve<T = any> = (data: T) => void
type CurrentReject = (err: any) => void
type TaskStatus = 'idle' | 'active' | 'pause' | 'end'

interface BaseTask<T = any> {
  readonly status: TaskStatus
  start: (params?: T) => Promise<this>
  pause: (params?: T) => this
  cancel: (params?: T) => this
  reset: (params?: T) => Promise<this>
}

class CurrentPromise<T = any> {
  protected currentPromise?: Promise<T>
  protected currentResolve?: CurrentResolve<this> | undefined
  protected currentReject?: CurrentReject | undefined

  protected triggerReject(err: Error) {
    this.currentReject?.(err)
    this.currentReject = undefined
    return this
  }

  protected triggerResolve(value: this) {
    this.currentResolve?.(value)
    this.currentResolve = undefined
    return this
  }
}

export { CurrentResolve, CurrentReject, TaskStatus, BaseTask, CurrentPromise }
