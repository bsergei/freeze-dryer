import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import TYPES from './constant/types';
import { TempSensorService } from './service/temp-sensor.service';
import { StorageService } from './service/storage.service';
import { TempSensorOptService } from './service/temp-sensor-opt.service';
import { SensorsStatusService } from './service/sensors-status.service';
import { InfluxService } from './service/influx.service';
import { GpioService } from './service/gpio.service';
import * as serveStatic from 'serve-static';
import { AdcService } from './service/adc.service';

import './controller/sensor-temp.controller';
import './controller/sensor-type.controller';
import './controller/sensor-opt.controller';
import './controller/gpio.controller';
import './controller/sensors-status.controller';
import './controller/storage.controller';

// load everything needed to the Container
let container = new Container();
container.bind<TempSensorService>(TYPES.TempSensorService).to(TempSensorService).inSingletonScope();
container.bind<StorageService>(TYPES.StorageService).to(StorageService).inSingletonScope();
container.bind<TempSensorOptService>(TYPES.TempSensorOptService).to(TempSensorOptService).inSingletonScope();
container.bind<SensorsStatusService>(TYPES.SensorsStatusService).to(SensorsStatusService).inSingletonScope();
container.bind<InfluxService>(TYPES.InfluxService).to(InfluxService).inSingletonScope();
container.bind<GpioService>(TYPES.GpioService).to(GpioService).inSingletonScope();
container.bind<AdcService>(TYPES.AdcService).to(AdcService).inSingletonScope();

// start the server
let server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(serveStatic(__dirname + '/public'));
  app.use(cors());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
});

let serverInstance = server.build();

const influxService = container.get<InfluxService>(TYPES.InfluxService);
const writeSensorStatusFunc = async () => {
  try {
    await influxService.writeSensorStatus();
    console.log(`${new Date()}: Sent sensor data`);
  } catch (e) {
    console.log(e);
  }
  setTimeout(() => writeSensorStatusFunc(), 5000);
}

const storageService = container.get<StorageService>(TYPES.StorageService);
storageService.isConnected.then(async r => {
  if (r) {
    console.log('Redis connected successfully');
    await writeSensorStatusFunc();
    console.log('Sensors data sender started successfully');
  }
});

serverInstance.listen(80);
console.log('Server started on port 80');
