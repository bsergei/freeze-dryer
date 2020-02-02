import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { injectable } from 'inversify';
import { ErrorNotifierService } from './error-notifier.service';

@injectable()
export class Log {

    private logger: winston.Logger;
    private pidName: string;
    private pid: number;

    constructor(private errorNotifier: ErrorNotifierService) {
        this.pidName = this.getPidName();
        this.pid = process.pid;

        const transport = new DailyRotateFile({
            dirname: __dirname + '/../logs',
            filename: `fd-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxFiles: '5d'
          });

        this.logger = winston.createLogger({
            transports: [
                transport
            ],
            exitOnError: false,
        });
    }

    public error(message: string, error: Error = undefined) {
        try {
            const stack = (error && error.stack)
            ? (` at: ${error.stack}`)
            : '';
            const msg = `${new Date().toISOString()}: ${message}${stack}`;
            this.logger.error(msg, this.getMeta());
            this.errorNotifier.notifyError(msg);
        } catch (e) {
            console.log('Error in logger: ' + e);
        }
    }

    public info(message: string) {
        try {
            const msg = `${new Date().toISOString()}: ${message}`;
            this.logger.info(msg, this.getMeta());
        } catch (e) {
            console.log('Error in logger: ' + e);
        }
    }

    private getMeta() {
        return {
            'pidName': this.pidName,
            'pid': this.pid
        };
    }

    private getPidName() {
        let pidName = 'main';
        const pidNamePair = process.argv.find(_ => _.indexOf('process_id=') >= 0);
        if (pidNamePair) {
            const pair = pidNamePair.split('=');
            pidName = pair[1];
        }
        return pidName;
    }
}
