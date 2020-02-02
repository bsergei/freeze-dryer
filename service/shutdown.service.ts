import { injectable } from 'inversify';
import { Log } from './logger.service';

@injectable()
export class ShutdownService {

    private handlers: (() => Promise<any>)[];

    constructor(log: Log) {
        this.handlers = [];
        const isChild = process.argv.indexOf('child') >= 0;

        log.info('ShutdownService created.');
        process.on('SIGINT', async () => {
            log.info('ShutdownService: starting shutdown procedure');
            const handlerPromises: Promise<any>[] = [];
            for (const handler of this.handlers) {
                const wrapper = async () => {
                    try {
                        await handler();
                    } catch (e) {
                        log.error(e);
                    }
                };
                const handlerPromise = wrapper();
                handlerPromises.push(handlerPromise);
            }
            this.handlers = [];

            log.info('ShutdownService: Awaiting services to shutdown...');

            try {
                await Promise.all(handlerPromises);
            } catch {
                // Ignore any error.
            }

            const tm = 250;
            const exitMsg = `ShutdownService: OK, ${isChild ? 'child' : 'main'} process will exit in ${tm}ms`;
            log.info(exitMsg);
            console.log(exitMsg);
            // Give enough time to finish logger.
            setTimeout(() => process.exit(), tm);
        });
    }

    public subscribe(handler: () => Promise<any>) {
        this.handlers.push(handler);
    }
}
