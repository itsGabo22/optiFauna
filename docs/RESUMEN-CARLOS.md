# Resumen de Implementacion — Modulos `Farms` y `Finance` (Carlos)

Documento de entrega tecnica para revision de Pull Requests e integracion en `OptiFauna` (`itsGabo22/optiFauna`). Resume todo lo realizado en los modulos asignados a Carlos (**Tareas K1, K2 y K3** del `README.md`), las decisiones tecnicas, contratos con otros modulos, commits por rama y verificaciones realizadas.

---

## 1. Estado de ramas en GitHub

Todo el trabajo se realizo en ramas independientes por modulo, siguiendo `README.md` y `docs/FLUJO-GITHUB.md`, y ya fue **rebaseado sin conflictos** sobre el ultimo `origin/main` (`b645e6f`, que ya contiene `AnimalsModule`, `HealthModule`, `ReproductionModule`, `NutritionModule` y `docs/FLUJO-GITHUB.md`):

| Rama | Base | Commits | Alcance | Estado |
| :--- | :--- | :---: | :--- | :--- |
| `feature/farms` | `origin/main` (`b645e6f`) | 7 | Solo `src/farms/` | Subida en `origin/feature/farms`, lista para PR a `main` |
| `feature/finance` | `origin/main` (`b645e6f`) | 10 | Solo `src/finance/` | Subida en `origin/feature/finance`, lista para PR a `main` |
| `docs/resumen-carlos` | `origin/main` (`b645e6f`) | 1 | Solo `docs/RESUMEN-CARLOS.md` | Subida en `origin/docs/resumen-carlos` (rama aparte para no contaminar los PRs de codigo) |

---

## 2. Reglas del equipo aplicadas

- **Aislamiento de archivos:** en `feature/farms` solo se modificaron/crearon archivos dentro de `src/farms/`; en `feature/finance` solo dentro de `src/finance/`. No se toco `src/app.module.ts`, `src/main.ts`, `package.json`, `package-lock.json` ni modulos de Gabo o Cristian.
- **Cero comentarios en codigo:** todos los archivos `.ts` de `src/farms/` y `src/finance/` quedaron sin comentarios (`//` ni `/*`), con la documentacion concentrada en `src/farms/README.md`, `src/finance/README.md` y este documento.
- **DTOs validados:** sin clases DTO vacias (`roi-request.dto.ts` fue eliminado) y con decoradores de `class-validator` compatibles con el `ValidationPipe` global (`transform: true`, `whitelist: true` en `src/main.ts`).
- **Sin `Promise<any>`:** todas las respuestas calculadas usan interfaces dedicadas en `interfaces/`.
- **PostgreSQL y fechas:** los campos `decimal` devueltos como `string` por Postgres se convierten siempre con `Number(...)`; el manejo de rangos de fechas usa las utilidades UTC de `src/common/utils/date.utils.ts` (`todayIso`, `addDays`, `toIsoDate`).
- **Relaciones TypeORM:** se uso siempre sintaxis de objeto (`relations: { workers: true }`, `relations: { animal: true }`) requerida por la version de TypeORM del proyecto.

---

## 3. Modulo de Fincas (`src/farms/` — rama `feature/farms`, Tarea K1)

### 3.1 Commits atomicos (7 commits)

| Hash | Mensaje | Que incluye |
| :--- | :--- | :--- |
| `fdc491f` | `style(farms): formatear archivos base con prettier` | Formato Prettier previo en archivos existentes de `src/farms/` para separar estilo de logica |
| `a148698` | `feat(farms): agregar Animal en FarmsModule e interfaces de respuesta` | Agrega `Animal` a `TypeOrmModule.forFeature` y crea `FarmDetails` / `RemovedWorkerResult` |
| `98fc445` | `feat(farms): agregar endpoints GET /farms y GET /farms/:id` | Listado filtrable por `ownerId` y detalle con `workers` + `animalsCount` |
| `d1fde54` | `feat(farms): agregar UpdateFarmDto y endpoint PUT /farms/:id` | DTO de actualizacion sin `ownerId` y actualizacion segura de datos basicos |
| `35164d0` | `feat(farms): evitar trabajadores duplicados en assignWorker` | Actualiza el `role` si `farmId + userId` ya existe y protege al ultimo `OWNER` |
| `626d653` | `feat(farms): agregar endpoints GET y DELETE de trabajadores` | Lista trabajadores de una finca y permite desvincularlos por `id` o `userId` |
| `c93ac93` | `docs(farms): documentar modulo de fincas en README` | Documentacion completa en `src/farms/README.md` con ejemplos JSON |

