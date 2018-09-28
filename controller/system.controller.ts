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

    @httpPost('/restart-charting')
    public async rebootCharting() {
        const p1 = new Promise(r => {
            cp.exec('sudo systemctl restart influxdb', cb => {
                r();
            });
        });

        const p2 = new Promise(r => {
            cp.exec('sudo systemctl restart grafana', cb => {
                r();
            });
        });

        return await Promise.all([p1, p2]);
    }
}
