import { injectable } from 'inversify';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { RealtimeService } from './realtime.service';
import * as messengerSettings from '../messenger.json';
import { Log } from './logger.service';
import { ShutdownService } from './shutdown.service';
import { StorageService } from './storage.service';
import { SensorsStatusService } from './sensors-status.service';
import { sensorTypes } from '../model';
import { RecipeRunnerService } from '../recipe/recipe-runner.service';

interface TelegramClients {
    listenRecipe: number[];
    listenErrors: number[];
}

@injectable()
export class TelegramService {

    private clients: TelegramClients;
    private bot: Telegraf<ContextMessageUpdate>;
    private rtUnsubscribers: (() => Promise<void>)[] = [];

    constructor(
        private realtimeService: RealtimeService,
        private storageService: StorageService,
        private sensorsStatusService: SensorsStatusService,
        private recipeRunnerService: RecipeRunnerService,
        private log: Log,
        private shutdownService: ShutdownService) {
    }

    public async init() {
        await this.initClientsStorage();

        this.bot = new Telegraf((<any>messengerSettings).api);
        this.bot.start(ctx => {
            ctx.reply('Welcome to Freeze Dryer. Type /help to list available commands.');
        });

        this.bot.help(ctx => {
            ctx.reply(`/recipeon - Start listen recipe log
/recipeoff - Stop listen recipe log
/recipestatus - Recipe status
/ping - Ping-pong
/units - Units status
/vacuum - Vacuum sensors status
/temperature - Temperature
/adcs - ADC sensors values
/errorson - Start listen errors
/errorsoff - Stop listen errors`);
        });

        this.bot.command('recipeon', this.onCmdRecipeOn.bind(this));
        this.bot.command('recipeoff', this.onCmdRecipeOff.bind(this));
        this.bot.command('ping', this.onCmdPing.bind(this));
        this.bot.command('units', this.onCmdUnits.bind(this));
        this.bot.command('vacuum', this.onCmdVacuum.bind(this));
        this.bot.command('temperature', this.onCmdTemperature.bind(this));
        this.bot.command('adcs', this.onCmdAdcs.bind(this));
        this.bot.command('errorson', this.onCmdErrorsOn.bind(this));
        this.bot.command('errorsoff', this.onCmdErrorsOff.bind(this));
        this.bot.command('recipestatus', this.onCmdRecipeStatus.bind(this));

        await this.bot.launch();

        this.rtUnsubscribers.push(await this.realtimeService.subscribe(
            'recipe-log',
            async msg => await this.sendRecipeLog(msg)));

        this.rtUnsubscribers.push(await this.realtimeService.subscribe(
            'notify-error',
            async msg => await this.sendNotifyError(msg)));

        for (const client of this.clients.listenRecipe) {
            this.bot.telegram.sendMessage(client, '🔌 Freeze Dryer started');
        }

        this.shutdownService.subscribe(() => this.onShutdown());
        this.log.info('Telegram service started.');
    }

    private async onCmdRecipeOn(ctx: ContextMessageUpdate) {
        if (this.addClient(this.clients.listenRecipe, ctx.chat.id)) {
            await ctx.reply('You started to listen recipe log');
            this.log.info(`Telegram: added user to recipe-log: ${ctx.chat.id}`);
        } else {
            await ctx.reply('You already subscribed');
        }
    }

    private async onCmdRecipeOff(ctx: ContextMessageUpdate) {
        if (this.removeClient(this.clients.listenRecipe, ctx.chat.id)) {
            await ctx.reply('You stopped to listen recipe log');
            this.log.info(`Telegram: removed user from recipe-log: ${ctx.chat.id}`);
        } else {
            await ctx.reply('You already unsubscribed');
        }
    }

    private async onCmdPing(ctx: ContextMessageUpdate) {
        await ctx.reply('pong');
    }

    private async onCmdUnits(ctx: ContextMessageUpdate) {
        const sensors = await this.sensorsStatusService.getFromCache();
        let result = `Units at 🕗 _${sensors.gpios_ts}_:\n`;
        for (const gpioStatus of sensors.gpios) {
            if (gpioStatus.value) {
                result += `${gpioStatus.name}: *${gpioStatus.value}* 🔥\n`;
            } else {
                result += `${gpioStatus.name}: ${gpioStatus.value}\n`;
            }
        }
        await ctx.replyWithMarkdown(result);
    }

