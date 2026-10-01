# Módulo de Nutrición (Nutrition Module)

Este módulo se encarga de gestionar toda la información relacionada con la nutrición de los animales en el sistema OptiFauna.

## Estructura del Módulo

- `dto/`: Contiene los Data Transfer Objects (DTOs) utilizados para la transferencia de datos.
  - `diet.dto.ts`: DTO para la gestión de dietas.
  - `inventory.dto.ts`: DTO para la gestión del inventario de alimentos.
- `entities/`: Contiene las entidades que representan las tablas en la base de datos.
  - `nutrition-record.entity.ts`: Entidad para los registros nutricionales.
- `nutrition.controller.ts`: Controlador que define las rutas de la API (endpoints) para este módulo.
- `nutrition.module.ts`: Archivo de definición del módulo para NestJS, donde se importan y declaran controladores y servicios.
- `nutrition.service.ts`: Servicio que contiene la lógica de negocio y se comunica con la base de datos.

## Responsabilidades
- Registro y gestión de dietas.
- Monitoreo de registros nutricionales de los animales.
- Gestión de inventario de alimentos.
