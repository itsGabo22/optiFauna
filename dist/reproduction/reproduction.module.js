"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReproductionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reproduction_service_1 = require("./reproduction.service");
const reproduction_controller_1 = require("./reproduction.controller");
const reproduction_record_entity_1 = require("./entities/reproduction-record.entity");
let ReproductionModule = class ReproductionModule {
};
exports.ReproductionModule = ReproductionModule;
exports.ReproductionModule = ReproductionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([reproduction_record_entity_1.ReproductionRecord])],
        controllers: [reproduction_controller_1.ReproductionController],
        providers: [reproduction_service_1.ReproductionService],
        exports: [reproduction_service_1.ReproductionService],
    })
], ReproductionModule);
//# sourceMappingURL=reproduction.module.js.map