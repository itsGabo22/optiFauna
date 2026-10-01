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
exports.ReproductionController = void 0;
const common_1 = require("@nestjs/common");
const reproduction_service_1 = require("./reproduction.service");
const insemination_dto_1 = require("./dto/insemination.dto");
const pregnancy_check_dto_1 = require("./dto/pregnancy-check.dto");
const birth_dto_1 = require("./dto/birth.dto");
let ReproductionController = class ReproductionController {
    constructor(reproductionService) {
        this.reproductionService = reproductionService;
    }
    async logInsemination(inseminationDto) {
        return this.reproductionService.logInsemination(inseminationDto);
    }
    async logPregnancyCheck(pregnancyCheckDto) {
        return { message: 'Pregnancy check structurally logged', data: pregnancyCheckDto };
    }
    async logBirth(birthDto) {
        return this.reproductionService.logBirth(birthDto);
    }
};
exports.ReproductionController = ReproductionController;
__decorate([
    (0, common_1.Post)('insemination'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [insemination_dto_1.InseminationDto]),
    __metadata("design:returntype", Promise)
], ReproductionController.prototype, "logInsemination", null);
__decorate([
    (0, common_1.Post)('pregnancy-check'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pregnancy_check_dto_1.PregnancyCheckDto]),
    __metadata("design:returntype", Promise)
], ReproductionController.prototype, "logPregnancyCheck", null);
__decorate([
    (0, common_1.Post)('birth'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [birth_dto_1.BirthDto]),
    __metadata("design:returntype", Promise)
], ReproductionController.prototype, "logBirth", null);
exports.ReproductionController = ReproductionController = __decorate([
    (0, common_1.Controller)('reproduction'),
    __metadata("design:paramtypes", [reproduction_service_1.ReproductionService])
], ReproductionController);
//# sourceMappingURL=reproduction.controller.js.map