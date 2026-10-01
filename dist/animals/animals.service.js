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
exports.AnimalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const animal_entity_1 = require("./entities/animal.entity");
let AnimalsService = class AnimalsService {
    constructor(animalRepository) {
        this.animalRepository = animalRepository;
    }
    async createAnimal(createAnimalDto) {
        const animal = this.animalRepository.create(createAnimalDto);
        return this.animalRepository.save(animal);
    }
    async getAnimals(farmId, page = 1) {
        const limit = 10;
        const [data, total] = await this.animalRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
    async findByTagId(tagId) {
        const animal = await this.animalRepository.findOne({ where: { tagId } });
        if (!animal) {
            throw new common_1.NotFoundException(`Animal with tagId ${tagId} not found`);
        }
        return animal;
    }
    async updateAnimalData(tagId, updateAnimalDto) {
        const animal = await this.findByTagId(tagId);
        Object.assign(animal, updateAnimalDto);
        return this.animalRepository.save(animal);
    }
};
exports.AnimalsService = AnimalsService;
exports.AnimalsService = AnimalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(animal_entity_1.Animal)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnimalsService);
//# sourceMappingURL=animals.service.js.map