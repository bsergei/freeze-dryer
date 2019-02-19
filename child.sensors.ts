import { container } from './config/ioc';
import { Log } from './service/logger.service';
import { SensorsWriterService } from './service/sensors-writer.service';

const log = container.resolve(Log);

const startApp = async () => {
  process
    .on('unhandledRejection', (reason, p) => {
      log.error(`process: unhandledRejection: ${reason}`);
      console.log(`process: unhandledRejection: ${reason}`);
    })
    .on('uncaughtException', err => {
      log.error(`process: uncaughtException: ${err}, at: ${err.stack}`, err);
      console.log(`process: uncaughtException: ${err}, at: ${err.stack}`);
    });

  const service = container.resolve(SensorsWriterService);
  await service.init();
  log.info('Sensors writer started');
};

log.info('Sensors writer starting...');
startApp();
