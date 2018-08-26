import { container } from './config/ioc';
import * as cp from 'child_process';
import { startWeb } from './service/web.service';
import { Log } from './service/logger.service';

const log = container.resolve(Log);
let shouldExit = false;

function spawnSenderProcess() {
  try {
    let senderProcess = cp.fork(__dirname + '/child.sender', ['child'], { silent: true });
    senderProcess.on('exit', (code, signal) => {
      log.info('child.sender exited...');
      if (!shouldExit) {
        log.info('child.sender respawing...');
        spawnSenderProcess();
      }
    });

    log.info(`child.sender started: pid=${senderProcess.pid}`);

    process.on('SIGINT', () => {
      shouldExit = true;
      if (senderProcess) {
        senderProcess.kill();
        senderProcess = undefined;
      }
    });

  } catch (e) {
    log.error(`Error while starting child.sender: ${e}`);
  }
}

async function startApp() {
  await startWeb();
  spawnSenderProcess();
}

startApp();
