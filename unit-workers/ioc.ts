import { Container } from 'inversify';
import { CompressorWorkerFactory } from './compressor-worker';
import { VacuumWorkerFactory } from './vacuum-worker';
import { HeaterWorkerFactory } from './heater-worker';

export const configureUnitWorkers = (container: Container) => {
    container.bind<CompressorWorkerFactory>(CompressorWorkerFactory).toSelf();
    container.bind<VacuumWorkerFactory>(VacuumWorkerFactory).toSelf();
    container.bind<HeaterWorkerFactory>(HeaterWorkerFactory).toSelf();
};
