import { describe, expect, test, vi } from 'vitest'
import { TaskList } from '../../src'
describe('test', () => {
  test('start', async () => {
    const handleSuccess = vi.fn()
    const taskList = new TaskList()
    try {
      await taskList.start()
      handleSuccess()
    }
    catch {
    }
    expect(handleSuccess).toHaveBeenCalled()
  })
})
