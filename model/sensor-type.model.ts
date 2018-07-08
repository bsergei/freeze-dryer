export interface SensorType {
    id: string,
    display: string
}

export const SensorTypes: SensorType[] = [{
    id: 'condenser_input',
    display: 'Condenser Input'
  },
  {
    id: 'condenser_output',
    display: 'Condenser Output'
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
    id: 'heater',
    display: 'Heater'
  },
  {
    id: 'compressor',
    display: 'Compressor'
  }
];