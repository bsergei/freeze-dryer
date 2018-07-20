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

import './controller/sensor-temp.controller';
import './controller/sensor-type.controller';
import './controller/sensor-opt.controller';
import './controller/gpio.controller';
import './controller/sensors-status.controller';
import './controller/storage.controller';

// load everything needed to the Container
let container = new Container();
container.bind<TempSensorService>(TYPES.TempSensorService).to(TempSensorService);
container.bind<StorageService>(TYPES.StorageService).to(StorageService);
container.bind<TempSensorOptService>(TYPES.TempSensorOptService).to(TempSensorOptService);
container.bind<SensorsStatusService>(TYPES.SensorsStatusService).to(SensorsStatusService);
container.bind<InfluxService>(TYPES.InfluxService).to(InfluxService);
container.bind<GpioService>(TYPES.GpioService).to(GpioService);

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
serverInstance.listen(80);

const storageService = container.get<StorageService>(TYPES.StorageService);
storageService.isConnected.then(async r => {
  if (r) {    
    console.log('Redis connected successfully');
  }
});

const influxService = container.get<InfluxService>(TYPES.InfluxService);
setInterval(async () => {
  await influxService.writeTemperatures();
  console.log('Influx: sent sensor data');
}, 10000);

console.log('Server started on port 3030 :)');
