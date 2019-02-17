import { injectable } from 'inversify';
import * as redis from 'redis';
import { Log } from './logger.service';

@injectable()
export class RealtimeService {

    private clientInstance: Promise<redis.RedisClient>;
    private _isConnected: Promise<boolean>;

    private handlers: { [name: string]: ((message: any) => void)[] } = {};

    private knownChannels = ['sensors-status'];

    constructor(private log: Log) {

        this.clientInstance = new Promise<redis.RedisClient>((resolve, reject) => {
            const client = redis.createClient();
            this.log.info('RealtimeRedis client created');

            client.on('error', function (err) {
                this.log.error('RealtimeRedis Error ' + err);
            });

            client.on('connect', args => {
                this.log.info('RealtimeRedis client connected');
                resolve(client);
            });

            client.on('message', (ch, msg) => {
                const handlers = this.handlers[ch];
                if (handlers && handlers.length > 0) {
                    for (const h of handlers) {
                        try {
                            let res;
                            let success = false;
                            try {
                                res = JSON.parse(msg);
                                success = true;
                            } catch (e) {
                                this.log.error(`Error in RealtimeRedis (pub/sub: ch: ${ch}, msg: ${msg}): ${e}`);
                            }
                            if (success) {
                                h(res);
                            }
                        } catch (err) {
                            this.log.error(`Error in RealtimeRedis (pub/sub: ch: ${ch}, msg: ${msg}): ${err}`);
                        }
                    }
                }
            });
        });

        this._isConnected = new Promise<boolean>((resolve, reject) => {
            this.clientInstance.then(() => {
                resolve(true);
            });
        });

        this.log.info('RealtimeService created');
    }

    public getKnownChannels() {
        return this.knownChannels.slice();
    }

    public get isConnected() {
        return this._isConnected;
    }

    public async subscribe(channel: string, handler: (message: any) => void) {
        await this.isConnected;

        let handlers = this.handlers[channel];
        if (!handlers) {
            handlers = [];
            this.handlers[channel] = handlers;
        }

        handlers.push(handler);

        if (handlers.length === 1) {
            const client = await this.clientInstance;
            await new Promise<void>((resolve, reject) => {
                client.subscribe(channel, (err, v) => {
                    if (err) {
                        this.log.error('RealtimeRedis error: ' + err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        return () => this.unsubscribe(channel, handler);
    }

    public async publish(channel: string, message: any) {
        const ch = this.knownChannels.find(p => p === channel);
        if (!ch) {
            this.log.info(`Unknown channel published: ${channel}`);
            return;
        }

        const client = await this.clientInstance;
        return new Promise<void>((resolve, reject) => {
            client.publish(channel, JSON.stringify(message), (err, reply) => {
                if (err) {
                    this.log.error('RealtimeRedis error: ' + err);
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    private async unsubscribe(channel: string, handler: (message: any) => void) {
        var handlers = this.handlers[channel];
        if (!handlers) {
            handlers = [];
            this.handlers[channel] = handlers;
        }
        var index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }

        if (handlers.length === 0) {
            const c = await this.clientInstance;
            await new Promise<void>((resolve, reject) => {
                c.unsubscribe(channel, (err, res) => {
                    if (err) {
                        reject(err);
                        this.log.error('Redis error: ' + err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }
}
