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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmsController = void 0;
const common_1 = require("@nestjs/common");
const farms_service_1 = require("./farms.service");
const create_farm_dto_1 = require("./dto/create-farm.dto");
const assign_worker_dto_1 = require("./dto/assign-worker.dto");
let FarmsController = class FarmsController {
    constructor(farmsService) {
        this.farmsService = farmsService;
    }
    async createFarm(createFarmDto) {
        return this.farmsService.createFarm(createFarmDto);
    }
    async assignWorker(farmId, assignWorkerDto) {
        return this.farmsService.assignWorker(farmId, assignWorkerDto.userId);
    }
};
exports.FarmsController = FarmsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_farm_dto_1.CreateFarmDto]),
    __metadata("design:returntype", Promise)
], FarmsController.prototype, "createFarm", null);
__decorate([
    (0, common_1.Post)(':id/workers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_worker_dto_1.AssignWorkerDto]),
    __metadata("design:returntype", Promise)
], FarmsController.prototype, "assignWorker", null);
exports.FarmsController = FarmsController = __decorate([
    (0, common_1.Controller)('farms'),
    __metadata("design:paramtypes", [farms_service_1.FarmsService])
], FarmsController);
//# sourceMappingURL=farms.controller.js.map