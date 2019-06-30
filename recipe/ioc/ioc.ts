import { Container } from 'inversify';
import { RecipeStorage } from '../recipe-storage.service';
import { RecipeRunnerService } from '../recipe-runner.service';
import { WorkflowRunnerServiceFactory } from '../workflow-runner.service';

export const configureRecipe = (container: Container) => {
    container.bind<RecipeStorage>(RecipeStorage).toSelf().inSingletonScope();
    container.bind<RecipeRunnerService>(RecipeRunnerService).toSelf().inSingletonScope();
    container.bind<WorkflowRunnerServiceFactory>(WorkflowRunnerServiceFactory).toSelf().inSingletonScope();
};
