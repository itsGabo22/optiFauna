# 💰 Módulo de Finanzas (`FinanceModule`)

El **Módulo de Finanzas** registra los ingresos productivos (venta/producción de leche y venta de animales), los gastos operativos de la finca o por animal, y calcula los indicadores económicos clave de **OptiFauna**: **costo por litro de leche**, **resumen financiero por finca** y **rentabilidad (ROI) por animal** integrando el costo de alimentación desde `NutritionModule`.

---

## 📋 Responsable
- **Desarrollador:** Carlos
- **Rama de desarrollo:** `feature/finance`

---

## 📁 Estructura del Módulo

```text
src/finance/
├── dto/
│   ├── yield.dto.ts                    # Registro de producción de leche (liters, pricePerLiter)
│   ├── expense.dto.ts                  # Registro de gastos operativos
│   └── animal-sale.dto.ts              # Registro de venta de animal
├── entities/
│   └── finance-record.entity.ts        # Entidad TypeORM: tabla 'finance_records'
├── interfaces/
│   └── finance-reports.interface.ts    # CostPerLiterReport, FinanceSummary, AnimalProfitabilityReport
├── finance.controller.ts
├── finance.module.ts
├── finance.service.ts
└── README.md
```

---

## 🗄️ Modelo de Datos (`FinanceRecord`)

Tabla `finance_records`:

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | Identificador del movimiento. |
| `farmId` | `uuid` | Nullable, FK → `farms.id` (`CASCADE`) | Finca asociada al movimiento. |
| `animalId` | `uuid` | Nullable, FK → `animals.id` (`SET NULL`) | Animal asociado (cuando aplica). |
| `recordType` | `enum FinanceRecordType` | Default `EXPENSE` | `YIELD` o `EXPENSE`. |
| `category` | `enum FinanceCategory` | Default `OTHER` | `MILK_SALE`, `MEAT_SALE`, `ANIMAL_SALE`, `FEED_PURCHASE`, `VETERINARIAN`, `LABOR`, `INFRASTRUCTURE`, `EQUIPMENT`, `SERVICES`, `OTHER`. |
| `amount` | `decimal(12,2)` | Not Null | Valor total en COP. |
| `quantity` | `decimal(10,2)` | Nullable | Cantidad (p. ej. litros de leche o unidades). |
| `unitPrice` | `decimal(10,2)` | Nullable | Precio o costo unitario en COP. |
| `date` | `date` | Not Null | Fecha del movimiento (`YYYY-MM-DD`). |
| `description` | `text` | Nullable | Detalle u observaciones. |
| `receiptNumber` | `varchar` | Nullable | Número de factura o comprobante. |
| `createdAt`, `updatedAt` | `timestamp` | Autogenerados | Fechas de creación y actualización. |

---

## 🚀 Endpoints de la API

Ruta base: `http://localhost:<PORT>/finance`

| Método | Endpoint | Descripción | Códigos |
| :---: | :--- | :--- | :---: |
| `POST` | `/finance/milk` | Registra producción/venta de leche | `201`, `400` |
| `POST` | `/finance/yields` | Alias compatible de `/finance/milk` | `201`, `400` |
| `POST` | `/finance/expenses` | Registra un gasto operativo | `201`, `400` |
| `POST` | `/finance/animal-sales` | Registra la venta económica de un animal | `201`, `400` |
| `GET` | `/finance/cost-per-liter/:animalId` | Calcula costo por litro y margen de leche por animal | `200`, `400` |
| `GET` | `/finance/summary` | Resumen financiero agregado por finca | `200`, `400` |
| `GET` | `/finance/roi/:animalId` | Rentabilidad (ROI) del animal incluyendo alimentación | `200`, `400` |

---

