import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import TYPES from './constant/types';
import { TempSensorService } from './service/temp-sensor.service';
import { StorageService } from './service/storage.service';

import './controller/sensor-temp.controller';
import './controller/sensor-opt.controller';

// load everything needed to the Container
let container = new Container();
container.bind<TempSensorService>(TYPES.TempSensorService).to(TempSensorService);
container.bind<StorageService>(TYPES.StorageService).to(StorageService);

// start the server
let server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(cors());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
});

let serverInstance = server.build();
serverInstance.listen(3000);

const storageService = container.get<StorageService>(TYPES.StorageService)
storageService.isConnected.then(async r => {
  if (r) {    
    console.log('Redis connected successfully');
  }
});

console.log('Server started on port 3000 :)');
