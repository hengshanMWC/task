type CurrentResolve = (data: any) => void
type CurrentReject = (err: any) => void
type TaskStatus = 'idle' | 'active' | 'pause' | 'end'
interface BaseTask {
  readonly status: TaskStatus
  start: (...params: any) => Promise<any>
  pause: (...params: any) => this
  cancel: (...params: any) => this
  reset: (...params: any) => Promise<any>
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
