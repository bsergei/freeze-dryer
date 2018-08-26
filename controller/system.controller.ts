import {
    controller, httpGet
} from 'inversify-express-utils';
import * as cp from 'child_process';

@controller('/api/system')
export class SystemController {
    @httpGet('/reboot')
    public reboot() {
        cp.exec('sudo reboot now');
    }
}
