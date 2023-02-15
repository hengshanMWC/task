import { Task } from './task'
const BYTES_PER_CHUNK = 1200

class FileRead extends Task {
  file: File
  private type: FileReaderType
  private fileChunk = 0 // 文件的读取完成度
  private fileReader: FileReader
  private cd?: (chunk: Blob, progress: number) => void
  constructor(file: File, cd?: FileRead['cd'], type: FileRead['type'] = FileReaderType.ARRAY_BUFFER) {
    super()
    this.file = file
    this.type = type
    if (cd) {
      this.cd = cd
    }
    this.fileReader = new FileReader()
    this.fileReader.addEventListener('error', () => {
      this.handleFileReaderError()
    })
    this.fileReader.addEventListener('load', () => {
      this.handleFileReaderLoad()
    })
  }

  get readProgress() {
    const currentProgress = BYTES_PER_CHUNK * this.fileChunk
    return currentProgress / this.file.size
  }

  get readEnd() {
    return this.readProgress >= 1
  }

  protected cut(next) {
    const start = BYTES_PER_CHUNK * this.fileChunk++
    const end = Math.min(this.file.size, start + BYTES_PER_CHUNK)
    this.fileReader[this.type](this.file.slice(start, end))
    if (!this.fileReader.onload) {
      const handleLoad = () => {
        this.handleFileReaderLoad()
        next(this.readEnd)
      }
      this.fileReader.onload = handleLoad
    }
    return this
  }

  protected interceptCancel() {
    if (this.fileReader.onload) {
      this.fileReader.onload = null
    }
    return true
  }

  private handleFileReaderLoad() {
    if (this.cd && this.fileReader.result instanceof Blob) {
      this.cd(this.fileReader.result, this.readProgress)
    }
  }

  private handleFileReaderError() {
    this.triggerReject(new Error(`Error occurred reading file: ${this.file.name}`))
  }
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
}
