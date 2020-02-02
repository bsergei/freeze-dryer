import { StorageService } from './storage.service';
import { injectable } from 'inversify';

@injectable()
export class ErrorNotifierService {
    constructor(private storageService: () => StorageService) {
    }

    public notifyError(msg: string) {
        return this.storageService().publish(
            'notify-error',
            msg,
            true);
    }
}
