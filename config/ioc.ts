import 'reflect-metadata';

import { Container } from 'inversify';
import { TempSensorService } from '../service/temp-sensor.service';
import { StorageService } from '../service/storage.service';
import { TempSensorOptService } from '../service/temp-sensor-opt.service';
import { SensorsStatusService } from '../service/sensors-status.service';
import { InfluxService } from '../service/influx.service';
import { GpioService } from '../service/gpio.service';
import { AdcService } from '../service/adc.service';
import { SenderService } from '../service/sender.service';
import { PressureSensorService } from '../service/pressure-sensor.service';
import { PressureInterpolatorService } from '../service/pressure-interpolator.service';
import { UnitWorkerService } from '../service/unit-worker.service';

import { configureUnitControl } from '../unit-control/config/ioc';
import { configureUnitWorkers } from '../unit-workers/ioc';

const container = new Container();

container.bind<TempSensorService>(TempSensorService).toSelf().inSingletonScope();
container.bind<StorageService>(StorageService).toSelf().inSingletonScope();
container.bind<TempSensorOptService>(TempSensorOptService).toSelf().inSingletonScope();
container.bind<SensorsStatusService>(SensorsStatusService).toSelf().inSingletonScope();
container.bind<InfluxService>(InfluxService).toSelf().inSingletonScope();
container.bind<GpioService>(GpioService).toSelf().inSingletonScope();
container.bind<AdcService>(AdcService).toSelf().inSingletonScope();
container.bind<SenderService>(SenderService).toSelf().inSingletonScope();
container.bind<PressureSensorService>(PressureSensorService).toSelf().inSingletonScope();
container.bind<PressureInterpolatorService>(PressureInterpolatorService).toSelf().inSingletonScope();
container.bind<UnitWorkerService>(UnitWorkerService).toSelf().inSingletonScope();

configureUnitControl(container);
configureUnitWorkers(container);

export { container };
