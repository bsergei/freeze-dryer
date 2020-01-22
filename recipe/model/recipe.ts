import { RecipeEntry } from './recipe-entry';

export interface Recipe {
    name: string;
    entries: RecipeEntry[];
}

export interface RecipeStartRequest {
    name: string;
    recipeEntryName?: string;
}
