export type RealtimeChannel =
    'sensors-status'
    | 'unit-worker-params'
    | 'unit-worker-status'
    | 'recipe-status';

export const RealtimeChannels: RealtimeChannel[] = [
    'sensors-status',
    'unit-worker-params',
    'unit-worker-status',
    'recipe-status'
];
