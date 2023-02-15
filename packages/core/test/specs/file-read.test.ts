import { describe, expect, test, vi } from 'vitest'
import { FileRead } from '../../src/index'
import { wait } from '../utils'
/**
 * @vitest-environment happy-dom
 */
describe('test', () => {
  test('base', () => {
    const file = createFileRead()
    const fileRead = new FileRead((chunk, progress, blob) => {
      expect(file).toBe(blob)
    })
    fileRead.start({
      file,
    })
    expect(file).toBe(file)
  })
})

function createFileRead(frequency = 10) {
  let text = ''
  for (let i = 0; i < frequency; i++) {
    text += `${Math.random()}|`
  }
  return new File([text], 'test.text')
}
