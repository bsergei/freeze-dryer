import { container } from './config/ioc';
import * as cp from 'child_process';
import { Log } from './service/logger.service';
import { WebService } from './service/web.service';

const log = container.resolve(Log);
let shouldExit = false;

function spawnSenderProcess(id: string) {
  try {
    let senderProcess = cp.fork(__dirname + `/${id}`, ['child'], { silent: true });
    senderProcess.on('exit', (code, signal) => {
      log.info(`${id} exited...`);
      if (!shouldExit) {
        log.info(`${id} respawing...`);
        spawnSenderProcess(id);
      }
    });

    log.info(`${id} started: pid=${senderProcess.pid}`);

    process.on('SIGINT', () => {
      shouldExit = true;
      if (senderProcess) {
        senderProcess.kill();
        senderProcess = undefined;
      }
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
  spawnSenderProcess('child.sender');
  spawnSenderProcess('child.sensors');
}

startApp();
