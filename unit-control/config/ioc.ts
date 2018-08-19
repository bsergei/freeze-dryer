import { Container } from 'inversify';
import { CompressorUnit } from '../units/compressor-unit';
import { DrainValveUnit } from '../units/drain-valve-unit';
import { FanUnit } from '../units/fan-unit';
import { HeaterUnit } from '../units/heater-unit';
import { ThawingUnit } from '../units/thawing-unit';
import { VacuumUnit } from '../units/vacuum-unit';
import { TemperatureParamFactory } from '../sensors/temperature-param';
import { PressureParam } from '../sensors/pressure-param';
import { GpioUnit } from '../units/gpio-unit';

export const configureUnitControl = (container: Container) => {
    container.bind<CompressorUnit>(CompressorUnit).toSelf();
    container.bind<DrainValveUnit>(DrainValveUnit).toSelf();
    container.bind<FanUnit>(FanUnit).toSelf();
    container.bind<HeaterUnit>(HeaterUnit).toSelf();
    container.bind<ThawingUnit>(ThawingUnit).toSelf();
    container.bind<VacuumUnit>(VacuumUnit).toSelf();
    container.bind<TemperatureParamFactory>(TemperatureParamFactory).toSelf();
    container.bind<PressureParam>(PressureParam).toSelf();
    container.bind<GpioUnit>(GpioUnit).toSelf().inSingletonScope();
};