### 3.2 Archivos tocados en `src/farms/`

- `M src/farms/farms.module.ts`
- `M src/farms/farms.controller.ts`
- `M src/farms/farms.service.ts`
- `A src/farms/dto/update-farm.dto.ts`
- `A src/farms/interfaces/farm-details.interface.ts`
- `A src/farms/README.md`

### 3.3 Detalle funcional y tecnico

1. **Conteo de animales sin dependencia circular (`farms.module.ts`):**
   - Se registro `Animal` en `TypeOrmModule.forFeature([Farm, FarmWorker, Animal])` sin importar `AnimalsModule` (siguiendo el orden `Farms -> Animals -> ... -> Finance` del `README.md`).
2. **Consultas de fincas (`GET /farms`, `GET /farms/:id`):**
   - `GET /farms` acepta query opcional `?ownerId=` y ordena por `createdAt DESC`.
   - `GET /farms/:id` carga la finca con `relations: { workers: true }`, lanza `404 NotFoundException` si no existe, cuenta sus animales en `animalRepository.count({ where: { farmId: id } })` y retorna `FarmDetails` (`{ ...farm, animalsCount }`).
3. **Actualizacion controlada (`PUT /farms/:id` y `UpdateFarmDto`):**
   - `UpdateFarmDto` expone unicamente `name?`, `location?` y `sizeHectares?` (`@IsNumber()`, `@Min(0)`).
   - Se excluyo intencionalmente `ownerId` para que el `ValidationPipe` (`whitelist: true`) descarte intentos de cambiar el propietario inicial por esta ruta.
4. **Gestion de trabajadores y proteccion del ultimo `OWNER`:**
   - `POST /farms/:id/workers` (`assignWorker`): verifica que la finca exista (`404`); si ya existe un registro `FarmWorker` para `(farmId, userId)`, actualiza `role` en lugar de duplicar la fila. Si el trabajador ya era `OWNER` y se intenta cambiar a otro rol, valida con `ensureAnotherOwnerExists` que quede al menos otro `OWNER` (si no, `400 BadRequestException`). Si es nuevo y no se envia rol, queda como `WorkerRole.OPERATOR`.
   - `GET /farms/:id/workers`: verifica existencia de la finca (`404`) y retorna los trabajadores ordenados por `assignedAt ASC`.
   - `DELETE /farms/:id/workers/:workerId`: verifica existencia de la finca (`404`); busca primero por `id` de `farm_workers` (si el parametro es UUID valido) y hace fallback por `userId` dentro de esa finca. Si no existe → `404`. Si tiene rol `OWNER` y es el ultimo propietario de esa finca → `400 BadRequestException ('Cannot remove or downgrade the last OWNER of the farm')`. Elimina solo la relacion `FarmWorker` (no el usuario) y retorna `RemovedWorkerResult` (`{ deleted: true, id, farmId, userId }`).

---

## 4. Modulo de Finanzas (`src/finance/` — rama `feature/finance`, Tareas K2 y K3)

### 4.1 Commits atomicos (10 commits)

