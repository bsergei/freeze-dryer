import { RecipeRuntimeState } from "./recipe-runtime-state";
import { Recipe } from "./recipe";

export class RecipeRuntime {

    public state: RecipeRuntimeState;

    constructor(public recipe: Recipe) {
        this.state = new RecipeRuntimeState(this.recipe.name);
    }
}
