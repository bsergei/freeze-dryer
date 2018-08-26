import { container } from './config/ioc';
import { UnitWorkerService } from './service/unit-worker.service';
import { Log } from './service/logger.service';

const log = container.resolve(Log);

const startApp = async () => {
  const unitWorkerService = container.resolve(UnitWorkerService);
  await unitWorkerService.run();
  log.info('Unit Worker started');
};

log.info('Unit Worker starting...');
startApp();