| Hash | Mensaje | Que incluye |
| :--- | :--- | :--- |
| `0b608aa` | `style(finance): formatear archivos base con prettier` | Formato Prettier previo en archivos existentes de `src/finance/` |
| `d56f71e` | `feat(finance): completar YieldDto y agregar ruta POST /finance/milk` | DTO completo de leche, calculo `liters * pricePerLiter`, `registerMilkProduction` y alias `/finance/yields` |
| `4342d76` | `feat(finance): completar ExpenseDto con enum y calculo de monto` | Validacion `@IsEnum(FinanceCategory)`, campos opcionales completos y calculo automatico `quantity * unitPrice` |
| `15e65e3` | `chore(finance): eliminar RoiRequestDto vacio` | Eliminacion de `src/finance/dto/roi-request.dto.ts` (vacio y sin uso) |
| `f0b19d1` | `feat(finance): agregar AnimalSaleDto y POST /finance/animal-sales` | Registro contable de venta de animal (`YIELD` + `ANIMAL_SALE`) |
| `510291a` | `feat(finance): importar NutritionModule e interfaces de reportes` | Importacion de `NutritionModule` y definicion de interfaces en `finance-reports.interface.ts` |
| `e8778d6` | `feat(finance): implementar endpoint GET /finance/cost-per-liter/:animalId` | Indicador de costo por litro, precio promedio y margen con costo de alimentacion |
| `9154e49` | `feat(finance): implementar endpoint GET /finance/summary por finca` | Resumen financiero por finca con respaldo por `animal.farmId` y totales por categoria |
| `3cd6371` | `feat(finance): integrar alimentacion y fechas en ROI de animal` | Soporte de `from`/`to`, suma de `feedCost` y retorno tipado `AnimalProfitabilityReport` |
| `e66a639` | `docs(finance): documentar modulo de finanzas en README` | Documentacion completa en `src/finance/README.md` con ejemplos JSON |

### 4.2 Archivos tocados en `src/finance/`

- `M src/finance/finance.module.ts`
- `M src/finance/finance.controller.ts`
- `M src/finance/finance.service.ts`
- `M src/finance/dto/yield.dto.ts`
- `M src/finance/dto/expense.dto.ts`
- `A src/finance/dto/animal-sale.dto.ts`
- `D src/finance/dto/roi-request.dto.ts`
- `A src/finance/interfaces/finance-reports.interface.ts`
- `A src/finance/README.md`

### 4.3 Detalle funcional y tecnico

1. **Produccion / venta de leche (`POST /finance/milk` y alias `POST /finance/yields`):**
   - `YieldDto` valida `animalId`, `date` (`YYYY-MM-DD`), `liters` (`>= 0`), `pricePerLiter` (`>= 0`), y opcionales `farmId?` y `description?`.
   - `registerMilkProduction` calcula `amount = round2(liters * pricePerLiter)` y guarda `recordType: YIELD`, `category: MILK_SALE`, `quantity: liters`, `unitPrice: pricePerLiter`. Se conservo `POST /finance/yields` apuntando al mismo metodo para compatibilidad.
2. **Gastos operativos (`POST /finance/expenses`):**
   - `ExpenseDto` valida `category` con `@IsEnum(FinanceCategory)` (nota: en la entidad `FinanceCategory.VETERINARY = 'VETERINARIAN'`), `date`, y opcionales `amount?`, `farmId?`, `animalId?`, `quantity?`, `unitPrice?`, `description?`, `receiptNumber?`.
   - Si no viene `amount`, pero si vienen `quantity` y `unitPrice`, `registerExpense` calcula `round2(quantity * unitPrice)`. Si faltan tanto `amount` como el par `(quantity, unitPrice)`, lanza `400 BadRequestException ('Either amount or both quantity and unitPrice are required')`. Persiste todos los campos recibidos.
3. **Venta economica de animal (`POST /finance/animal-sales`):**
   - `AnimalSaleDto` recibe `animalId`, `date`, `amount` (`>= 0`), `farmId?`, `buyer?`, `receiptNumber?`.
   - `registerAnimalSale` guarda `recordType: YIELD` y `category: ANIMAL_SALE` (agregando el comprador en `description` si viene). **No modifica `Animal.status`** (el cliente/frontend debe invocar tambien `PATCH /animals/:tagId/status` en `AnimalsModule`).
