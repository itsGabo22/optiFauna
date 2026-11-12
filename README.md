# OptiFauna — Backend

Backend en **NestJS + TypeORM + PostgreSQL** de la **Plataforma de Ganadería Inteligente (Pasto, Nariño)**.

El sistema resuelve tres problemas de la ganadería lechera de minifundio en el trópico alto nariñense:

1. **Pérdida de trazabilidad sanitaria y reproductiva** (vacunas, celos, días abiertos, enfermedades).
2. **Desconocimiento del costo real y la rentabilidad por vaca** (costo por litro de leche).
3. **Barreras normativas del ICA** para movilizar ganado y acceder al mercado formal.

Cada animal se identifica por su **`tagId`** (código de la chapeta QR/RFID). Toda la API gira alrededor de ese identificador y del `id` interno (uuid) de cada animal.

---

## Índice

1. [Arranque rápido](#1-arranque-rápido)
2. [Reglas obligatorias para TODO el equipo](#2-reglas-obligatorias-para-todo-el-equipo)
3. [Flujo de Git y commits atómicos](#3-flujo-de-git-y-commits-atómicos)
4. [Convenciones de código](#4-convenciones-de-código)
5. [Reparto de trabajo](#5-reparto-de-trabajo)
   - [Gabo — Animales y Salud](#51-gabo--animalsmodule-y-healthmodule)
   - [Cristian — Reproducción y Nutrición](#52-cristian--reproductionmodule-y-nutritionmodule)
   - [Carlos — Finanzas y Fincas](#53-carlos--financemodule-y-farmsmodule)
6. [Contratos entre módulos](#6-contratos-entre-módulos)
7. [Checklist antes de abrir un Pull Request](#7-checklist-antes-de-abrir-un-pull-request)

---

## 1. Arranque rápido

Requisitos: **Node 22+**, **npm 10+**, **PostgreSQL 14+**.

```bash
git clone https://github.com/itsGabo22/optiFauna.git
cd optiFauna
npm install
cp .env.example .env        # en Windows: copy .env.example .env
```

Crea la base de datos una sola vez (en `psql` o pgAdmin):

```sql
CREATE DATABASE optifauna;
```

Edita `.env` con tu usuario y contraseña de Postgres. Las variables son:

| Variable | Por defecto | Descripción |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | Puerto |
| `DB_USER` | `postgres` | Usuario |
| `DB_PASSWORD` | `postgres` | Contraseña |
| `DB_NAME` | `optifauna` | Nombre de la base de datos |
| `PORT` | `3000` | Puerto HTTP de la API |

Arranca en modo desarrollo:

```bash
npm run start:dev
```

TypeORM tiene `synchronize: true`, así que **las tablas se crean y actualizan solas** a partir de las entidades. No escribas migraciones ni SQL a mano en esta etapa.

Comandos que vas a usar todo el tiempo:

| Comando | Qué hace |
| :--- | :--- |
| `npm run start:dev` | Levanta la API y recarga al guardar |
| `npm run build` | Compila a `dist/`. **Debe pasar sin errores antes de cada commit** |
| `npm run lint` | ESLint + Prettier con autocorrección. **Debe pasar antes de cada commit** |
| `npm run format` | Solo formatea con Prettier |

---

## 2. Reglas obligatorias para TODO el equipo

Estas reglas no son sugerencias. Un PR que las incumpla se devuelve sin revisar.

1. **Solo tocas los archivos de TUS módulos.** Si necesitas algo de otro módulo (un campo, un método, un endpoint), lo pides a su responsable por el chat del equipo y él lo hace en su rama. Las únicas excepciones son las que están escritas en la sección [6. Contratos entre módulos](#6-contratos-entre-módulos).
2. **Nunca trabajas directamente sobre `main`.** Siempre en tu rama de feature (ver sección 3).
3. **Nunca haces `git push --force`** sobre una rama que no sea exclusivamente tuya, y nunca sobre `main`.
4. **Cada commit es atómico**: un cambio lógico, un commit (ver sección 3). Nada de commits llamados "avances", "cambios", "fix" o "update".
5. **`npm run build` y `npm run lint` deben pasar en cada commit**, no solo al final. Si rompes la compilación, el siguiente que haga `git pull` no puede trabajar.
6. **No se commitea** `node_modules/`, `dist/`, `.env`, ni archivos de tu IDE. Ya están en `.gitignore`; no lo edites para quitarlos.
7. **No cambias `package.json`** (no agregas ni quitas dependencias) sin avisar antes en el chat del equipo. Si se aprueba, el cambio va en un commit separado que solo toque `package.json` y `package-lock.json`.
8. **No modificas `src/app.module.ts` ni `src/main.ts`** salvo que tu tarea lo diga explícitamente.
9. **No renombras ni borras campos de las entidades que ya existen.** Otros módulos dependen de ellos. Puedes **agregar** columnas nuevas (siempre `nullable: true` o con `default`) y puedes agregar valores a los enums.
10. **Cada módulo termina con su `README.md`** dentro de `src/<modulo>/`, siguiendo exactamente el formato de [`src/animals/README.md`](src/animals/README.md): responsable, estructura, modelo de datos, tabla de endpoints y detalle de cada endpoint con JSON de ejemplo de petición y respuesta.
11. **La rama `develop` está desactualizada y NO se usa.** La rama de integración es **`main`**. Todo PR apunta a `main`.

---

## 3. Flujo de Git y commits atómicos

### 3.1 Ramas

Una rama por módulo, creada desde `main` actualizado:

```bash
git checkout main
git pull origin main
git checkout -b feature/<modulo>
```

| Responsable | Ramas |
| :--- | :--- |
| Gabo | `feature/animals`, `feature/health` |
| Cristian | `feature/reproduction`, `feature/nutrition` |
| Carlos | `feature/finance`, `feature/farms` |

Si vas a trabajar los dos módulos a la vez puedes usar una sola rama `feature/<tu-nombre>-<modulo1>-<modulo2>`, pero los commits siguen siendo uno por cambio y nunca mezclan los dos módulos en el mismo commit.

Antes de abrir el PR, actualiza tu rama con `main`:

```bash
git fetch origin
git rebase origin/main        # si hay conflictos, resuélvelos y: git rebase --continue
```

### 3.2 Qué es un commit atómico

Un commit atómico contiene **un solo cambio lógico, completo y que compila**. La prueba es simple: si tuvieras que revertir ese commit, debería desaparecer una sola cosa y el proyecto seguir funcionando.

**Correcto** (tarea "registrar celos" en Reproducción):

```
feat(reproduction): agregar HeatDto para registro de celos
feat(reproduction): endpoint POST /reproduction/heat
docs(reproduction): documentar endpoint de celos en README
```

**Incorrecto:**

```
avances reproduccion          <- no dice qué cambió
feat: celos, dias abiertos y arreglo de nutrición   <- tres cambios en uno, y mezcla módulos
fix                           <- nada
```

Reglas concretas:

- Un commit **no mezcla dos módulos**.
- Un commit **no mezcla una funcionalidad nueva con un formateo masivo**. Si Prettier te reformatea archivos que no tocaste, haz primero un commit `style(<modulo>): formatear con prettier` y luego el tuyo.
- Si una tarea del reparto tiene 4 pasos, son al menos 4 commits (DTO, entidad, servicio+controlador, README), no uno.
- Un commit que agrega un endpoint incluye su DTO **si el DTO solo lo usa ese endpoint**; si el DTO se comparte, va en su propio commit.
- El README del módulo se commitea aparte del código (`docs(...)`).

### 3.3 Formato del mensaje de commit

Usamos **Conventional Commits** en español:

```
<tipo>(<modulo>): <qué cambia, en imperativo, máx. 72 caracteres>

<opcional: por qué se hace el cambio, qué problema resuelve>
```

| Tipo | Cuándo |
| :--- | :--- |
| `feat` | Funcionalidad nueva (endpoint, campo, cálculo) |
| `fix` | Corrección de un error |
| `refactor` | Cambio interno sin alterar comportamiento |
| `docs` | README o comentarios |
| `style` | Solo formato (Prettier), sin cambios de lógica |
| `test` | Pruebas |
| `chore` | Configuración, dependencias, scripts |

El `<modulo>` es uno de: `animals`, `health`, `reproduction`, `nutrition`, `finance`, `farms`, `deps`, `config`.

Ejemplos reales de este repositorio:

```
fix(deps): restaurar dependencias de NestJS en package.json
chore: dejar de versionar la carpeta dist
feat(reproduction): calcular días abiertos por animal
```

### 3.4 Pull Requests

- Título: igual que un commit (`feat(health): alertas de vacunas próximas a vencer`).
- Descripción: lista de endpoints o cambios, y cómo probarlos (una petición de ejemplo por endpoint).
- Un PR por módulo o por tarea grande. **No** un PR gigante al final.
- Lo revisa **otro integrante** antes del merge. Nadie mergea su propio PR.
- Se mergea con **"Squash and merge" desactivado** (merge commit normal) para conservar los commits atómicos.

---

## 4. Convenciones de código

Sigue lo que ya existe en el proyecto. Si tienes dudas, copia la forma de `src/animals/`.

### Estructura de cada módulo

```text
src/<modulo>/
├── dto/                  # Un archivo por DTO: <nombre>.dto.ts
├── entities/             # Un archivo por entidad: <nombre>.entity.ts
├── <modulo>.controller.ts
├── <modulo>.module.ts
├── <modulo>.service.ts
└── README.md
```

### DTOs

- Todo lo que entra por `@Body()` es un DTO con decoradores de `class-validator`. El `ValidationPipe` global tiene `whitelist: true`: **cualquier campo sin decorador se descarta en silencio**, así que si "no llega" un campo, revisa el DTO.
- Campos obligatorios: `@IsNotEmpty()` + el decorador de tipo (`@IsString()`, `@IsNumber()`, `@IsDateString()`).
- Campos opcionales: `@IsOptional()` + el decorador de tipo, y el nombre con `?`.
- Si el campo corresponde a un enum de la entidad, usa `@IsEnum(MiEnum)` e importa el enum desde la entidad. **No** recibas enums como `string`.
- Fechas: siempre `string` en formato `YYYY-MM-DD` con `@IsDateString()`. Las columnas de fecha en las entidades son `type: 'date'` y también se tipan como `string`.
- Números: `@IsNumber()`. Si debe ser positivo, agrega `@Min(0)` o `@IsPositive()`.
- Prohibido `export class AlgoDto {}` vacío. Si un DTO no se usa, se borra.

### Entidades

- `@PrimaryGeneratedColumn('uuid') id: string;`
- Relaciones: columna explícita `xxxId` + `@ManyToOne` + `@JoinColumn({ name: 'xxxId' })`, como ya está en todas las entidades.
- Dinero y pesos: `type: 'decimal'`. **Postgres devuelve los `decimal` como `string`**; cuando los sumes o multipliques usa siempre `Number(valor)`.
- Columnas nuevas sobre tablas existentes: `nullable: true` o `default`.
- `createdAt` y `updatedAt` con `@CreateDateColumn()` / `@UpdateDateColumn()` en todas las entidades.

### Servicios y controladores

- La lógica va en el servicio. El controlador solo recibe, valida y delega.
- Si no se encuentra un recurso: `throw new NotFoundException('Animal with id X not found')`.
- Si la operación no es válida (p. ej. stock insuficiente): `throw new BadRequestException('mensaje claro')`.
- Los métodos que devuelven cálculos **no devuelven `Promise<any>`**: define una `interface` o `type` en el mismo archivo del servicio (o en `dto/`) con la forma exacta de la respuesta.
- Rutas en inglés, en minúsculas y kebab-case: `/reproduction/open-days/:animalId`, no `/reproduccion/diasAbiertos`.
- Filtros opcionales por query string: `@Query('farmId') farmId?: string`.
- Para listar: ordena siempre por fecha descendente (`order: { date: 'DESC' }`).

### Mensajes y nombres

- Código, rutas, nombres de campos y mensajes de error: **en inglés**.
- README, commits y comentarios del equipo: **en español**.

---

## 5. Reparto de trabajo

Cada tarea indica los archivos que puedes tocar, qué debe quedar funcionando y en cuántos commits mínimos se divide. El orden de las tareas es el orden en que debes hacerlas. **No empieces una tarea sin terminar y commitear la anterior.**

Estado del código al momento de escribir esto (rama `main`):

| Módulo | Entidades | Endpoints | README | Estado |
| :--- | :---: | :---: | :---: | :--- |
| Animals | ✅ | 4 | ✅ | Base lista, faltan filtros y bajas |
| Health | ✅ | 3 | ❌ | DTOs incompletos, reporte ICA es un placeholder |
| Reproduction | ✅ | 4 | ❌ | Faltan celos, días abiertos y alertas |
| Nutrition | ✅ | 3 | ❌ | `InventoryDto` vacío, sin costo por animal |
| Finance | ✅ | 3 | ❌ | DTOs incompletos, sin costo por litro |
| Farms | ✅ | 2 | ❌ | Sin consultas ni actualización |

---

### 5.1 Gabo — `AnimalsModule` y `HealthModule`

Archivos permitidos: todo lo que está dentro de `src/animals/` y `src/health/`. Nada más.

#### Tarea G1 — Filtros y baja de animales (`src/animals/`)

**Objetivo:** que el ganadero pueda ver solo sus vacas activas, solo hembras, etc., y dar de baja un animal sin borrarlo (la trazabilidad del ICA exige conservar el historial).

1. En `animals.controller.ts` y `animals.service.ts`, el `GET /animals` acepta además de `farmId` y `page` los filtros opcionales `status` (`AnimalStatus`), `sex` (`AnimalSex`) y `species` (string). Crea `dto/query-animals.dto.ts` con esos campos (todos `@IsOptional()`), y recibe el DTO con `@Query()`.
   - Si no se envía `status`, por defecto se devuelven **solo** animales `ACTIVE`. Para ver todos hay que mandar `status=ALL` (acéptalo como string especial).
   - `page` debe transformarse a número (`@Type(() => Number)` de `class-transformer` + `@IsInt()` + `@Min(1)`).
2. Nuevo endpoint `PATCH /animals/:tagId/status` con `dto/change-status.dto.ts`: campos `status` (`@IsEnum(AnimalStatus)`, obligatorio, **no** puede ser `ACTIVE`), `date` (`@IsDateString()`) y `reason` (`@IsString()`, opcional). Agrega a la entidad `Animal` dos columnas nuevas `nullable: true`: `statusChangedAt: string` (`type: 'date'`) y `statusReason?: string`. El servicio cambia el estado y guarda ambas.
3. Nuevo endpoint `GET /animals/:tagId/offspring`: devuelve los animales cuyo `motherId` **o** `fatherId` sea el `id` del animal consultado. Si el `tagId` no existe → 404.
4. Actualiza `src/animals/README.md` con los nuevos campos de la entidad y los tres endpoints.

Commits mínimos: 5 (`feat` filtros, `feat` columnas de estado en entidad, `feat` endpoint de estado, `feat` endpoint offspring, `docs`).

#### Tarea G2 — DTOs completos de salud (`src/health/dto/`)

**Objetivo:** que un evento sanitario guarde todo lo que el ICA y el veterinario necesitan.

1. `vaccine.dto.ts`: agrega opcionales `farmId`, `nextDueDate` (`@IsDateString()`), `veterinarian`, `dosage`, `cost` (`@IsNumber()`, `@Min(0)`) y `description`. Mantén `animalId` y `batchId` como están. En el servicio, **al menos uno de los dos** (`animalId` o `batchId`) debe venir; si no, `BadRequestException`.
2. `treatment.dto.ts`: agrega opcionales `farmId`, `medication` (el fármaco; `treatmentName` sigue siendo el nombre del tratamiento), `dosage`, `veterinarian`, `cost`, `nextDueDate`, `description`.
3. Borra `ica-report.dto.ts` (está vacío). El reporte se pide por query string, no por body.
4. Nuevo `dto/deworming.dto.ts` y endpoint `POST /health/dewormings` que guarda un `HealthRecord` con `type: DEWORMING`. Campos: `animalId` (obligatorio), `date`, `medication`, `dosage`, `nextDueDate`, `cost`, `veterinarian`.
5. Los tres métodos de registro deben persistir en la entidad **todos** los campos que reciben (hoy `cost`, `veterinarian`, `dosage`, `nextDueDate` y `farmId` se ignoran).

Commits mínimos: 4.

#### Tarea G3 — Historial y alertas sanitarias (`src/health/`)

**Objetivo:** responder "¿qué le han puesto a esta vaca?" y "¿qué se vence esta semana?".

1. `GET /health/animal/:animalId`: historial completo del animal ordenado por `date DESC`. Acepta `?type=VACCINE|TREATMENT|DEWORMING|CHECKUP` opcional.
2. `GET /health/upcoming?farmId=&days=30`: registros cuyo `nextDueDate` esté entre hoy y hoy + `days` (por defecto 30), ordenados por `nextDueDate ASC`. Devuelve también los que ya estén **vencidos** (`nextDueDate < hoy`) marcados con `overdue: true`. Define la interface `UpcomingHealthEvent` con: `recordId`, `animalId`, `type`, `title`, `nextDueDate`, `daysRemaining` (negativo si vencido), `overdue`.
   - Para filtrar por finca usa `farmId` del `HealthRecord`. Si es `null`, usa la relación `animal.farmId` (`relations: ['animal']`).

Commits mínimos: 2 + `docs`.

#### Tarea G4 — Reporte ICA real (`src/health/health.service.ts`)

**Objetivo:** reemplazar el placeholder (`reportUrl` falso) por un resumen que sirva para la visita del ICA.

1. Importa `AnimalsModule` en `health.module.ts` (ya exporta `AnimalsService`). Agrega en `AnimalsService` un método `countByFarm(farmId: string, status = AnimalStatus.ACTIVE): Promise<number>` y otro `findByFarm(farmId: string): Promise<Animal[]>`. Son los únicos cambios permitidos en Animals desde Health, y son tuyos de todos modos.
2. `GET /health/reports/ica?farmId=&from=&to=`: `farmId` **obligatorio** (si falta → `BadRequestException`). `from`/`to` opcionales, por defecto últimos 12 meses. Devuelve la interface `IcaReport`:
   - `farmId`, `period: { from, to }`, `generatedAt`
   - `totalAnimals` (activos de la finca)
   - `vaccinations: { total, byVaccine: Array<{ vaccineName, count, animalsCovered }>, coveragePercentage }` donde `coveragePercentage = animales distintos vacunados / totalAnimals * 100`
   - `treatments: { total, byMedication: Array<{ medication, count }> }`
   - `dewormings: { total }`
   - `pendingEvents`: reutiliza la lógica de `GET /health/upcoming` con `days = 30`
   - `records`: la lista cruda del período, ordenada por fecha
3. Elimina el campo `reportUrl`.

Commits mínimos: 3 (`feat(animals)` métodos de consulta, `feat(health)` reporte, `docs(health)` README completo del módulo).

---

### 5.2 Cristian — `ReproductionModule` y `NutritionModule`

Archivos permitidos: todo lo que está dentro de `src/reproduction/` y `src/nutrition/`. Además, como coordinador del repositorio, los archivos de configuración raíz (`package.json`, `.gitignore`, `README.md`, `app.module.ts`) cuando haga falta.

#### Tarea C1 — Celos y DTOs completos de reproducción (`src/reproduction/`)

1. `dto/heat.dto.ts` + `POST /reproduction/heat`: `animalId`, `date`, `observedBy?`, `notes?`. Guarda `eventType: HEAT_DETECTION`.
2. `insemination.dto.ts`: agrega `inseminationType` (`@IsEnum(InseminationType)`, nuevo enum `ARTIFICIAL | NATURAL` en la entidad) y `technician?`. Persistirlos.
3. `birth.dto.ts`: `calfGender` pasa a `@IsEnum(OffspringSex)` (nuevo enum `MALE | FEMALE`); agrega `offspringTagId?` y `notes?`. Persistir `offspringTagId`.
4. `dto/abortion.dto.ts` + `POST /reproduction/abortion`: `animalId`, `date`, `cause?`. Guarda `eventType: ABORTION` y cierra la preñez.
5. `GET /reproduction/history/:animalId`: todos los eventos del animal, `eventDate DESC`, con filtro `?eventType=`.

#### Tarea C2 — Indicadores reproductivos

1. `GET /reproduction/status/:animalId`: estado actual calculado a partir del último evento: `OPEN` (parida o vacía, sin inseminar), `INSEMINATED` (inseminada, preñez pendiente), `PREGNANT` (chequeo positivo), con `lastEventType`, `lastEventDate`, `estimatedDueDate` si aplica.
2. `GET /reproduction/open-days/:animalId`: **días abiertos** = días desde el último parto hasta la inseminación que resultó en preñez confirmada; si aún no hay preñez confirmada, hasta hoy (`openDaysToDate`). Devuelve `lastBirthDate`, `conceptionDate`, `openDays`, `isClosed` (true si hubo concepción), `target: 85` y `exceedsTarget`.
3. `GET /reproduction/upcoming-births?farmId=&days=30`: animales con `pregnancyResult = CONFIRMED_POSITIVE` cuyo `estimatedDueDate` caiga dentro del rango. Une con `animal` para filtrar por `farmId` y devolver `tagId`.

#### Tarea C3 — Inventario de alimento (`src/nutrition/`)

1. `inventory.dto.ts` deja de estar vacío: `CreateFeedInventoryDto` (`farmId`, `feedName`, `category` enum, `currentStockKg`, `minStockAlertKg?`, `unitCost?`) y `POST /nutrition/inventory`.
2. `dto/stock-movement.dto.ts` + `POST /nutrition/inventory/:id/restock` (suma kg, actualiza `unitCost` y `lastRestockDate`) y `POST /nutrition/inventory/:id/consume` (resta kg; si no alcanza → `BadRequestException`).
3. `GET /nutrition/inventory/alerts?farmId=`: ítems con `currentStockKg <= minStockAlertKg`.

#### Tarea C4 — Dietas y costo de alimentación por animal

1. `NutritionRecord` gana columna `animalId?` (relación a `Animal`, `nullable`). `DietDto` gana `farmId?`, `animalId?`, `costPerKg?`, `startDate?`, `endDate?`, `notes?`. Una dieta se asigna a un **animal** o a un **grupo** (`animalGroupId` pasa a opcional; al menos uno de los dos es obligatorio).
2. `GET /nutrition/diets?farmId=&animalId=&active=true`: lista dietas; `active` = sin `endDate` o con `endDate >= hoy`.
3. `GET /nutrition/cost/:animalId?from=&to=`: costo de alimentación del animal en el período = Σ (`dailyAmountKg × costPerKg × días de la dieta dentro del rango`). Devuelve `dailyFeedCost` (de las dietas activas hoy), `periodFeedCost`, `periodDays`, `diets[]`. Este método se expone en `NutritionService` como **`getFeedCostForAnimal(animalId, from?, to?)`** para que Finanzas lo use (ver sección 6).
4. `README.md` de cada módulo.

---

### 5.3 Carlos — `FinanceModule` y `FarmsModule`

Archivos permitidos: todo lo que está dentro de `src/finance/` y `src/farms/`. Nada más.

#### Tarea K1 — Consultas y actualización de fincas (`src/farms/`)

**Objetivo:** hoy solo se puede crear una finca y asignar un trabajador; no se puede ver ni editar nada.

1. `GET /farms`: lista todas las fincas. Acepta `?ownerId=` opcional.
2. `GET /farms/:id`: una finca con `relations: ['workers']`. Si no existe → 404. Incluye en la respuesta `animalsCount` (usa el repositorio de `Animal`: `FarmsModule` **ya puede** inyectarlo si agregas `Animal` a su `TypeOrmModule.forFeature([...])`; eso está permitido porque la entidad ya está relacionada con `Farm`).
3. `PUT /farms/:id` con `dto/update-farm.dto.ts` (todos los campos de `CreateFarmDto` opcionales, **sin** `ownerId`).
4. `GET /farms/:id/workers` y `DELETE /farms/:id/workers/:workerId` (borra el `FarmWorker`, no al usuario). No se puede eliminar al último `OWNER` → `BadRequestException`.
5. En `assignWorker`: si ya existe un `FarmWorker` con el mismo `farmId` + `userId`, actualiza su `role` en lugar de duplicarlo.
6. `src/farms/README.md`.

Commits mínimos: 6.

#### Tarea K2 — DTOs completos de finanzas (`src/finance/dto/`)

**Objetivo:** que cada movimiento quede ligado a una finca y, cuando aplique, a un animal, con cantidad y precio unitario. Sin eso no hay costo por litro.

1. `yield.dto.ts` pasa a representar **producción de leche**: `animalId` (obligatorio), `date`, `liters` (`@IsNumber()`, `@Min(0)`), `pricePerLiter` (`@IsNumber()`, `@Min(0)`), `farmId?`, `description?`. El servicio guarda `quantity = liters`, `unitPrice = pricePerLiter`, `amount = liters × pricePerLiter`, `category = MILK_SALE`. Renombra el método a `registerMilkProduction` y la ruta a `POST /finance/milk`. **Conserva** `POST /finance/yields` apuntando al mismo método para no romper a nadie.
2. `expense.dto.ts`: `category` pasa a `@IsEnum(FinanceCategory)`; agrega `farmId?`, `animalId?`, `quantity?`, `unitPrice?`, `description?`, `receiptNumber?`. Si vienen `quantity` y `unitPrice` y no viene `amount`, el servicio calcula `amount`. Persistir **todos** los campos.
3. Borra `roi-request.dto.ts` (vacío).
4. `dto/animal-sale.dto.ts` + `POST /finance/animal-sales`: `animalId`, `date`, `amount`, `buyer?`, `receiptNumber?`. Guarda `YIELD` + `ANIMAL_SALE`. **No** cambies el estado del animal: eso lo hace Gabo con `PATCH /animals/:tagId/status`; documenta en el README que el frontend debe llamar a ambos.

Commits mínimos: 4.

#### Tarea K3 — Costo por litro y resumen financiero (`src/finance/`)

**Objetivo:** el indicador central del proyecto: cuánto cuesta producir un litro de leche en cada vaca.

1. Importa `NutritionModule` en `finance.module.ts` (ya exporta `NutritionService`). Vas a usar `NutritionService.getFeedCostForAnimal(animalId, from?, to?)` que devuelve `{ periodFeedCost: number, dailyFeedCost: number, ... }` (ver sección 6). Hasta que ese método esté en `main`, desarrolla contra un valor `0` y deja un `// TODO(nutrition)` que quitarás en el mismo PR o en uno de seguimiento.
2. `GET /finance/cost-per-liter/:animalId?from=&to=` → interface `CostPerLiterReport`:
   - `period: { from, to }` (por defecto últimos 30 días)
   - `litersProduced` (Σ `quantity` de registros `MILK_SALE`)
   - `milkIncome` (Σ `amount` de `MILK_SALE`)
   - `directExpenses` (Σ `amount` de `EXPENSE` con ese `animalId`)
   - `feedCost` (de Nutrición)
   - `totalCost = directExpenses + feedCost`
   - `costPerLiter = totalCost / litersProduced` (si `litersProduced = 0` → `null`, no división por cero)
   - `averagePricePerLiter = milkIncome / litersProduced` (igual, `null` si 0)
   - `marginPerLiter = averagePricePerLiter - costPerLiter`
3. `GET /finance/summary?farmId=&from=&to=` → `FinanceSummary`: `totalIncome`, `totalExpenses`, `netResult`, `incomeByCategory[]`, `expensesByCategory[]`, `litersProduced`. `farmId` obligatorio. Para incluir registros que tienen `animalId` pero no `farmId`, une con `animal` (`relations: ['animal']`) y filtra por `animal.farmId`.
4. `calculateAnimalProfitability` (el ROI actual) debe aceptar `from`/`to` y sumar también `feedCost` a los gastos.
5. `src/finance/README.md`.

Commits mínimos: 5.

---

## 6. Contratos entre módulos

Esto es lo único que un módulo puede asumir de otro. Si necesitas algo que no está aquí, se habla primero en el chat y se agrega a esta tabla en un commit `docs: ...` antes de implementarlo.

| Quién lo provee | Qué | Quién lo consume | Firma / forma exacta |
| :--- | :--- | :--- | :--- |
| Animals (Gabo) | `AnimalsService.findByTagId(tagId)` | Todos | Ya existe. Lanza `NotFoundException`. |
| Animals (Gabo) | `AnimalsService.findByFarm(farmId)` y `countByFarm(farmId, status?)` | Health, Finance | Tarea G4. |
| Animals (Gabo) | Columna `Animal.farmId` | Reproduction, Nutrition, Health, Finance | Ya existe. Se usa con `relations: ['animal']` para filtrar por finca. |
| Nutrition (Cristian) | `NutritionService.getFeedCostForAnimal(animalId: string, from?: string, to?: string)` | Finance | Devuelve `Promise<{ animalId; period: { from; to }; periodDays; dailyFeedCost: number; periodFeedCost: number; diets: NutritionRecord[] }>`. Si el animal no tiene dietas devuelve ceros, **no** lanza error. |
| Reproduction (Cristian) | `ReproductionService.getReproductiveStatus(animalId)` | Finance (futuro), Frontend | Tarea C2. |
| Farms (Carlos) | Entidad `Farm` y `FarmsService` | Todos | Ya existen. Solo lectura desde otros módulos. |

Reglas de importación entre módulos:

- Si tu módulo usa el servicio de otro, importa el **módulo** (`imports: [OtroModule]`) en tu `*.module.ts` e inyecta el servicio. Nunca importes el repositorio de una entidad ajena salvo los casos explícitos de arriba (`Animal` en Farms).
- Está prohibido crear dependencias circulares. El orden permitido es: `Farms → Animals → (Health | Reproduction | Nutrition) → Finance`. Un módulo solo importa módulos que estén **a su izquierda**.

---

## 7. Checklist antes de abrir un Pull Request

Copia esto en la descripción del PR y marca cada casilla:

```markdown
- [ ] Mi rama está rebasada sobre `origin/main` actualizado.
- [ ] `npm run build` pasa sin errores.
- [ ] `npm run lint` pasa sin errores.
- [ ] Levanté la API con `npm run start:dev` y probé cada endpoint nuevo con Postman/Thunder Client.
- [ ] Cada commit es atómico y sigue el formato `tipo(modulo): descripción`.
- [ ] No toqué archivos fuera de mis módulos (o están listados abajo con justificación).
- [ ] Ningún DTO quedó vacío; todos los campos tienen decoradores de validación.
- [ ] Ningún método nuevo devuelve `Promise<any>`.
- [ ] El `README.md` del módulo está actualizado con los endpoints nuevos (petición y respuesta de ejemplo).
- [ ] No commiteé `dist/`, `.env` ni `node_modules/`.
```

---

## Recursos

- [Documentación de NestJS](https://docs.nestjs.com)
- [TypeORM — Repository API](https://typeorm.io/repository-api)
- [class-validator — decoradores](https://github.com/typestack/class-validator#validation-decorators)
- [Conventional Commits](https://www.conventionalcommits.org/es/)
