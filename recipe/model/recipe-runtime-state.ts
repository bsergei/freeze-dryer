import { RecipeEntryRuntime } from './recipe-entry-runtime';
import { SharedData } from './shared-data';

export interface RecipeRuntimeState extends SharedData {
    recipeName: string;

    startDate: Date;
    endDate?: Date;

    isFinished: boolean;
    isAborted: boolean;

    steps: RecipeEntryRuntime[];
    currentStep?: RecipeEntryRuntime;

    error?: string;

    cursorStr: string;
}
