import { container } from './config/ioc';
import { SenderService } from './service/sender.service';
import { Log } from './service/logger.service';

const log = container.resolve(Log);

const startApp = async () => {
  process
    .on('unhandledRejection', (reason, p) => {
      log.error(`process: unhandledRejection: ${reason}`);
      console.log(`process: unhandledRejection: ${reason}`);
    })
    .on('uncaughtException', err => {
      log.error(`process: uncaughtException: ${err}, at: ${err.stack}`);
      console.log(`process: uncaughtException: ${err}, at: ${err.stack}`);
    });

  const senderService = container.resolve(SenderService);
  await senderService.init();
  log.info('Sender started');
};

log.info('Sender starting...');
startApp();
