import { injectable } from "inversify";
import * as redis from 'redis';

@injectable()
export class StorageService {

    private client: redis.RedisClient;

    public isConnected: Promise<boolean>;

    constructor() {
        this.isConnected = new Promise<boolean>((resolve, reject) => {
            this.client = redis.createClient();
            this.client.on("error", function (err) {
                console.log("Error " + err);
            });

            this.client.on('connect', args => {
                resolve(true);
            });
        });
    }

    public get<T>(key: string) {
        return new Promise<T>((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                resolve(<T>JSON.parse(reply));
            });
        });
    }

    public set<T>(key: string, value: T) {
        return new Promise<boolean>((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (err, reply) => {
                this.client.bgsave();
                resolve(true);
            });
        });
    }
}