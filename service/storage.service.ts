import { injectable } from 'inversify';
import * as redis from 'redis';
import { Log } from './logger.service';

@injectable()
export class StorageService {

    private clientInstance: Promise<redis.RedisClient>;
    private _isConnected: Promise<boolean>;

    constructor(private log: Log) {
        this.clientInstance = new Promise<redis.RedisClient>((resolve, reject) => {
            const client = redis.createClient();
            this.log.info('Redis client created');

            client.on('error', function (err) {
                this.log.error('Redis Error ' + err);
            });

            client.on('connect', args => {
                this.log.info('Redis client connected');
                resolve(client);
            });
        });

        this._isConnected = new Promise<boolean>((resolve, reject) => {
            this.clientInstance.then(() => {
                resolve(true);
            });
        });

        this.log.info('StorageService created');
    }

    public get isConnected() {
        return this._isConnected;
    }

    public get<T>(key: string) {
        return new Promise<T>((resolve, reject) => {
            this.clientInstance
                .then(client =>
                    client.get(key, (err, reply) => {
                        resolve(<T>JSON.parse(reply));
                    }));
        });
    }

    public set<T>(key: string, value: T) {
        return new Promise<boolean>((resolve, reject) => {
            this.clientInstance
                .then(client =>
                    client.set(key, JSON.stringify(value), (err, reply) => {
                        client.bgsave(() => {
                            resolve(true);
                        });
                    }));
        });
    }

    public reset() {
        return new Promise<void>((resolve, reject) => {
            this.clientInstance
                .then(client => client.flushdb(() => {
                    resolve();
                }));
        });
    }
}
