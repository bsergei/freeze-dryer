import { StorageServiceFactory } from './storage.service';
import { injectable, inject } from 'inversify';

@injectable()
export class ErrorNotifierService {
    constructor(@inject('StorageServiceFactory') private storageService: StorageServiceFactory) {
    }

    public notifyError(msg: string) {
        return this.storageService().publish(
            'notify-error',
            msg,
            true);
    }
}
