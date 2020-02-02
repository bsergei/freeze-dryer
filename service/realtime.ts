export type RealtimeChannel =
    'sensors-status'
    | 'unit-worker-params'
    | 'unit-worker-status'
    | 'recipe-status'
    | 'recipe-log'
    | 'notify-error';

export const RealtimeChannels: RealtimeChannel[] = [
    'sensors-status',
    'unit-worker-params',
    'unit-worker-status',
    'recipe-status',
    'recipe-log',
    'notify-error'
];
