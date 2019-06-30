import { injectable } from 'inversify';
import { Log } from './logger.service';

@injectable()
export class ShutdownService {

    private handlers: (() => void)[];

    constructor(log: Log) {
        this.handlers = [];
        const isChild = process.argv.indexOf('child') >= 0;
        const tm = isChild ? 2000 : 5000;

        log.info('ShutdownService created.');
        process.on('SIGINT', async () => {
            log.info('Exit process: cleanup');
            for (const handler of this.handlers) {
                try {
                    handler();
                } catch (e) {
                    log.error(e);
                }
            }
            this.handlers = [];

            log.info(`Exit ${isChild ? 'child' : ''} process: process.exit()`);
            console.log(`${isChild ? 'Child' : ''} Process will exit in ${tm}ms`);
            setTimeout(() => process.exit(), tm);
        });
    }

    public onSigint(handler: () => void) {
        this.handlers.push(handler);
    }
}