    private async onCmdVacuum(ctx: ContextMessageUpdate) {
        const sensors = await this.sensorsStatusService.getFromCache();
        let result = `Vacuum at 🕗 _${sensors.pressure_ts}_:\n`;
        for (let i = 0; i < sensors.pressure.length; i++) {
            if (sensors.pressure[i] !== undefined && sensors.pressure[i] !== null) {
                result += `A${i}: ${sensors.pressure[i]} _mtorr_\n`;
            }
        }
        await ctx.replyWithMarkdown(result);
    }

    private async onCmdTemperature(ctx: ContextMessageUpdate) {
        const sensors = await this.sensorsStatusService.getFromCache();
        let result = ``;
        for (let sensorType of sensorTypes) {
            const tt = sensors.temp_sensors[sensorType.id];
            if (tt && tt.temperature) {
                result += `${sensorType.display}: *${tt.temperature}* °C at 🕗 _${tt.ts}_\n`;
            }
        }
        await ctx.replyWithMarkdown(result);
    }

    private async onCmdAdcs(ctx: ContextMessageUpdate) {
        const sensors = await this.sensorsStatusService.getFromCache();
        let result = `ADCs at 🕗 _${sensors.adcs_ts}_:\n`;
        for (let i = 0; i < sensors.adcs.length; i++) {
            if (sensors.adcs[i] !== undefined && sensors.adcs[i] !== null) {
                result += `A${i}: ${sensors.adcs[i]} mV\n`;
            }
        }
        await ctx.replyWithMarkdown(result);
    }

    private async onCmdErrorsOn(ctx: ContextMessageUpdate) {
        if (this.addClient(this.clients.listenErrors, ctx.chat.id)) {
            await ctx.reply('You started to listen error log');
            this.log.info(`Telegram: added user to error log: ${ctx.chat.id}`);
        } else {
            await ctx.reply('You already subscribed');
        }
    }

    private async onCmdErrorsOff(ctx: ContextMessageUpdate) {
        if (this.removeClient(this.clients.listenErrors, ctx.chat.id)) {
            await ctx.reply('You stopped to listen error log');
            this.log.info(`Telegram: removed user from error log: ${ctx.chat.id}`);
        } else {
            await ctx.reply('You already unsubscribed');
        }
    }

    private async onCmdRecipeStatus(ctx: ContextMessageUpdate) {
        const state = await this.recipeRunnerService.getCurrentState();
        if (state) {
            await ctx.reply(JSON.stringify(state));
        } else {
            await ctx.reply('Not available');
        }
    }

    private addClient(arr: number[], chatId: number) {
        if (arr.indexOf(chatId) >= 0) {
            return false;
        }

        arr.push(chatId);
        this.storageService.set('telegram-clients', this.clients);
        return true;
    }

    private removeClient(arr: number[], chatId: number) {
        const index = arr.indexOf(chatId);
        if (index >= 0) {
            arr.splice(index, 1);
            this.storageService.set('telegram-clients', this.clients);
            return true;
        }

        return false;
    }

    private async initClientsStorage() {
        const storedClients = await this.storageService.get<TelegramClients>('telegram-clients');
        if (storedClients) {
            this.clients = storedClients;
            if (!this.clients.listenErrors) {
                this.clients.listenErrors = [];
            }
            if (!this.clients.listenRecipe) {
                this.clients.listenRecipe = [];
            }
        } else {
            this.clients = {
                listenRecipe: [],
                listenErrors: []
            };
        }
    }

    private async onShutdown() {
        for (const client of this.clients.listenRecipe) {
            await this.bot.telegram.sendMessage(client, '🔌 Freeze Dryer stopping');
        }
        await this.shutdown();
        this.log.info('Telegram service stopped.');
    }

    private async sendNotifyError(msg: any) {
        for (const client of this.clients.listenErrors) {
            await this.bot.telegram.sendMessage(client, '👺 ' + msg);
        }
    }

    private async sendRecipeLog(msg: any) {
        for (const client of this.clients.listenRecipe) {
            await this.bot.telegram.sendMessage(client, '🍔 ' + msg);
        }
    }

    private async shutdown() {
        for (const unsubscriber of this.rtUnsubscribers) {
            await unsubscriber;
        }

        await this.bot.stop();
    }
}