### 1. Registrar producción de leche
- **`POST /finance/milk`** (también disponible en **`POST /finance/yields`**) — Cuerpo (`YieldDto`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "date": "2026-11-12",
  "liters": 22.5,
  "pricePerLiter": 2000,
  "description": "Ordeño mañana y tarde"
}
```

- El servicio guarda `quantity = liters`, `unitPrice = pricePerLiter`, `amount = liters * pricePerLiter`, `recordType = YIELD` y `category = MILK_SALE`.
- Respuesta `201`:

```json
{
  "id": "9f2a1d30-1122-44aa-bbcc-0123456789ab",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "recordType": "YIELD",
  "category": "MILK_SALE",
  "amount": 45000,
  "quantity": 22.5,
  "unitPrice": 2000,
  "date": "2026-11-12",
  "description": "Ordeño mañana y tarde",
  "receiptNumber": null,
  "createdAt": "2026-11-12T05:30:00.000Z",
  "updatedAt": "2026-11-12T05:30:00.000Z"
}
```

### 2. Registrar gasto operativo
- **`POST /finance/expenses`** — Cuerpo (`ExpenseDto`):

```json
{
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "category": "VETERINARIAN",
  "quantity": 2,
  "unitPrice": 35000,
  "date": "2026-11-12",
  "description": "Desparasitante inyectable",
  "receiptNumber": "FAC-00451"
}
```

- Validaciones: `category` debe pertenecer a `FinanceCategory`. Si no se envía `amount`, se calcula automáticamente como `quantity * unitPrice`; si faltan ambos, responde `400 Bad Request`.
- Respuesta `201`: el `FinanceRecord` creado con `recordType: "EXPENSE"`.

### 3. Registrar venta de animal
- **`POST /finance/animal-sales`** — Cuerpo (`AnimalSaleDto`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "date": "2026-11-12",
  "amount": 3200000,
  "buyer": "Ganadería Nariño S.A.S.",
  "receiptNumber": "VTA-2026-089"
}
```

- Guarda un registro con `recordType: "YIELD"` y `category: "ANIMAL_SALE"`.
- **Importante:** este endpoint **no modifica el estado biológico del animal**. Para marcar el animal como vendido (`SOLD`), el frontend debe llamar también a `PATCH /animals/:tagId/status` del módulo de Animales.

### 4. Costo por litro de leche por animal
- **`GET /finance/cost-per-liter/:animalId?from=2026-10-14&to=2026-11-12`**
- `from`/`to` opcionales (por defecto, últimos 30 días). `400` si `from > to`.
- Suma ingresos y litros de `MILK_SALE`, gastos directos (`EXPENSE`) del animal y el costo de alimentación (`periodFeedCost`) consultado desde `NutritionService.getFeedCostForAnimal`. Si `litersProduced === 0`, `costPerLiter`, `averagePricePerLiter` y `marginPerLiter` devuelven `null`.
- Respuesta `200` (`CostPerLiterReport`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "period": { "from": "2026-10-14", "to": "2026-11-12" },
  "litersProduced": 620,
  "milkIncome": 1240000,
  "directExpenses": 70000,
  "feedCost": 260400,
  "totalCost": 330400,
  "costPerLiter": 532.9,
  "averagePricePerLiter": 2000,
  "marginPerLiter": 1467.1
}
```

### 5. Resumen financiero por finca
- **`GET /finance/summary?farmId=7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11&from=2026-10-14&to=2026-11-12`**
- `farmId` obligatorio (`400 Bad Request` si falta). `from`/`to` opcionales (por defecto, últimos 30 días).
- Incluye tanto movimientos con `farmId` directo como movimientos ligados a un animal (`animalId`) cuya finca (`animal.farmId`) coincida con el parámetro.
- Respuesta `200` (`FinanceSummary`):

```json
{
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "period": { "from": "2026-10-14", "to": "2026-11-12" },
  "totalIncome": 4440000,
  "totalExpenses": 520000,
  "netResult": 3920000,
  "incomeByCategory": [
    { "category": "MILK_SALE", "total": 1240000, "count": 28 },
    { "category": "ANIMAL_SALE", "total": 3200000, "count": 1 }
  ],
  "expensesByCategory": [
    { "category": "VETERINARIAN", "total": 170000, "count": 2 },
    { "category": "LABOR", "total": 350000, "count": 1 }
  ],
  "litersProduced": 620
}
```

### 6. Rentabilidad / ROI por animal
- **`GET /finance/roi/:animalId?from=2026-10-14&to=2026-11-12`**
- `from`/`to` opcionales (por defecto, últimos 30 días). Suma los gastos directos del animal y el costo de alimentación (`feedCost`) obtenido de `NutritionService`.
- Respuesta `200` (`AnimalProfitabilityReport`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "period": { "from": "2026-10-14", "to": "2026-11-12" },
  "totalYield": 1240000,
  "directExpenses": 70000,
  "feedCost": 260400,
  "totalExpense": 330400,
  "netProfit": 909600,
  "roiPercentage": "275.30%",
  "recordsCount": 29
}
```

---

## 🔗 Integraciones en OptiFauna

- **Nutrición (`NutritionModule`):** `FinanceModule` importa `NutritionModule` e inyecta `NutritionService` para consultar `getFeedCostForAnimal(animalId, from?, to?)` en los cálculos de costo por litro y ROI.
- **Animales (`AnimalsModule`):** `FinanceRecord.animalId` referencia a `animals.id`; `GET /finance/summary` usa la relación `animal.farmId` cuando el registro no tiene `farmId` directo.
- **Fincas (`FarmsModule`):** `FinanceRecord.farmId` referencia a `farms.id`.

