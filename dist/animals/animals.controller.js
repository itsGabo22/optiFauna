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
exports.AnimalsController = void 0;
const common_1 = require("@nestjs/common");
const animals_service_1 = require("./animals.service");
const create_animal_dto_1 = require("./dto/create-animal.dto");
const update_animal_dto_1 = require("./dto/update-animal.dto");
let AnimalsController = class AnimalsController {
    constructor(animalsService) {
        this.animalsService = animalsService;
    }
    async createAnimal(createAnimalDto) {
        return this.animalsService.createAnimal(createAnimalDto);
    }
    async getAnimals(farmId, page) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        return this.animalsService.getAnimals(farmId, pageNumber);
    }
    async findByTagId(tagId) {
        return this.animalsService.findByTagId(tagId);
    }
    async updateAnimalData(tagId, updateAnimalDto) {
        return this.animalsService.updateAnimalData(tagId, updateAnimalDto);
    }
};
exports.AnimalsController = AnimalsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_animal_dto_1.CreateAnimalDto]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "createAnimal", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('farmId')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "getAnimals", null);
__decorate([
    (0, common_1.Get)(':tagId'),
    __param(0, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "findByTagId", null);
__decorate([
    (0, common_1.Put)(':tagId'),
    __param(0, (0, common_1.Param)('tagId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_animal_dto_1.UpdateAnimalDto]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "updateAnimalData", null);
exports.AnimalsController = AnimalsController = __decorate([
    (0, common_1.Controller)('animals'),
    __metadata("design:paramtypes", [animals_service_1.AnimalsService])
], AnimalsController);
//# sourceMappingURL=animals.controller.js.map