import { container } from './config/ioc';
import * as cp from 'child_process';
import { startWeb } from './service/web.service';
import { Log } from './service/logger.service';

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
    log.error(`Error while starting ${id}: ${e}`);
  }
}

async function startApp() {
  await startWeb();
  spawnSenderProcess('child.sender');
  spawnSenderProcess('child.sensors');
}

startApp();
