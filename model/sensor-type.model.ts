export type TempSensorTypeId = 'condenser_input'
  | 'condenser_output'
  | 'condenser1'
  | 'condenser2'
  | 'condenser3'
  | 'freezer_camera'
  | 'product'
  | 'product2'
  | 'product3'
  | 'product4'
  | 'product5'
  | 'heater'
  | 'heater2'
  | 'heater3'
  | 'heater4'
  | 'heater5'
  | 'heater'
  | 'compressor'
  | 'vacuum_pump';

export interface SensorType {
    id: TempSensorTypeId;
    display: string;
}

export const sensorTypes: SensorType[] = [{
    id: 'condenser_input',
    display: 'Condenser Input'
  },
  {
    id: 'condenser_output',
    display: 'Condenser Output'
  },
  {
    id: 'condenser1',
    display: 'Condenser 1'
  },
  {
    id: 'condenser2',
    display: 'Condenser 2'
  },
  {
    id: 'condenser3',
    display: 'Condenser 3'
  },
  {
    id: 'freezer_camera',
    display: 'Freezer Camera'
  },
  {
    id: 'product',
    display: 'Product'
  },
  {
    id: 'product2',
    display: 'Product 2'
  },
  {
    id: 'product3',
    display: 'Product 3'
  },
  {
    id: 'product4',
    display: 'Product 4'
  },
  {
    id: 'product5',
    display: 'Product 5'
  },
  {
    id: 'heater',
    display: 'Heater'
  },
  {
    id: 'heater2',
    display: 'Heater 2'
  },
  {
    id: 'heater3',
    display: 'Heater 3'
  },
  {
    id: 'heater4',
    display: 'Heater 4'
  },
  {
    id: 'heater5',
    display: 'Heater 5'
  },
  {
    id: 'compressor',
    display: 'Compressor'
  },
  {
    id: 'vacuum_pump',
    display: 'Vacuum Pump'
  }
];
