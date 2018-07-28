import * as pigpio from 'pigpio';
import { injectable } from 'inversify';
import { GpioStatus } from '../model/gpio-status.model';

export interface GpioDescriptor {
    port: number,
    id: string,
    name: string,
    pin: pigpio.Gpio,
    zeroValue: boolean
}

@injectable()
export class GpioService {

    private pins: GpioDescriptor[];

    constructor() {
        this.pins = [
            {
                port: 13,
                id: 'compressor',
                name: 'Compressor',
                pin: new pigpio.Gpio(6, { mode: pigpio.Gpio.OUTPUT, pullUpDown: pigpio.Gpio.PUD_UP }),
                zeroValue: true
            },
            {
                port: 6,
                id: 'vacuum',
                name: 'Vacuum ',
                pin: new pigpio.Gpio(13, { mode: pigpio.Gpio.OUTPUT, pullUpDown: pigpio.Gpio.PUD_UP }),
                zeroValue: true
            },
            {
                port: 5,
                id: 'fan',
                name: 'Fan and lights',
                pin: new pigpio.Gpio(5, { mode: pigpio.Gpio.OUTPUT, pullUpDown: pigpio.Gpio.PUD_UP }),
                zeroValue: true
            },
            {
                port: 0,
                id: 'drain_valve',
                name: 'Drain Valve',
                pin: new pigpio.Gpio(0, { mode: pigpio.Gpio.OUTPUT, pullUpDown: pigpio.Gpio.PUD_UP }),
                zeroValue: true
            },
            {
                port: 19,
                id: 'heater',
                name: 'Heater',
                pin: new pigpio.Gpio(19, { mode: pigpio.Gpio.OUTPUT, pullUpDown: pigpio.Gpio.PUD_UP }),
                zeroValue: true
            },
            {
                port: 26,
                id: 'thawing',
                name: 'Thawing',
                pin: new pigpio.Gpio(26, { mode: pigpio.Gpio.OUTPUT, pullUpDown: pigpio.Gpio.PUD_UP }),
                zeroValue: true
            }
        ];

        // All off.
        for (const pin of this.pins) {
            pin.pin.digitalWrite(pin.zeroValue === false ? 0 : 1);
        }

        console.log('GPIO service created');
    }

    public set(port: number, status: boolean) {
        const pinConfig = this.pins.find(_ => _.port === port);
        pinConfig.pin.digitalWrite(status === pinConfig.zeroValue ? 0 : 1);
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

    private getOnOffState(pinConfig: GpioDescriptor) {
        return pinConfig.pin.digitalRead() === 0 ? pinConfig.zeroValue : !pinConfig.zeroValue;
    }
}