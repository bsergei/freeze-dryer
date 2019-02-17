import { injectable } from 'inversify';
import * as redis from 'redis';
import * as Redlock from 'redlock';
import { Log } from './logger.service';
import * as Queue from 'sync-queue';
import { RealtimeChannel } from './realtime';

@injectable()
export class StorageService {

    private clientInstance: Promise<redis.RedisClient>;
    private redlockInstance: Promise<Redlock>;
    private _isConnected: Promise<boolean>;
    private bgSaveQueue;

    constructor(private log: Log) {
        this.bgSaveQueue = new Queue();

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

        this.redlockInstance = new Promise<Redlock>((resolve, reject) => {
            this.clientInstance.then(client => {
                const redlock = new Redlock([client], {
                    // the expected clock drift; for more details
                    // see http://redis.io/topics/distlock
                    driftFactor: 0.01, // time in ms

                    // the max number of times Redlock will attempt
                    // to lock a resource before erroring
                    retryCount: 10,

                    // the time in ms between attempts
                    retryDelay: 100, // time in ms

                    // the max time in ms randomly added to retries
                    // to improve performance under high contention
                    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
                    retryJitter: 100 // time in ms
                });
                resolve(redlock);
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

    public async updateWithLock<T>(key: string, updateFunc: (v: T) => T, isPersistent: boolean = true) {
        const redlock = await this.redlockInstance;
        const lock = await redlock.lock(key + '_lock', 1000);
        try {
            const value = await this.get<T>(key);
            const valueResult = updateFunc(value);
            await this.set(key, valueResult, isPersistent);
            return valueResult;
        }
        finally {
            await lock.unlock();
        }
    }

    public get<T>(key: string) {
        return new Promise<T>((resolve, reject) => {
            this.clientInstance
                .then(client =>
                    client.get(key, (err, reply) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        let res: T;
                        try {
                            if (reply !== undefined) {
                                res = <T>JSON.parse(reply);
                            }
                        } catch (e) {
                            reject(e);
                            return;
                        }
                        resolve(res);
                    }), err => {
                        reject(err);
                    });
        });
    }

    public set(key: string, value: any, isPersistent: boolean = true) {
        return new Promise<boolean>((resolve, reject) => {
            this.clientInstance
                .then(client => {
                    try {
                        client.set(key, JSON.stringify(value), (err, reply) => {
                            if (err) {
                                this.log.error('Redis error: ' + err);
                                reject(err);
                                return;
                            }
                            if (isPersistent) {
                                this.bgSaveQueue.place(() => {
                                    try {
                                        client.bgsave(() => {
                                            resolve(true);
                                        });
                                        this.bgSaveQueue.next();
                                    } catch (bgSaveError) {
                                        this.log.error('Redis error in BGSAVE: ' + bgSaveError);
                                        reject(bgSaveError);
                                    }
                                });
                            } else {
                                resolve(true);
                            }
                        });
                    } catch (setError) {
                        this.log.error('Redis error in SET: ' + setError);
                        reject(setError);
                    }
                });
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

    public async publish(channel: RealtimeChannel, message: any) {
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
}
