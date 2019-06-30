import { Recipe } from './recipe';
import { BASERECIPE } from './base-recipe';
import { RecipeRuntime } from './recipe-runtime';

export class RecipeStorage {
    public getRecipes() {
        return [
            'Base Recipe'
        ];
    }

    public get(name: string) {
        switch (name) {
            case 'Base Recipe':
                return this.toRuntimeRecipe(BASERECIPE);
        }
    }

    private toRuntimeRecipe(recipe: Recipe) {
        return new RecipeRuntime(recipe);
    }
}
