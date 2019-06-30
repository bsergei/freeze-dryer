import * as fs from 'fs';
import { injectable } from 'inversify';
import { StorageService } from './storage.service';

const W1_FILE = '/sys/bus/w1/devices/w1_bus_master1/w1_master_slaves';

export interface ParserOptions {
    parser?: ('hex'|'decimal'|'default');
}

@injectable()
export class TempSensorService {

    private parsers = {
        'hex': TempSensorService.parseHexData,
        'decimal': TempSensorService.parseDecimalData,
        'default': TempSensorService.parseDecimalData
    };

    private static parseHexData(data: string) {
        const arr = data.split(' ');

        if (arr[1].charAt(0) === 'f') {
            const x = parseInt('0xffff' + arr[1].toString() + arr[0].toString(), 16);
            return (-((~x + 1) * 0.0625));
        } else if (arr[1].charAt(0) === '0') {
            return parseInt('0x0000' + arr[1].toString() + arr[0].toString(), 16) * 0.0625;
        }
        throw new Error('Cannot parse data');
    }

    private static parseDecimalData(data: string) {
        const arr = data.split('\n');

        if (arr[0].indexOf('YES') > -1) {
            const output = data.match(/t=(-?(\d+))/);
            if (output && output.length > 1) {
                const outputNum: number = Number(output[1]);
                return Math.round(outputNum / 100) / 10;
            } else {
                throw new Error('Cannot parse result');
            }
        } else if (arr[0].indexOf('NO') > -1) {
            return undefined;
        }
        throw new Error('Cannot get temperature');
    }

    public getSensors(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readFile(W1_FILE, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                const parts = data.split('\n');
                parts.pop();
                resolve(parts);
            });
        });
    }

    public getTemperature(sensor: string, options?: ParserOptions) {
        return new Promise<number>((resolve, reject) => {
            fs.readFile('/sys/bus/w1/devices/' + sensor + '/w1_slave', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                let result: number | undefined;
                try {
                    result = this.parseData(data, options);
                } catch (e) {
                    reject(new Error('Cannot read temperature for sensor ' + sensor + ': ' + e));
                    return;
                }

                if (result === undefined || result === null) {
                    reject(new Error('Cannot read temperature for sensor ' + sensor));
                    return;
                }

                if (result === 85.0) {
                    reject(new Error('Temperature sensor communication error: ' + sensor));
                    return;
                }

                resolve(result);
            });
        });
    }

    private parseData(data: string, options?: ParserOptions) {
        let parser = (options ? options.parser : undefined) || 'default';
        if (!this.parsers[parser]) {
            parser = 'default';
        }
        return this.parsers[parser](data);
    }
}

interface MockValue {
    value: number;
}

@injectable()
export class TempSensorServiceMock extends TempSensorService {

    constructor(private storageService: StorageService) {
        super();
    }

    public async getSensors() {
        return this.storageService.search('mock:temp-sensor:*');
    }

    public async getTemperature(sensor: string, options?: ParserOptions) {
        const r = await this.storageService.get<MockValue>(`mock:temp-sensor:${sensor}`);
        if (!r) {
            return 20.0;
        }

        return r.value;
    }

    public async setTemperature(sensor: string, value: number) {
        await this.storageService.set(`mock:temp-sensor:${sensor}`, <MockValue>{ value: value });
    }
}
