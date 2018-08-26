import { container } from './config/ioc';
import * as cp from 'child_process';
import { startWeb } from './service/web.service';
import { Log } from './service/logger.service';

const log = container.resolve(Log);

const startApp = async () => {
  await startWeb();

  try {
    const senderProcess = cp.fork(__dirname + '/child.sender', ['child'], { silent: true });
    senderProcess.on('exit', (code, signal) => {
      log.info('child.sender exited');
    });

    process.on('exit', () => {
      senderProcess.kill();
    });

  } catch (e) {
    log.error(`Error while starting child.sender: ${e}`);
  }

  try {
    const unitWorkerProcess = cp.fork(__dirname + '/child.unit-worker', ['child'], { silent: true });
    unitWorkerProcess.on('exit', (code, signal) => {
      log.info('child.unit-worker exited');
    });

    process.on('exit', () => {
      unitWorkerProcess.kill();
    });
  } catch (e) {
    log.error(`Error while starting child.unit-worker: ${e}`);
  }
};

startApp();
