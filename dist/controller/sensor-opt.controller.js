"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_express_utils_1 = require("inversify-express-utils");
var inversify_1 = require("inversify");
var types_1 = require("../constant/types");
var storage_service_1 = require("../service/storage.service");
var StorageSensorOptsKey = 'storage:sensor-opts';
var SensorOptController = /** @class */ (function () {
    function SensorOptController(storageService) {
        this.storageService = storageService;
    }
    SensorOptController.prototype.getSensorOpts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storageService.isConnected];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.storageService.get(StorageSensorOptsKey)];
                    case 2: return [2 /*return*/, (_a.sent()) || []];
                }
            });
        });
    };
    SensorOptController.prototype.getSensorOpt = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var result, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storageService.isConnected];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.storageService.get(StorageSensorOptsKey)];
                    case 2:
                        result = (_a.sent()) || [];
                        item = result.find(function (v) { return v.sensor_id === request.params.id; });
                        if (item) {
                            return [2 /*return*/, item];
                        }
                        else {
                            response.status(404);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SensorOptController.prototype.newSensorOpt = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var result, validated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storageService.isConnected];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.storageService.get(StorageSensorOptsKey)];
                    case 2:
                        result = (_a.sent()) || [];
                        validated = this.getValidatedItemFromBody(request);
                        if (!validated.sensor_id) return [3 /*break*/, 4];
                        result.push(validated);
                        return [4 /*yield*/, this.storageService.set(StorageSensorOptsKey, result)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, validated];
                }
            });
        });
    };
    SensorOptController.prototype.updateSensorOpt = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var result, item, validated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storageService.isConnected];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.storageService.get(StorageSensorOptsKey)];
                    case 2:
                        result = (_a.sent()) || [];
                        item = result.find(function (v) { return v.sensor_id === request.params.id; });
                        if (!item) return [3 /*break*/, 4];
                        validated = this.getValidatedItemFromBody(request);
                        item.sensor_type = validated.sensor_type;
                        return [4 /*yield*/, this.storageService.set(StorageSensorOptsKey, result)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, item];
                    case 4:
                        response.status(404);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SensorOptController.prototype.deleteUser = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var result, item, newResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storageService.isConnected];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.storageService.get(StorageSensorOptsKey)];
                    case 2:
                        result = (_a.sent()) || [];
                        item = result.find(function (v) { return v.sensor_id === request.params.id; });
                        if (!item) return [3 /*break*/, 4];
                        newResult = result.filter(function (i) { return i !== item; });
                        return [4 /*yield*/, this.storageService.set(StorageSensorOptsKey, newResult)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, item];
                    case 4:
                        response.status(404);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SensorOptController.prototype.getValidatedItemFromBody = function (request) {
        var newItem = request.body;
        var validated = {
            sensor_id: newItem.sensor_id,
            sensor_type: newItem.sensor_type
        };
        return validated;
    };
    __decorate([
        inversify_express_utils_1.httpGet('/'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], SensorOptController.prototype, "getSensorOpts", null);
    __decorate([
        inversify_express_utils_1.httpGet('/:id'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], SensorOptController.prototype, "getSensorOpt", null);
    __decorate([
        inversify_express_utils_1.httpPost('/'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], SensorOptController.prototype, "newSensorOpt", null);
    __decorate([
        inversify_express_utils_1.httpPut('/:id'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], SensorOptController.prototype, "updateSensorOpt", null);
    __decorate([
        inversify_express_utils_1.httpDelete('/:id'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], SensorOptController.prototype, "deleteUser", null);
    SensorOptController = __decorate([
        inversify_express_utils_1.controller('/api/sensor/opt'),
        __param(0, inversify_1.inject(types_1.default.StorageService)),
        __metadata("design:paramtypes", [storage_service_1.StorageService])
    ], SensorOptController);
    return SensorOptController;
}());
exports.SensorOptController = SensorOptController;
