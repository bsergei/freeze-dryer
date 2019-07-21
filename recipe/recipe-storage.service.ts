import { Recipe } from './model/recipe';
import { injectable } from 'inversify';
import { StorageService } from '../service/storage.service';

@injectable()
export class RecipeStorage {

    static keyPrefix = 'recipe-storage:';

    constructor(private storage: StorageService) {
    }

    public async getRecipes() {
        const recipes = await this.storage.search(`${RecipeStorage.keyPrefix}*`);
        return recipes.map(r => r.substring(RecipeStorage.keyPrefix.length));
    }

    public async get(name: string) {
        return await this.storage.get<Recipe>(`${RecipeStorage.keyPrefix}${name}`);
    }

    public async update(recipe: Recipe) {
        return await this.storage.set(`${RecipeStorage.keyPrefix}${recipe.name}`, recipe, true);
    }

    public async delete(name: string) {
        return await this.storage.delete([`${RecipeStorage.keyPrefix}${name}`], true);
    }
}
