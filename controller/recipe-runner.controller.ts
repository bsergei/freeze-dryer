import { controller, httpGet, httpPost, httpDelete } from 'inversify-express-utils';
import { Request } from 'express';
import { RecipeRunnerService } from '../recipe/recipe-runner.service';

@controller('/api/recipe-runner')
export class RecipeRunnerController {

    constructor(private runner: RecipeRunnerService) {
    }

    @httpPost('/')
    public async start(req: Request) {
        const name = req.body as string;
        return await this.runner.start(name);
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
