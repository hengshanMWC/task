type CurrentResolve = (data: any) => void
type CurrentReject = (err: any) => void
type TaskStatus = 'idle' | 'active' | 'pause' | 'end'
interface BaseTask<T = any> {
  readonly status: TaskStatus
  start: (params?: T) => Promise<any>
  pause: (params?: T) => this
  cancel: (params?: T) => this
  reset: (params?: T) => Promise<any>
}
class CurrentPromise {
  protected currentPromise?: Promise<any>
  protected currentResolve?: CurrentResolve | undefined
  protected currentReject?: CurrentReject | undefined
  protected triggerReject(err: Error) {
    if (typeof this.currentReject === 'function') {
      this.currentReject(err)
      this.currentReject = undefined
    }
    return this
  }

  protected triggerResolve(value?: any) {
    if (typeof this.currentResolve === 'function') {
      this.currentResolve(value)
      this.currentResolve = undefined
    }
    return this
  }
}

export {
  CurrentResolve,
  CurrentReject,
  TaskStatus,
  BaseTask,
  CurrentPromise,
}
