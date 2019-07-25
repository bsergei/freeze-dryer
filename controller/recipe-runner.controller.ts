import { controller, httpGet, httpPost, httpDelete } from 'inversify-express-utils';
import { Request } from 'express';
import { RecipeRunnerService } from '../recipe/recipe-runner.service';
import { Recipe } from '../model';

@controller('/api/recipe-runner')
export class RecipeRunnerController {

    constructor(private runner: RecipeRunnerService) {
    }

    @httpPost('/')
    public async start(req: Request) {
        const recipe = req.body as Recipe;
        return this.runner.startAsFireAndForget(recipe.name);
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
