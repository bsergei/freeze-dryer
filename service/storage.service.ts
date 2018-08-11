import { injectable } from 'inversify';
import * as redis from 'redis';

@injectable()
export class StorageService {

    private clientInstance: Promise<redis.RedisClient>;

    constructor() {
        this.clientInstance = new Promise<redis.RedisClient>((resolve, reject) => {
            const client = redis.createClient();
            console.log('Redis client created');

            client.on('error', function (err) {
                console.log('Error ' + err);
            });

            client.on('connect', args => {
                console.log('Redis client connected');
                resolve(client);
            });
        });

        console.log('StorageService created');
    }

    public get isConnected() {
        return new Promise<boolean>((resolve, reject) => {
            this.clientInstance.then(() => {
                resolve(true);
            });
        });
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
                        client.bgsave();
                        resolve(true);
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
