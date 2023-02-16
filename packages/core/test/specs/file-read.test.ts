import { describe, expect, test, vi } from 'vitest'
import { FileRead, FileReaderType } from '../../src/index'
import { wait } from '../utils'
/**
 * @vitest-environment happy-dom
 */
describe('test', () => {
  test('start', async () => {
    const progressFn = vi.fn((progress: number) => progress)
    const fn = vi.fn((chunk, progress, blob) => {
      expect(typeof chunk).toBe('string')
      expect(file).toBe(blob)
      progressFn(progress)
    })
    const file = createFileRead()
    const fileRead = new FileRead(fn, FileReaderType.DATA_URL, 100)

    await fileRead.start({
      file,
    })
    expect(progressFn).toHaveLastReturnedWith(1)
    expect(fn).toHaveReturnedTimes(2)
  })
  test('start params', async () => {
    const fn = vi.fn()
    const cd = vi.fn()
    const file = createFileRead()
    const fileRead = new FileRead(fn, FileReaderType.BINARY_STRING)
    await fileRead.start({
      file,
      cd,
      type: FileReaderType.TEXT,
    })
    expect(fn).not.toHaveBeenCalled()
    expect(cd).toHaveReturnedTimes(1)
  })
  test('pause', async () => {
    const cd = vi.fn((...param) => {
      param
    })
    const file = createFileRead()
    const fileRead = new FileRead()
    fileRead.start({
      file,
      cd,
    })
    fileRead.pause()
    await wait()
    expect(cd).not.toHaveBeenCalled()
    await fileRead.start()
    // .then(cd)
    expect(cd).toHaveBeenCalledTimes(0)
  })
})

function createFileRead(frequency = 10) {
  let text = ''
  for (let i = 0; i < frequency; i++) {
    text += `${Math.random()}|`
  }
  return new File([text], 'test.text')
}
