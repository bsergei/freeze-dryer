import { Recipe } from './model/recipe';
import { injectable } from 'inversify';
import { StorageService } from '../service/storage.service';

@injectable()
export class RecipeStorage {

    constructor(private storage: StorageService) {
    }

    public async getRecipes() {
        const recipes = await this.storage.search('recipe-storage:*');
        return recipes;
    }

    public async get(name: string) {
        return await this.storage.get<Recipe>(`recipe-storage:${name}`);
    }

    public async update(recipe: Recipe) {
        return await this.storage.set(recipe.name, recipe, true);
    }
}
