import { injectable } from 'inversify';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { RealtimeService } from './realtime.service';
import * as messengerSettings from '../messenger.json';
import { Log } from './logger.service';
import { ShutdownService } from './shutdown.service';
import { StorageService } from './storage.service';
import { SensorsStatusService } from './sensors-status.service';
import { sensorTypes } from '../model';

interface TelegramClients {
    // allClients: number[];
    listenRecipe: number[];
}

@injectable()
export class TelegramService {

    private clients: TelegramClients;
    private bot: Telegraf<ContextMessageUpdate>;
    private rtUnsubscriber: () => Promise<void>;

    constructor(
        private realtimeService: RealtimeService,
        private storageService: StorageService,
        private sensorsStatusService: SensorsStatusService,
        private log: Log,
        private shutdownService: ShutdownService) {
    }

    public async init() {
        const storedClients = await this.storageService.get<TelegramClients>('telegram-clients');
        if (storedClients) {
            this.clients = storedClients;
        } else {
            this.clients = {
                // allClients: [],
                listenRecipe: []
            };
        }

        this.bot = new Telegraf((<any>messengerSettings).api);
        this.bot.start(ctx => {
            ctx.reply('Welcome to Freeze Dryer');
            // this.clients.allClients.push(ctx.chat.id);
            // this.storageService.set('telegram-clients', this.clients);

            // this.log.info(`Telegram: added user: ${ctx.chat.id}`);
        });

        // this.bot.on('left_chat_member', ctx => {
        //     this.clients.allClients = this.clients.allClients.filter(id => id !== ctx.chat.id);
        //     this.storageService.set('telegram-clients', this.clients);

        //     this.log.info(`Telegram: removed user: ${ctx.chat.id}`);
        // });

        this.bot.help(ctx => {
            ctx.reply(`/recipeon - Start listen recipe log
/recipeoff - Stop listen recipe log
/ping - Ping-pong
/units - Units status
/vacuum - Vacuum sensors status
/temperature - Temperature
/adcs - ADC sensors values`);
        });

        this.bot.command('recipeon', ctx => {
            ctx.reply('You started to listen recipe log');
            this.clients.listenRecipe.push(ctx.chat.id);
            this.clients.listenRecipe = this.clients.listenRecipe.filter(
                (elem, index, self) => {
                    return index === self.indexOf(elem);
                });

            this.storageService.set('telegram-clients', this.clients);

            this.log.info(`Telegram: added user to recipe-log: ${ctx.chat.id}`);
        });

        this.bot.command('recipeoff', ctx => {
            ctx.reply('You stopped to listen recipe log');
            this.clients.listenRecipe = this.clients.listenRecipe.filter(id => id !== ctx.chat.id);
            this.storageService.set('telegram-clients', this.clients);

            this.log.info(`Telegram: removed user from recipe-log: ${ctx.chat.id}`);
        });

        this.bot.command('ping', ctx => {
            ctx.reply('pong');
        });

        this.bot.command('units', async ctx => {
            const sensors = await this.sensorsStatusService.getFromCache();
            let result = `Units at 🕗 _${sensors.gpios_ts}_:\n`;
            for (const gpioStatus of sensors.gpios) {
                if (gpioStatus.value) {
                    result += `${gpioStatus.name}: *${gpioStatus.value}* 🔥\n`;
                } else {
                    result += `${gpioStatus.name}: ${gpioStatus.value}\n`;
                }
            }
            ctx.replyWithMarkdown(result);
        });

        this.bot.command('vacuum', async ctx => {
            const sensors = await this.sensorsStatusService.getFromCache();
            let result = `Vacuum at 🕗 _${sensors.pressure_ts}_:\n`;
            for (let i = 0; i < sensors.pressure.length; i++) {
                if (sensors.pressure[i] !== undefined && sensors.pressure[i] !== null) {
                    result += `A${i}: ${sensors.pressure[i]} _mtorr_\n`;
                }
            }

            ctx.replyWithMarkdown(result);
        });

        this.bot.command('temperature', async ctx => {
            const sensors = await this.sensorsStatusService.getFromCache();
            let result = ``;
            for (let sensorType of sensorTypes) {
                const tt = sensors.temp_sensors[sensorType.id];
                if (tt && tt.temperature) {
                    result += `${sensorType.display}: *${tt.temperature}* °C at 🕗 _${tt.ts}_\n`;
                }
            }

            ctx.replyWithMarkdown(result);
        });

        this.bot.command('adcs', async ctx => {
            const sensors = await this.sensorsStatusService.getFromCache();
            let result = `ADCs at 🕗 _${sensors.adcs_ts}_:\n`;
            for (let i = 0; i < sensors.adcs.length; i++) {
                if (sensors.adcs[i] !== undefined && sensors.adcs[i] !== null) {
                    result += `A${i}: ${sensors.adcs[i]} mV\n`;
                }
            }

            ctx.replyWithMarkdown(result);
        });

        await this.bot.launch();

        this.rtUnsubscriber = await this.realtimeService.subscribe(
            'recipe-log',
            async msg => {
                for (const client of this.clients.listenRecipe) {
                    await this.bot.telegram.sendMessage(client, '🍔 ' + msg);
                }
            });

        for (const client of this.clients.listenRecipe) {
            this.bot.telegram.sendMessage(client, '🔌 Freeze Dryer started');
        }

        this.shutdownService.onSigint(async () => {
            for (const client of this.clients.listenRecipe) {
                this.bot.telegram.sendMessage(client, '🔌 Freeze Dryer stopping');
            }
            await this.shutdown();
            this.log.info('Telegram service stopped.');
        });

        this.log.info('Telegram service started.');
    }

    private async shutdown() {
        await this.bot.stop();
        await this.rtUnsubscriber();
    }
}
