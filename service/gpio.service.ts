import * as onoff from 'onoff';
import { injectable } from 'inversify';
import { GpioStatus } from '../model/gpio-status.model';
import { Log } from './logger.service';
import { Gpios } from '../model/gpios.model';

export interface GpioDescriptor {
    port: number;
    id: Gpios;
    name: string;
    pin: onoff.Gpio;
    zeroValue: boolean;
}

@injectable()
export class GpioService {

    private pins: GpioDescriptor[];

    constructor(private log: Log, private shutdownService: ShutdownService) {
        this.pins = [
            {
                port: 13,
                id: 'compressor',
                name: 'Compressor',
                pin: new onoff.Gpio(6, 'out'),
                zeroValue: true
            },
            {
                port: 6,
                id: 'vacuum',
                name: 'Vacuum ',
                pin: new onoff.Gpio(13, 'out'),
                zeroValue: true
            },
            {
                port: 5,
                id: 'fan',
                name: 'Fan and lights',
                pin: new onoff.Gpio(5, 'out'),
                zeroValue: true
            },
            {
                port: 0,
                id: 'drain_valve',
                name: 'Drain Valve',
                pin: new onoff.Gpio(0, 'out'),
                zeroValue: true
            },
            {
                port: 19,
                id: 'heater',
                name: 'Heater',
                pin: new onoff.Gpio(19, 'out'),
                zeroValue: true
            },
            {
                port: 26,
                id: 'thawing',
                name: 'Thawing',
                pin: new onoff.Gpio(26, 'out'),
                zeroValue: true
            }
        ];

        this.shutdownService.onSigint(() => {
            for (const pin of this.pins) {
                try {
                    pin.pin.unexport();
                } catch (e) {
                    this.log.error(e);
                }
            }
            this.log.info('GPIO service stopped');
        });

        this.allOff();
        this.log.info('GPIO service started');
    }

    public allOff() {
        for (const pin of this.pins) {
            pin.pin.writeSync(pin.zeroValue === false ? 0 : 1);
        }
    }

    public set(port: number, status: boolean) {
        const pinConfig = this.pins.find(_ => _.port === port);
        pinConfig.pin.writeSync(status === pinConfig.zeroValue ? 0 : 1);
        this.log.info(`GPIO: Set BCM${port} (${pinConfig.id}) to ${status}, result=${this.getOnOffState(pinConfig)}`);
    }

    public get(port: number) {
        const pinConfig = this.pins.find(_ => _.port === port);
        return this.getOnOffState(pinConfig);
    }

    public getAll() {
        const result: GpioStatus[] = [];

        for (const pinConfig of this.pins) {
            result.push({
                port: pinConfig.port,
                id: pinConfig.id,
                name: pinConfig.name,
                value: this.getOnOffState(pinConfig)
            });
        }

        return result;
    }

    public findPin(id: Gpios) {
        return this.pins.find(_ => _.id === id);
    }

    private getOnOffState(pinConfig: GpioDescriptor) {
        return pinConfig.pin.readSync() === 0 ? pinConfig.zeroValue : !pinConfig.zeroValue;
    }
}
