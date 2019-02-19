import { UnitWorkerParams } from "../model";

export interface Recipe {
    name: string;
    entries: RecipeEntry[];
}

export interface ExitCondition {
    type: 'timer' | 'sensor';
}

export interface ExitConditionGroup {
    // duration > 900 || sensor.pressure
}

export interface RecipeEntry {

    stepExitCondition: string;

    haltCondition?: string;

    unitWorkers: {
        [id in keyof UnitWorkerParams]: {
            p: UnitWorkerParams[id]
        }
    };
}

export const MyRecipe: Recipe = {
    name: 'My Recipe',

    entries: [{
            stepExitCondition: 'duration > 3600',
            unitWorkers: {
                vacuum: {
                    p: {
                        targetPressure: 500,
                        histeresis: 100
                    }
                }
            }
        }
    ]
};
