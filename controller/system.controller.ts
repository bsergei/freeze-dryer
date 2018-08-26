import {
    controller, httpPost
} from 'inversify-express-utils';
import * as cp from 'child_process';

@controller('/api/system')
export class SystemController {
    @httpPost('/reboot')
    public reboot() {
        cp.exec('sudo reboot now');
    }
}
