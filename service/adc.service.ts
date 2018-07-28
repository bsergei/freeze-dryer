import * as Raspi from 'raspi';
import * as I2C_NS from 'raspi-i2c';
import * as ADS1x15 from 'raspi-kit-ads1x15';
import * as Queue from 'sync-queue';
import { injectable } from 'inversify';

@injectable()
export class AdcService {

    private adcPromise: Promise<ADS1x15>;
    private queue;

    constructor() {
        this.adcPromise = new Promise<ADS1x15>((resolve, reject) => {
            Raspi.init(() => {
                const i2c = new I2C_NS.I2C();
                const adc = new ADS1x15({
                    i2c,                                    // i2c interface
                    chip: ADS1x15.chips.IC_ADS1115,         // chip model
                    address: ADS1x15.address.ADDRESS_0x48,  // i2c address on the bus
        
                    // Defaults for future readings
                    pga: ADS1x15.pga.PGA_6_144V,            // power-gain-amplifier range
                    sps: ADS1x15.spsADS1115.SPS_250         // data rate (samples per second)
                });
        
                resolve(adc);
            });
        });
        
        this.queue = new Queue();

        console.log('ADC Service created');
    }
    
    public readAdc(channel: number) {
        let ch;
        switch (channel) {
            case 0:
                ch = ADS1x15.channel.CHANNEL_0;
                break;
            case 1:
                ch = ADS1x15.channel.CHANNEL_1;
                break;
            case 2:
                ch = ADS1x15.channel.CHANNEL_2;
                break;
            case 3:
                ch = ADS1x15.channel.CHANNEL_3;
                break;
        }
        if (ch === undefined) {
            console.error('Invalid channel specified.')
            return Promise.resolve(undefined as number);
        }
        return new Promise<number>((resolve, error) => {
            this.adcPromise.then(adc => {
                this.queue.place(() => {
                    adc.readChannel(ch, (err, value, volts) => {
                        resolve(volts);
                        this.queue.next();
                    });
                });
            });
        });
    }
}