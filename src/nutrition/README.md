# 🌿 Módulo de Nutrición (`NutritionModule`)

El **Módulo de Nutrición** gestiona las **dietas** asignadas a cada animal o lote, el **inventario de alimento** de la finca (forraje, concentrado, sal, silo) y calcula el **costo de alimentación por animal**, que es el insumo principal del costo por litro de leche que reporta `FinanceModule`.

---

## 📋 Responsable
- **Desarrollador:** Cristian
- **Rama de desarrollo:** `feature/nutrition`

---

## 📁 Estructura del Módulo

```text
src/nutrition/
├── dto/
│   ├── diet.dto.ts              # Asignar dieta
│   ├── diets-query.dto.ts       # Filtros de GET /nutrition/diets
│   ├── inventory.dto.ts         # CreateFeedInventoryDto
│   └── stock-movement.dto.ts    # Entradas y salidas de stock
├── entities/
│   ├── nutrition-record.entity.ts  # Tabla 'nutrition_records' (dietas)
│   └── feed-inventory.entity.ts    # Tabla 'feed_inventory'
├── interfaces/
│   └── nutrition-reports.interface.ts # FeedCostReport, ConsumptionReport
├── nutrition.controller.ts
├── nutrition.module.ts
├── nutrition.service.ts
└── README.md
```

---

## 🗄️ Modelo de Datos

### `NutritionRecord` — tabla `nutrition_records` (dietas)

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | |
| `farmId` | `uuid` | Nullable, FK → `farms.id` | Finca. |
| `animalId` | `uuid` | Nullable, FK → `animals.id` (`CASCADE`) | Animal al que se asigna la dieta. |
| `animalGroupId` | `varchar` | Nullable | Lote/grupo (p. ej. `"vacas-produccion"`). **`animalId` o `animalGroupId` es obligatorio.** |
| `dietName` | `varchar` | Not Null | Nombre de la ración. |
| `dailyAmountKg` | `decimal(8,2)` | Not Null | Kg/día suministrados. |
| `costPerKg` | `decimal(10,2)` | Nullable | Costo por kg en COP. Sin él la dieta no suma al costo. |
| `startDate` | `date` | Nullable (hoy por defecto) | Inicio de la dieta. |
| `endDate` | `date` | Nullable | Fin de la dieta; vacío = vigente. |
| `notes` | `text` | Nullable | |
| `createdAt`, `updatedAt` | `timestamp` | Autogenerados | |

### `FeedInventory` — tabla `feed_inventory`

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | |
| `farmId` | `uuid` | Not Null, FK → `farms.id` (`CASCADE`) | |
| `feedName` | `varchar` | Not Null | Ej. `"Concentrado 16%"`. |
| `category` | `enum FeedCategory` | Not Null | `FORAGE`, `CONCENTRATE`, `MINERAL_SALT`, `SUPPLEMENT`, `SILAGE`, `OTHER`. |
| `currentStockKg` | `decimal(10,2)` | Default `0` | Existencia actual. |
| `minStockAlertKg` | `decimal(10,2)` | Nullable | Umbral de alerta. |
| `unitCost` | `decimal(10,2)` | Nullable | Último costo por kg. |
| `lastRestockDate` | `date` | Nullable | Última compra/entrada. |
| `createdAt`, `updatedAt` | `timestamp` | Autogenerados | |

> Los `decimal` llegan de Postgres como **string**. El servicio ya hace `Number(...)` antes de operar.

---

## 🚀 Endpoints de la API

Ruta base: `http://localhost:<PORT>/nutrition`

| Método | Endpoint | Descripción | Códigos |
| :---: | :--- | :--- | :---: |
| `POST` | `/nutrition/diets` | Asigna una dieta a un animal o lote | `201`, `400` |
| `GET` | `/nutrition/diets` | Lista dietas con filtros | `200` |
| `GET` | `/nutrition/cost/:animalId` | Costo de alimentación del animal en un período | `200`, `400` |
| `POST` | `/nutrition/inventory` | Crea un ítem de inventario | `201`, `400` |
| `GET` | `/nutrition/inventory` | Lista el inventario (filtro `farmId`) | `200` |
| `GET` | `/nutrition/inventory/alerts` | Ítems en o bajo su umbral mínimo | `200` |
| `POST` | `/nutrition/inventory/:id/restock` | Entrada de stock | `201`, `404` |
| `POST` | `/nutrition/inventory/:id/consume` | Salida de stock | `201`, `400`, `404` |
| `GET` | `/nutrition/consumption` | Kg/día totales de las dietas de una finca | `200` |

---

