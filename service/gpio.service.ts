import * as pigpio from 'pigpio';
import { injectable } from 'inversify';

@injectable()
export class GpioService {

    private pins: {
        [pin: number]: pigpio.Gpio
    } = {
    }
    
    constructor() {
        this.pins[17] = new pigpio.Gpio(17, { mode: pigpio.Gpio.OUTPUT });
        this.pins[27] = new pigpio.Gpio(27, { mode: pigpio.Gpio.OUTPUT });
    }

    public switch(pin: number, status: boolean) {
        this.pins[pin].digitalWrite(status ? 1 : 0);
    }

    public read(pin: number) {
        return this.pins[pin].digitalRead() === 0 ? false : true;
    }
}