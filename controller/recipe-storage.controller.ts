import { controller, httpGet, httpPost, httpDelete } from 'inversify-express-utils';
import { RecipeStorage } from '../recipe/recipe-storage.service';
import { Request } from 'express';
import { Recipe } from '../recipe/model/recipe';

@controller('/api/recipe-storage')
export class RecipeStorageController {
    constructor(private storage: RecipeStorage) {
    }

    @httpGet('/')
    public async getAll(req: Request) {
        return await this.storage.getRecipes();
    }

    @httpGet('/:id')
    public async get(req: Request) {
        return await this.storage.get(req.params.id);
    }

    @httpPost('/')
    public async addOrUpdate(request: Request) {
        const item = request.body as Recipe;
        await this.storage.update(item);
        return await this.storage.get(item.name);
    }

    @httpDelete('/:id')
    public async del(request: Request) {
        await this.storage.delete(request.params.id);
    }
}
