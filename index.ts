import { container } from './config/ioc';
import { SenderService } from './service/sender.service';
import { startWeb } from './service/web.service';

const startApp = async () => {
  const senderService = container.resolve(SenderService);
  await senderService.init();
  startWeb();
};

startApp();
