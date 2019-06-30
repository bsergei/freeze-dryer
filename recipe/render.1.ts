import { BaseRecipe } from './base-recipe';
import { WfStart } from './model/wf-start';
import { WfEnd } from './model/wf-end';
import { WfAction } from './model/wf-action';
import { WfCondition } from './model/wf-condition';

const recipe = BaseRecipe;

for (const entry of recipe.entries) {
    console.log('-------------------------');
    for (const wf of entry.workflow) {
        switch (wf.type) {
            case 'start':
                {
                    const item = wf as WfStart;
                    console.log(`${item.id}=>start: Start`);
                }
                break;
            case 'end':
                {
                    const item = wf as WfEnd;
                    console.log(`${item.id}=>end: End`);
                }
                break;
            case 'action':
                {
                    const item = wf as WfAction;
                    console.log(`${item.id}=>operation: ${item.id}`);
                }
                break;
            case 'condition':
                {
                    const item = wf as WfCondition;
                    console.log(`${item.id}=>condition: ${item.id}`);
                }
                break;
        }
    }

    // Print edges.
    for (const wf of entry.workflow) {
        switch (wf.type) {
            case 'start':
                {
                    const item = wf as WfStart;
                    console.log(`${item.id}->${item.next_id}`);
                }
                break;
            case 'action':
                {
                    const item = wf as WfAction;
                    console.log(`${item.id}->${item.next_id}`);
                }
                break;
            case 'condition':
                {
                    const item = wf as WfCondition;
                    console.log(`${item.id}(yes)->${item.next_id_true}`);
                    console.log(`${item.id}(no)->${item.next_id_false}`);
                }
                break;
        }
    }
}

// https://mermaidjs.github.io/mermaid-live-editor/
