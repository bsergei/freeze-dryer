import { container } from './config/ioc';
import { Log } from './service/logger.service';
import { SensorsWriterService } from './service/sensors-writer.service';

const log = container.resolve(Log);

const startApp = async () => {
  const service = container.resolve(SensorsWriterService);
  await service.init();
  log.info('Sensors writer started');
};

log.info('Sensors writer starting...');
startApp();
