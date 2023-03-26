import { Task } from '../src'

export function wait(time?: number) {
  return new Promise(r => setTimeout(r, time))
}

export class TestTask extends Task<number> {
  static readonly value = 2
  static readonly errorValue = 3
  cut(next) {
    if (this._ctx === TestTask.errorValue) {
      throw new Error('test')
    }
    else {
      Promise.resolve()
        .then(() => {
          next(() => {
            if (this._ctx) {
              this._ctx--
            }
            else {
              return true
            }
          })
        })
    }
    return this
  }
}
