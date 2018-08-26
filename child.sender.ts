import { container } from './config/ioc';
import { SenderService } from './service/sender.service';
import { Log } from './service/logger.service';

const log = container.resolve(Log);

const startApp = async () => {
  const senderService = container.resolve(SenderService);
  await senderService.init();
  log.info('Sender started');
};

log.info('Sender starting...');
startApp();
