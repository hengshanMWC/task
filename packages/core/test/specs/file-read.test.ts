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
    const fileRead = new FileRead({
      callback: fn,
      type: FileReaderType.DATA_URL,
    }, 100)
    expect(fileRead.readProgress).toBe(0)
    await fileRead.start({
      file,
    })
    expect(progressFn).toHaveLastReturnedWith(1)
    expect(fn).toHaveReturnedTimes(2)
    expect(fileRead.readProgress).toBe(1)
  })
  test('start params', async () => {
    const fn = vi.fn()
    const cd = vi.fn()
    const file = createFileRead()
    const fileRead = new FileRead({
      callback: fn,
      type: FileReaderType.BINARY_STRING,
    })
    await fileRead.start({
      file,
      callback: cd,
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
    const task = fileRead.start({
      file,
      callback: cd,
    })
    task.then(handleSuccess)
    fileRead.pause()
    await wait()
    expect(cd).not.toHaveBeenCalled()
    const task2 = fileRead.start()
    await task2.then(handleSuccess)
    expect(cd).toHaveBeenCalledTimes(1)
    expect(handleSuccess).toHaveBeenCalledTimes(2)
    expect(task2).toBe(task)
  })
  test('cancel', async () => {
    const cd = vi.fn()
    const handleSuccess = vi.fn()
    const file = createFileRead()
    const fileRead = new FileRead()
    const task = fileRead.start({
      file,
      callback: cd,
    })
    task.then(handleSuccess)
    fileRead.cancel()
    await wait()
    expect(cd).not.toHaveBeenCalled()
    const task2 = fileRead.start({
      file,
    })
    await task2.then(handleSuccess)
    expect(cd).not.toHaveBeenCalled()
    expect(handleSuccess).toHaveBeenCalledTimes(1)
    expect(task2).not.toBe(task)
  })
  test('reset', async () => {
    const cd = vi.fn()
    const handleSuccess = vi.fn()
    const file = createFileRead()
    const fileRead = new FileRead()
    const task = fileRead.start({
      file,
      callback: cd,
    })
    task.then(handleSuccess)
    const task2 = fileRead.reset({
      file,
    })
    await task2.then(handleSuccess)
    expect(cd).not.toHaveBeenCalled()
    expect(handleSuccess).toHaveBeenCalledTimes(1)
    expect(task2).not.toBe(task)
  })
  test('not file', () => {
    const cd = vi.fn()
    const fileRead = new FileRead()
    fileRead.start()
      .catch(cd)
      .finally(() => expect(cd).toHaveBeenCalled())
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
