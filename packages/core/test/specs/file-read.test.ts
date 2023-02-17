import { describe, expect, test, vi } from 'vitest'
import { FileRead, FileReaderType } from '../../src/index'
import { wait } from '../utils'
/**
 * @vitest-environment jsdom
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
    const cd = vi.fn()
    const handleSuccess = vi.fn()
    const file = createFileRead()
    const fileRead = new FileRead()
    fileRead.start({
      file,
      cd,
    })
      .then(handleSuccess)
    fileRead.pause()
    await wait()
    expect(cd).not.toHaveBeenCalled()
    await fileRead.start()
      .then(handleSuccess)
    expect(cd).toHaveBeenCalledTimes(1)
    expect(handleSuccess).toHaveBeenCalledTimes(2)
  })
})

function createFileRead(frequency = 10) {
  let text = ''
  for (let i = 0; i < frequency; i++) {
    text += `${Math.random()}|`
  }
  return new File([text], 'test.text')
}

// var a = async () => {
//     const cd = (...param) => {
//       console.log('param', param)
//     }
//     const cd2 = (...param) => {
//       console.log('param2', param)
//     }
//     const file = createFileRead()
//     const fileRead = new AbmaoTask.FileRead()
//     fileRead.start({
//       file,
//       cd,
//     })
//     fileRead.pause()
//     await wait()
//     await fileRead.start()
//     .then(cd2)
//     console.log(1)
//   }
