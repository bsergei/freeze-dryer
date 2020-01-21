import { container } from './config/ioc';
import * as cp from 'child_process';
import { Log } from './service/logger.service';
import { WebService } from './service/web.service';
import { ShutdownService } from './service/shutdown.service';
import { TelegramService } from './service/telegram.service';

const log = container.get(Log);
const shutdownService = container.get(ShutdownService);
let shouldExit = false;

function spawnSenderProcess(id: string) {
  try {
    let senderProcess = cp.fork(__dirname + `/${id}`, ['child', ...process.argv.slice(2)]);
    senderProcess.on('exit', (code, signal) => {
      log.info(`${id} exited...`);
      if (!shouldExit) {
        log.info(`${id} respawing...`);
        spawnSenderProcess(id);
      }
    });

    log.info(`${id} started: pid=${senderProcess.pid}`);

    shutdownService.onSigint(() => {
      shouldExit = true;
    });

  } catch (e) {
    log.error(`Error while starting ${id}: ${e}`, e);
  }
}

async function startApp() {

  process
    .on('unhandledRejection', (reason, p) => {
      log.error(`process: unhandledRejection: ${reason}`);
      console.log(`process: unhandledRejection: ${reason}`);
    })
    .on('uncaughtException', err => {
      log.error(`process: uncaughtException: ${err}, at: ${err.stack}`, err);
      console.log(`process: uncaughtException: ${err}, at: ${err.stack}`);
    });

  const ws = container.resolve(WebService);
  await ws.init(container);

  const messenger = container.resolve(TelegramService);
  await messenger.init();

  spawnSenderProcess('child.sender');
  spawnSenderProcess('child.sensors');
}

startApp();
