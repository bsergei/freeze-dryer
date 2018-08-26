import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { injectable } from 'inversify';

@injectable()
export class Log {

    private logger: winston.Logger;

    constructor() {
        const transport = new DailyRotateFile({
            dirname: __dirname + '/../logs',
            filename: 'fd-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '5d'
          });

        this.logger = winston.createLogger({
            transports: [
                transport
            ],
            exitOnError: false
        });
    }

    public error(message: string) {
        this.logger.error(`${new Date().toISOString()}: ${message}`);
    }

    public info(message: string) {
        this.logger.info(`${new Date().toISOString()}: ${message}`);
    }
}
