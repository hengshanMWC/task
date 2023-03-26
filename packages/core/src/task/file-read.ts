import { Task } from './task'
const BYTES_PER_CHUNK = 1200

class FileRead extends Task<FileReadParams, FileReadCtx> {
  private bytesPerChunk = BYTES_PER_CHUNK
  private fileChunk = 0 // 文件的读取完成度
  private fileReader: FileReader
  private params?: Partial<FileReadParams>
  constructor(params?: FileRead['params'], bytesPerChunk?: number) {
    super()
    if (bytesPerChunk) {
      this.bytesPerChunk = bytesPerChunk
    }
    this.params = params
    this.fileReader = new FileReader()
    this.fileReader.addEventListener('error', () => {
      this.handleFileReaderError()
    })
  }

  get readProgress() {
    if (this.ctx) {
      const currentProgress = this.bytesPerChunk * this.fileChunk
      return Math.min(currentProgress / this.ctx.file.size, 1)
    }
    else {
      return 0
    }
  }

  get readEnd() {
    return this.readProgress >= 1
  }

  protected cut(next) {
    const file = this.ctx?.file
    if (!file) {
      this.handleFileReaderError()
    }
    else if (this.ctx) {
      const start = this.bytesPerChunk * this.fileChunk + this.ctx.startBlob
      const end = Math.min(file.size, start + this.bytesPerChunk)
      this.fileReader[this.ctx.type](file.slice(start, end))
      if (!this.fileReader.onload) {
        const handleLoad = () => {
          next(() => {
            this.fileChunk++
            this.handleFileReaderLoad()
            return this.readEnd
          })
        }
        this.fileReader.onload = handleLoad
      }
    }

    return this
  }

  private abort() {
    if (this.fileReader.onload) {
      this.fileReader.onload = null
    }
    try {
      this.fileReader.abort()
    }
    catch {}
  }

  protected interceptCancel() {
    this.abort()
  }

  protected interceptPause() {
    this.abort()
  }

  protected createCtx(params?: FileReadParams) {
    if (params) {
      return {
        file: params.file,
        callback: params.callback,
        type: params.type || FileReaderType.ARRAY_BUFFER,
        startBlob: params.startBlob || 0,
      }
    }
  }

  protected interceptStartParams(params?: FileReadParams) {
    if (this.params !== undefined || params !== undefined) {
      return {
        ...this.params,
        ...params,
      } as FileReadParams
    }
  }

  private handleFileReaderLoad() {
    if (this.ctx?.callback && this.ctx?.file && this.fileReader.result !== null) {
      this.ctx.callback(this.fileReader.result, this.readProgress, this.ctx?.file)
    }
  }

  private handleFileReaderError() {
    this.triggerReject(new Error('Error occurred reading file: not file'))
    this.interceptCancel()
  }
}
type FileReadCallback = (chunk: string | ArrayBuffer, progress: number, file: Blob) => void

interface FileReadParams {
  file: Blob
  callback?: FileReadCallback
  type?: FileReaderType
  startBlob?: number
}

interface FileReadCtx {
  file: Blob
  callback?: FileReadCallback
  type: FileReaderType
  startBlob: number
}

enum FileReaderType {
  ARRAY_BUFFER = 'readAsArrayBuffer',
  BINARY_STRING = 'readAsBinaryString',
  DATA_URL = 'readAsDataURL',
  TEXT = 'readAsText',
}

export {
  FileRead,
  FileReaderType,
  FileReadCallback,
}
