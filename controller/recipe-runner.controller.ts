import { controller, httpGet, httpPost, httpDelete } from 'inversify-express-utils';
import { Request } from 'express';
import { RecipeRunnerService } from '../recipe/recipe-runner.service';
import { RecipeStartRequest } from '../model';

@controller('/api/recipe-runner')
export class RecipeRunnerController {

    constructor(private runner: RecipeRunnerService) {
    }

    @httpPost('/')
    public async start(req: Request) {
        const recipe = req.body as RecipeStartRequest;
        return this.runner.startAsFireAndForget(recipe.name, recipe.recipeEntryName);
    }

    @httpGet('/')
    public async getState(req: Request) {
        return await this.runner.getCurrentState();
    }

    @httpDelete('/')
    public async abort(req: Request) {
        return await this.runner.abort();
    }
}
