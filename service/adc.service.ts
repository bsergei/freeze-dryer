import * as Raspi from 'raspi';
import * as I2C_NS from 'raspi-i2c';
import * as ADS1x15 from 'raspi-kit-ads1x15';
import * as Queue from 'sync-queue';
import { injectable } from 'inversify';
import { Log } from './logger.service';

@injectable()
export class AdcService {

    private adcPromise: Promise<ADS1x15>;
    private queue;

    constructor(private log: Log) {
        this.adcPromise = new Promise<ADS1x15>((resolve, reject) => {
            Raspi.init(() => {
                const i2c = new I2C_NS.I2C();
                const adc = new ADS1x15({
                    i2c,                                    // i2c interface
                    chip: ADS1x15.chips.IC_ADS1115,         // chip model
                    address: ADS1x15.address.ADDRESS_0x48,  // i2c address on the bus

                    // Defaults for future readings
                    pga: ADS1x15.pga.PGA_4_096V,            // power-gain-amplifier range
                    sps: ADS1x15.spsADS1115.SPS_250         // data rate (samples per second)
                });

                resolve(adc);
            });
        });

        this.queue = new Queue();

        this.log.info('ADC Service created');
    }

    public readAdc(channel: 'A0'|'A1'|'A2'|'A3') {
        let ch;
        switch (channel) {
            case 'A0':
                ch = ADS1x15.channel.CHANNEL_0;
                break;
            case 'A1':
                ch = ADS1x15.channel.CHANNEL_1;
                break;
            case 'A2':
                ch = ADS1x15.channel.CHANNEL_2;
                break;
            case 'A3':
                ch = ADS1x15.channel.CHANNEL_3;
                break;
        }
        if (ch === undefined) {
            this.log.error(`adc.service: Invalid channel specified.`);
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

    public readDifferential() {
        return new Promise<number>((resolve, error) => {
            this.adcPromise.then(adc => {
                this.queue.place(() => {
                    adc.readDifferential(ADS1x15.differential.DIFF_2_3, (err, value, volts) => {
                        resolve(volts);
                        this.queue.next();
                    });
                });
            });
        });
    }
}
