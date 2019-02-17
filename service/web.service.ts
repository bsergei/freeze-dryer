import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as serveStatic from 'serve-static';
import { Log } from './logger.service';

import '../controller';

import * as io from 'socket.io';
import { injectable, Container } from 'inversify';
import { RealtimeService } from './realtime.service';

@injectable()
export class WebService {

    private serverInstance: Promise<any>;

    constructor(
        private log: Log,
        private realtimeService: RealtimeService) {
    }

    public init(container: Container) {
        this.serverInstance = new Promise<any>((resolve) => {
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
            const httpServer = serverInstance.listen(port, () => {
                this.log.info(`Server started on port ${port}`);
            });

            const ioServer = io(httpServer);
            ioServer.on('connect', async socket => {
                this.log.info(`Socket.IO client connected`);
                let unsubscribers: (() => Promise<void>)[] = [];
                try {
                    for (const ch of this.realtimeService.getKnownChannels()) {
                        const unsubscriber = await this.realtimeService.subscribe(ch, (msg) => {
                            socket.emit(ch, msg);
                        });
                        unsubscribers.push(unsubscriber);
                    }
                } finally {
                    socket.on('disconnect', async () => {
                        for (const unsubscriber of unsubscribers) {
                            if (unsubscriber) {
                                await unsubscriber();
                            }
                        }

                        this.log.info(`Socket.IO client disconnected`);
                    });
                }
            });

            resolve(httpServer);
        });

        return this.serverInstance;
    }
}
