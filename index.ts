import { container } from "./config/ioc";
import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as serveStatic from 'serve-static';

import { SenderService } from "./service/sender.service";

import './controller/sensor-temp.controller';
import './controller/sensor-type.controller';
import './controller/sensor-opt.controller';
import './controller/gpio.controller';
import './controller/sensors-status.controller';
import './controller/storage.controller';

const start = async () => {
  const senderService = container.resolve(SenderService);
  await senderService.init();

  // start the server
  const server = new InversifyExpressServer(container);

  server.setConfig((app) => {
    app.use(serveStatic(__dirname + '/public'));
    app.use(cors());
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(bodyParser.json());
  });

  const serverInstance = server.build();
  serverInstance.listen(80);
  console.log('Server started on port 80');
};

start();