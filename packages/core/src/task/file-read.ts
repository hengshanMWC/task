import { Task } from './task'
const BYTES_PER_CHUNK = 1200

class FileRead extends Task<FileReadParams> {
  private fileReaderType: FileReaderType
  private bytesPerChunk = BYTES_PER_CHUNK
  private fileChunk = 0 // 文件的读取完成度
  private fileReader: FileReader
  private cd?: (chunk: string | ArrayBuffer, progress: number, file: Blob) => void
  constructor(cd?: FileRead['cd'], type: FileRead['type'] = FileReaderType.ARRAY_BUFFER, bytesPerChunk?: number) {
    super()
    this.fileReaderType = type
    if (cd) {
      this.cd = cd
    }
    if (bytesPerChunk) {
      this.bytesPerChunk = bytesPerChunk
    }
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

  get type() {
    return (this.ctx?.type ? this.ctx.type : this.fileReaderType)
  }

  get handleProgress() {
    return (this.ctx?.cd ? this.ctx.cd : this.cd)
  }

  protected cut(next) {
    const file = this.ctx?.file
    if (file) {
      const start = this.bytesPerChunk * this.fileChunk
      const end = Math.min(file.size, start + this.bytesPerChunk)
      this.fileReader[this.type](file.slice(start, end))
      if (!this.fileReader.onload) {
        const handleLoad = () => {
          this.fileChunk++
          this.handleFileReaderLoad()
          next(this.readEnd)
        }
        this.fileReader.onload = handleLoad
      }
    }
    else {
      this.handleFileReaderError()
    }

    return this
  }

  protected interceptCancel() {
    if (this.fileReader.onload) {
      this.fileReader.onload = null
    }
  }

  private handleFileReaderLoad() {
    if (this.handleProgress && this.ctx?.file && this.fileReader.result !== null) {
      this.handleProgress(this.fileReader.result, this.readProgress, this.ctx?.file)
    }
  }

  private handleFileReaderError() {
    const name = this.ctx ? this.ctx.file.name : 'not file'
    this.triggerReject(new Error(`Error occurred reading file: ${name}`))
    this.interceptCancel()
  }
}

interface FileReadParams {
  file: Blob
  cd?: FileRead['cd']
  type?: FileRead['fileReaderType']
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
