"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var inversify_1 = require("inversify");
var W1_FILE = '/sys/bus/w1/devices/w1_bus_master1/w1_master_slaves';
var TempSensorService = /** @class */ (function () {
    function TempSensorService() {
        this.parsers = {
            'hex': TempSensorService_1.parseHexData,
            'decimal': TempSensorService_1.parseDecimalData,
            'default': TempSensorService_1.parseDecimalData
        };
    }
    TempSensorService_1 = TempSensorService;
    TempSensorService.parseHexData = function (data) {
        var arr = data.split(' ');
        if (arr[1].charAt(0) === 'f') {
            var x = parseInt('0xffff' + arr[1].toString() + arr[0].toString(), 16);
            return (-((~x + 1) * 0.0625));
        }
        else if (arr[1].charAt(0) === '0') {
            return parseInt('0x0000' + arr[1].toString() + arr[0].toString(), 16) * 0.0625;
        }
        throw new Error('Cannot parse data');
    };
    TempSensorService.parseDecimalData = function (data) {
        var arr = data.split('\n');
        if (arr[0].indexOf('YES') > -1) {
            var output = data.match(/t=(-?(\d+))/);
            if (output && output.length > 1) {
                var outputNum = Number(output[1]);
                return Math.round(outputNum / 100) / 10;
            }
            else {
                throw new Error('Cannot parse result');
            }
        }
        else if (arr[0].indexOf('NO') > -1) {
            return undefined;
        }
        throw new Error('Cannot get temperature');
    };
    TempSensorService.prototype.parseData = function (data, options) {
        var parser = (options ? options.parser : undefined) || 'default';
        if (!this.parsers[parser]) {
            parser = 'default';
        }
        return this.parsers[parser](data);
    };
    TempSensorService.prototype.getTemperatureSync = function (sensor, options) {
        var data = fs.readFileSync('/sys/bus/w1/devices/' + sensor + '/w1_slave', 'utf8');
        return this.parseData(data, options);
    };
    ;
    TempSensorService.prototype.getSensors = function () {
        return new Promise(function (resolve, reject) {
            fs.readFile(W1_FILE, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                var parts = data.split('\n');
                parts.pop();
                resolve(parts);
            });
        });
    };
    TempSensorService.prototype.getTemperature = function (sensor, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs.readFile('/sys/bus/w1/devices/' + sensor + '/w1_slave', 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                var result;
                try {
                    result = _this.parseData(data, options);
                }
                catch (e) {
                    reject(new Error('Cannot read temperature for sensor ' + sensor));
                    return;
                }
                if (result === undefined || result === null) {
                    reject(new Error('Cannot read temperature for sensor ' + sensor));
                    return;
                }
                resolve(result);
            });
        });
    };
    ;
    TempSensorService = TempSensorService_1 = __decorate([
        inversify_1.injectable()
    ], TempSensorService);
    return TempSensorService;
    var TempSensorService_1;
}());
exports.TempSensorService = TempSensorService;