4. **Calculo de costo por litro de leche (`GET /finance/cost-per-liter/:animalId?from=&to=`):**
   - Ventana de fechas con `resolvePeriod(from, to)`: por defecto ultimos 30 dias (`from = addDays(to, -29)`, `to = todayIso()`). Lanza `400 BadRequestException` si `from > to`.
   - Consulta en paralelo (`Promise.all`) los registros `finance_records` del animal en el rango `Between(period.from, period.to)` y `nutritionService.getFeedCostForAnimal(animalId, period.from, period.to)`.
   - Agrega:
     - `litersProduced` = suma de `Number(quantity)` en registros `YIELD` + `MILK_SALE`.
     - `milkIncome` = suma de `Number(amount)` en registros `YIELD` + `MILK_SALE`.
     - `directExpenses` = suma de `Number(amount)` en registros `EXPENSE` del animal.
     - `feedCost` = `round2(feedReport.periodFeedCost)`.
     - `totalCost = round2(directExpenses + feedCost)`.
   - Si `litersProduced > 0`: calcula `costPerLiter = totalCost / litersProduced`, `averagePricePerLiter = milkIncome / litersProduced` y `marginPerLiter = averagePricePerLiter - costPerLiter` (a 2 decimales). Si `litersProduced === 0`, los tres campos retornan `null` (sin division por cero).
5. **Resumen financiero por finca (`GET /finance/summary?farmId=&from=&to=`):**
   - `farmId` obligatorio (`400 BadRequestException` si falta o llega vacio).
   - Incluye tanto registros con `farmId` directo como registros registrados solo a un animal (`farmId: IsNull()`) cuyo animal pertenezca a la finca (`animal: { farmId }`) mediante `relations: { animal: true }`.
   - Devuelve `totalIncome`, `totalExpenses`, `netResult`, desgloses `incomeByCategory` / `expensesByCategory` (`{ category, total, count }`) y `litersProduced`.
6. **Rentabilidad / ROI por animal (`GET /finance/roi/:animalId?from=&to=`):**
   - Acepta `from`/`to` opcionales (misma ventana por defecto de 30 dias).
   - Suma `feedCost` obtenido desde `NutritionService` a `directExpenses` para calcular `totalExpense` y `netProfit = totalYield - totalExpense`.
   - Reemplaza el retorno anterior `Promise<any>` por `Promise<AnimalProfitabilityReport>`, con `roiPercentage` formateado como porcentaje (`((netProfit / totalExpense) * 100).toFixed(2) + '%'` o `'100.00%'` si `totalExpense === 0 && totalYield > 0`, o `'0.00%'` si no hay movimientos).

---

## 5. Integraciones entre modulos y contratos

| Origen / Destino | Mecanismo | Detalle importante |
| :--- | :--- | :--- |
| `NutritionModule` → `FinanceModule` | Importacion de `NutritionModule` e inyeccion de `NutritionService` | `FinanceService` usa `getFeedCostForAnimal(animalId, from, to).periodFeedCost` en `cost-per-liter` y `roi`. |
| `AnimalsModule` ↔ `FarmsModule` | Repositorio directo `Animal` en `FarmsModule` | Permitido por el contrato del `README.md` para calcular `animalsCount` en `GET /farms/:id` sin dependencia circular. |
| `AnimalsModule` ↔ `FinanceModule` | Relacion `FinanceRecord.animal` (`animal.farmId`) | Permite a `GET /finance/summary` sumar gastos/ingresos ligados al animal incluso si `FinanceRecord.farmId` llego nulo. |
| **Venta de animal (Frontend)** | Flujo combinado Finanzas + Animales | Al vender un animal, el cliente debe llamar a `POST /finance/animal-sales` **y** a `PATCH /animals/:tagId/status` (`{ status: "SOLD", date, reason? }`) de Gabo para mantener la trazabilidad ICA. |

---

## 6. Verificaciones ejecutadas (post-rebase sobre `origin/main` `b645e6f`)

