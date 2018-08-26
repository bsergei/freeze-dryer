import { container } from '../config/ioc';

import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as serveStatic from 'serve-static';
import { Log } from './logger.service';

import '../controller';


const log = container.resolve(Log);

const startWeb = () => {
    return new Promise<void>((resolve) => {

        // start the server
        const server = new InversifyExpressServer(container);

        server.setConfig((app) => {
            app.use(serveStatic(__dirname + '/../public'));
            app.use(cors());
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
        });

        const port = 80;
        const serverInstance = server.build();
        serverInstance.listen(port, cb => {
            log.info(`Server started on port ${port}`);
            resolve();
        });
    });
};

export { startWeb };
