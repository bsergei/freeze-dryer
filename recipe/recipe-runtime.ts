import { RecipeRuntimeState } from './model/recipe-runtime-state';
import { Recipe } from './model/recipe';

export class RecipeRuntime {

    public state: RecipeRuntimeState;

    constructor(public recipe: Recipe) {
        this.state = new RecipeRuntimeState(this.recipe.name);
    }
}