- **`npm.cmd run build` (`nest build`):** exitoso (exit `0`) tanto en `feature/farms` como en `feature/finance`.
- **ESLint en modulos propios:**
  - En `feature/farms`: `npx.cmd eslint "src/farms/**/*.ts"` → **0 errores** (exit `0`). Al ejecutar ESLint global sobre toda la rama aislada `feature/farms`, los unicos 4 errores reportados corresponden a los archivos base sin tocar de `src/finance/` antes del PR de finanzas.
  - En `feature/finance`: `npx.cmd eslint "src/finance/**/*.ts"` → **0 errores** (exit `0`). Al ejecutar ESLint global sobre toda la rama aislada `feature/finance`, el unico error reportado corresponde al archivo base sin tocar `src/farms/farms.service.ts:35:22` antes del PR de fincas.
  - **Resultado integrado:** una vez aprobados e integrados ambos PRs en `main`, todo el backend queda compilando y pasando `npm run lint` global con **0 errores**.
- **Cero comentarios en TypeScript:** verificacion de patrones `//` y `/*` en `src/farms/**/*.ts` y `src/finance/**/*.ts` → **0 coincidencias** en ambas ramas.
- **Pruebas unitarias con mocks (previas al rebase, mismo codigo de `farms` y `finance`):** validaron `ValidationPipe` (incluyendo stripping de `ownerId` en `UpdateFarmDto`), dedup/proteccion de `OWNER`, calculo automatico de gastos, integracion real con `NutritionService.getFeedCostForAnimal`, manejo de cero litros en `cost-per-liter` y resumen mixto por finca (`farmId` directo y `animal.farmId`).
- **Pendiente para aprobacion final en PR:** levantar `npm run start:dev` conectado a PostgreSQL real y probar cada endpoint con Postman/Thunder Client segun el checklist de la seccion 7 del `README.md`.

---

## 7. Plantilla rapida para abrir los 2 Pull Requests en GitHub

### PR 1 — `feature/farms` → `main`

- **Titulo:** `feat(farms): consultas, actualizacion y gestion completa de trabajadores`
- **Checklist:**

```markdown
- [x] Mi rama está rebasada sobre `origin/main` actualizado (`b645e6f`).
- [x] `npm run build` pasa sin errores.
- [x] `npx eslint "src/farms/**/*.ts"` pasa sin errores (4 errores globales restantes pertenecen al base de `src/finance/` cubiertos en PR 2).
- [ ] Levanté la API con `npm run start:dev` y probé cada endpoint nuevo con Postman/Thunder Client (en validación con PostgreSQL).
- [x] Cada commit es atómico y sigue el formato `tipo(modulo): descripción`.
- [x] No toqué archivos fuera de mis módulos (`src/farms/` unicamente).
- [x] Ningún DTO quedó vacío; todos los campos tienen decoradores de validación.
- [x] Ningún método nuevo devuelve `Promise<any>`.
- [x] El `README.md` del módulo está actualizado con los endpoints nuevos (`src/farms/README.md`).
- [x] No commiteé `dist/`, `.env` ni `node_modules/`.
```

### PR 2 — `feature/finance` → `main`

- **Titulo:** `feat(finance): DTOs completos, venta de animales, costo por litro, summary y ROI`
- **Checklist:**

```markdown
- [x] Mi rama está rebasada sobre `origin/main` actualizado (`b645e6f`).
- [x] `npm run build` pasa sin errores.
- [x] `npx eslint "src/finance/**/*.ts"` pasa sin errores (1 error global restante pertenece al base de `src/farms/farms.service.ts` cubierto en PR 1).
- [ ] Levanté la API con `npm run start:dev` y probé cada endpoint nuevo con Postman/Thunder Client (en validación con PostgreSQL).
- [x] Cada commit es atómico y sigue el formato `tipo(modulo): descripción`.
- [x] No toqué archivos fuera de mis módulos (`src/finance/` unicamente).
- [x] Ningún DTO quedó vacío (`roi-request.dto.ts` eliminado); todos los campos tienen decoradores de validación.
- [x] Ningún método nuevo devuelve `Promise<any>`.
- [x] El `README.md` del módulo está actualizado con los endpoints nuevos (`src/finance/README.md`).
- [x] No commiteé `dist/`, `.env` ni `node_modules/`.
```
