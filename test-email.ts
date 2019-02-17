import 'reflect-metadata';
import { NotifyService } from './service/notify.service';
import { Log } from './service/logger.service';


new NotifyService(new Log()).error(['Test']);
