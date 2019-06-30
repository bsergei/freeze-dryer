import { BaseRecipe } from './base-recipe';
import { WfStart } from './model/wf-start';
import { WfEnd } from './model/wf-end';
import { WfAction } from './model/wf-action';
import { WfCondition } from './model/wf-condition';

const recipe = BaseRecipe;

console.log('graph TD');
for (const entry of recipe.entries) {
    console.log(`subgraph ${entry.id}`);
    for (const wf of entry.workflow) {
        switch (wf.type) {
            case 'start':
                {
                    const item = wf as WfStart;
                    console.log(`${item.id.toUpperCase()}[Start] --> ${item.next_id.toUpperCase()}`);
                }
                break;
            case 'end':
                {
                    const item = wf as WfEnd;
                    console.log(`${item.id.toUpperCase()}[End]`);
                }
                break;
            case 'action':
                {
                    const item = wf as WfAction;
                    console.log(`${item.id.toUpperCase()}["${item.id}:${item.cmd}"] --> ${item.next_id.toUpperCase()}`);
                }
                break;
            case 'condition':
                {
                    const item = wf as WfCondition;
                    console.log(`${item.id.toUpperCase()}{"${item.cmd}"}`);
                    console.log(`${item.id.toUpperCase()} -->|True| ${item.next_id_true.toUpperCase()}`);
                    console.log(`${item.id.toUpperCase()} -->|False| ${item.next_id_false.toUpperCase()}`);
                }
                break;
        }
    }
    console.log(`end`);
}

// https://mermaidjs.github.io/mermaid-live-editor/
