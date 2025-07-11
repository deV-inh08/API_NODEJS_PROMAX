import path from 'path'
import { transports, format, createLogger, Logger } from 'winston'
import 'winston-daily-rotate-file'

const { combine, timestamp, align, printf } = format
class MyLogger {
  private logger: Logger
  private logDir: string
  constructor() {
    this.logDir = path.join(process.cwd(), 'src/api/v1/logs')
    const formatPrint = printf(({ level, message, timestamp, context }) => {
      return `${timestamp} --- ${level} --- ${context} --- ${message}`
    })

    this.logger = createLogger({
      format: combine(
        timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A'
        }),
        align(),
        formatPrint
      ),
      transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
          dirname: this.logDir,
          filename: 'application-%DATE%.info.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true, // backup zip
          maxSize: '20m', // vượt quá 20m -> sinh ra file khác
          maxFiles: '14d', // nếu max file -> 14 days xóa
          format: combine(
            timestamp({
              format: 'YYYY-MM-DD hh:mm:ss.SSS A'
            })
          ),
          level: 'info'
        }),
        new transports.DailyRotateFile({
          dirname: this.logDir,
          filename: 'application-%DATE%.error.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true, // backup zip
          maxSize: '20m', // vượt quá 20m -> sinh ra file khác
          maxFiles: '14d', // nếu max file -> 14 days xóa
          format: combine(
            timestamp({
              format: 'YYYY-MM-DD hh:mm:ss.SSS A'
            })
          ),
          level: 'error'
        })
      ]
    })
  }

  info(
    message: string,
    params?: {
      context: string
      requestId: string
      message: string
    }
  ) {
    this.logger.info(message, { params })
  }

  error(
    message: string,
    params?: {
      context: string
      requestId: string
      message: string
    }
  ) {
    this.logger.error(message, { params })
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context })
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context })
  }
}

const myLogger = new MyLogger()
export { MyLogger, myLogger }
