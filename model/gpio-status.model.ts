import { Gpios } from "./gpios.model";

export interface GpioStatus {
    port: number;
    id: Gpios;
    name: string;
    value: boolean;
}
