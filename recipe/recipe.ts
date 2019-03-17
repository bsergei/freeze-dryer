import { RecipeEntry } from './recipe-entry';

export interface Recipe {
    name: string;
    entries: RecipeEntry[];
}