### 1. Asignar dieta
- **`POST /nutrition/diets`** — Cuerpo (`DietDto`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "dietName": "Concentrado 16% + kikuyo",
  "dailyAmountKg": 4,
  "costPerKg": 2100,
  "startDate": "2026-11-01",
  "notes": "2 kg por ordeño"
}
```

- Validaciones: `dietName` obligatorio; `dailyAmountKg` número positivo; `costPerKg` ≥ 0; fechas `YYYY-MM-DD`; `endDate` no puede ser anterior a `startDate`.
- `400` si no viene ni `animalId` ni `animalGroupId`:

```json
{ "message": "Either animalId or animalGroupId is required", "error": "Bad Request", "statusCode": 400 }
```

- Respuesta `201`: el `NutritionRecord` creado (`startDate` = hoy si no se envió).

### 2. Listar dietas
- **`GET /nutrition/diets?farmId=&animalId=&animalGroupId=&active=true`**
- `active=true` devuelve solo dietas ya iniciadas y sin terminar (sin `endDate` o con `endDate >= hoy`).
- Respuesta `200`: `NutritionRecord[]` ordenado por `startDate DESC`.

### 3. Costo de alimentación por animal
- **`GET /nutrition/cost/:animalId?from=2026-10-01&to=2026-10-31`**
- `from`/`to` opcionales. Por defecto: **últimos 30 días** (ambos extremos inclusive). `400` si `from > to`.
- Fórmula por dieta: `dailyAmountKg × costPerKg × díasDeLaDietaDentroDelPeríodo`.
- Las dietas **sin `costPerKg`** se listan pero suman `0`, y se cuentan en `dietsWithoutCost` para que el usuario sepa que el total está incompleto.
- Un animal sin dietas devuelve ceros, **no** error.
- Respuesta `200` (`FeedCostReport`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "period": { "from": "2026-10-01", "to": "2026-10-31" },
  "periodDays": 31,
  "dailyFeedCost": 8400,
  "periodFeedCost": 260400,
  "dietsWithoutCost": 0,
  "diets": [
    {
      "dietId": "3f9c...",
      "dietName": "Concentrado 16% + kikuyo",
      "dailyAmountKg": 4,
      "costPerKg": 2100,
      "dailyCost": 8400,
      "startDate": "2026-09-15",
      "endDate": null,
      "daysInPeriod": 31,
      "periodCost": 260400,
      "activeToday": true
    }
  ]
}
```

Este mismo cálculo está disponible para otros módulos como **`NutritionService.getFeedCostForAnimal(animalId, from?, to?)`** (ver sección de integraciones).

### 4. Crear ítem de inventario
- **`POST /nutrition/inventory`** — Cuerpo (`CreateFeedInventoryDto`):

```json
{
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "feedName": "Concentrado 16%",
  "category": "CONCENTRATE",
  "currentStockKg": 400,
  "minStockAlertKg": 80,
  "unitCost": 2100
}
```

- Si `currentStockKg > 0`, `lastRestockDate` se fija en hoy.

### 5. Entrada de stock (compra)
- **`POST /nutrition/inventory/:id/restock`** — Cuerpo (`StockMovementDto`):

```json
{ "quantityKg": 200, "unitCost": 2150, "date": "2026-11-10", "notes": "Factura 00123" }
```

- Suma `quantityKg`, actualiza `unitCost` si viene y `lastRestockDate` (= `date` u hoy). `404` si el ítem no existe.

### 6. Salida de stock (consumo)
- **`POST /nutrition/inventory/:id/consume`** — Cuerpo (`StockMovementDto`, solo `quantityKg` es relevante):

```json
{ "quantityKg": 25 }
```

- `400` si no hay existencia suficiente:

```json
{ "message": "Insufficient stock for Concentrado 16%: 20 kg available, 25 kg requested", "error": "Bad Request", "statusCode": 400 }
```

### 7. Alertas de stock bajo
- **`GET /nutrition/inventory/alerts?farmId=`**
- Devuelve los ítems con `minStockAlertKg` definido y `currentStockKg <= minStockAlertKg`, del más crítico al menos.

### 8. Inventario y consumo
- **`GET /nutrition/inventory?farmId=`**: `FeedInventory[]`.
- **`GET /nutrition/consumption?farmId=`** (`ConsumptionReport`): `activeDietPlansCount`, `calculatedTotalDailyKg` y la lista de dietas de la finca.

---

## 🔗 Integraciones en OptiFauna

- **Finanzas (`FinanceModule`)** importa `NutritionModule` y usa:

  ```ts
  NutritionService.getFeedCostForAnimal(animalId: string, from?: string, to?: string): Promise<FeedCostReport>
  ```

  De la respuesta, Finanzas toma `periodFeedCost` para el costo por litro y `dailyFeedCost` para proyecciones. **Nunca lanza error por falta de dietas**: devuelve ceros.
- **Animales (`AnimalsModule`)**: `NutritionRecord.animalId` → `animals.id` (`CASCADE`).
- **Fincas (`FarmsModule`)**: `farmId` en dietas e inventario.
