import { Recipe } from './model/recipe';
import { WfStart } from './model/wf-start';
import { WfAction } from './model/wf-action';
import { WfCondition } from './model/wf-condition';
import { WfEnd } from './model/wf-end';

export const BaseRecipe: Recipe = {
    name: 'Base Recipe',
    entries: [{
        id: 'init',
        name: 'Initialization',
        workflow: [
            <WfStart>{
                id: 'start_wf',
                type: 'start',
                next_id: 'init'
            },
            <WfAction>{
                id: 'init',
                type: 'action',
                cmd: 'units.compressor = false; units.vacuum = false; units.heater = false; units.drain_valve = false; units.fan = false;',
                next_id: 'end'
            },
            <WfEnd>{
                id: 'end',
                type: 'end'
            }
        ]
    },
    {
        id: 'freeze',
        name: 'Freeze',
        workflow: [
            <WfStart>{
                id: 'start_wf',
                type: 'start',
                next_id: 'init'
            },
            <WfAction>{
                id: 'init',
                type: 'action',
                cmd: 'units.compressor = false',
                next_id: 'check_time'
            },
            <WfCondition>{
                id: 'check_time',
                type: 'condition',
                cmd: 'time.total_hours > 9.0',
                next_id_true: 'end',
                next_id_false: 'wait'
            },
            <WfAction>{
                id: 'wait',
                type: 'action',
                cmd: 'time.wait(1)',
                next_id: 'check_compressor_on'
            },
            <WfCondition>{
                id: 'check_compressor_on',
                type: 'condition',
                cmd: 'units.compressor == false && temp.condenser1 > -25.0',
                next_id_true: 'turn_on',
                next_id_false: 'check_compressor_off'
            },
            <WfAction>{
                id: 'turn_on',
                type: 'action',
                cmd: 'unit.compressor = true',
                next_id: 'check_time'
            },
            <WfCondition>{
                id: 'check_compressor_off',
                type: 'condition',
                cmd: 'units.compressor == true && temp.condenser1 < -35.0',
                next_id_true: 'turn_off',
                next_id_false: 'check_time'
            },
            <WfAction>{
                id: 'turn_off',
                type: 'action',
                cmd: 'units.compressor = false',
                next_id: 'check_time'
            },
            <WfAction>{
                id: 'end',
                type: 'action',
                cmd: 'units.compressor = false',
                next_id: 'end_wf'
            },
            <WfEnd>{
                id: 'end_wf',
                type: 'end'
            }
        ]
    }
    ]
};
