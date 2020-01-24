import { SensorsStatus } from '../../model';
import { WfContextValues } from './wf-context-values';

export class WfUnitsContext {
    constructor(private values: WfContextValues, private sensors: SensorsStatus) {
    }

    public get compressor(): boolean {
        if (this.values && this.values.compressorUnit !== undefined) {
            return this.values.compressorUnit;
        }
        const gpio = this.sensors.gpios.find(i => i.id === 'compressor');
        return gpio.value;
    }

    public set compressor(value: boolean) {
        this.values.compressorUnit = value;
    }

    public get vacuum(): boolean {
        if (this.values && this.values.vacuumUnit !== undefined) {
            return this.values.vacuumUnit;
        }
        const gpio = this.sensors.gpios.find(i => i.id === 'vacuum');
        return gpio.value;
    }

    public set vacuum(value: boolean) {
        this.values.vacuumUnit = value;
    }

    public get heater(): boolean {
        if (this.values && this.values.heaterUnit !== undefined) {
            return this.values.heaterUnit;
        }
        const gpio = this.sensors.gpios.find(i => i.id === 'heater');
        return gpio.value;
    }

    public set heater(value: boolean) {
        this.values.heaterUnit = value;
    }

    public get thawing(): boolean {
        if (this.values && this.values.thawingUnit !== undefined) {
            return this.values.thawingUnit;
        }
        const gpio = this.sensors.gpios.find(i => i.id === 'thawing');
        return gpio.value;
    }

    public set thawing(value: boolean) {
        this.values.thawingUnit = value;
    }

    public get drain_valve(): boolean {
        if (this.values && this.values.drainValveUnit !== undefined) {
            return this.values.drainValveUnit;
        }
        const gpio = this.sensors.gpios.find(i => i.id === 'drain_valve');
        return gpio.value;
    }

    public set drain_valve(value: boolean) {
        this.values.drainValveUnit = value;
    }

    public get fan(): boolean {
        if (this.values && this.values.fanUnit !== undefined) {
            return this.values.fanUnit;
        }
        const gpio = this.sensors.gpios.find(i => i.id === 'fan');
        return gpio.value;
    }

    public set fan(value: boolean) {
        this.values.fanUnit = value;
    }
}
