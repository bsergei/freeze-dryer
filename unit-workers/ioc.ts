import { Container } from 'inversify';
import { UnitWorkerFactory } from './unit-worker.factory';

export const configureUnitWorkers = (container: Container) => {
    container.bind<UnitWorkerFactory>(UnitWorkerFactory).toSelf();
};
