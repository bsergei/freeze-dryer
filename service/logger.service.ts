import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { injectable } from 'inversify';

@injectable()
export class Log {

    private logger: winston.Logger;

    constructor() {
        const transport = new DailyRotateFile({
            dirname: __dirname + '/../logs',
            filename: `fd-%DATE%-${process.pid}.log`,
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '5d'
          });

        this.logger = winston.createLogger({
            transports: [
                transport
            ],
            exitOnError: false,
        });
    }

    public error(message: string) {
        try {
            this.logger.error(`${new Date().toISOString()}: ${message}`);
        } catch (e) {
            console.log('Error in logger: ' + e);
        }
    }

    public info(message: string) {
        try {
            this.logger.info(`${new Date().toISOString()}: ${message}`);
        } catch (e) {
            console.log('Error in logger: ' + e);
        }
    }
}
