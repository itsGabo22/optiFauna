# 🏡 Módulo de Fincas (`FarmsModule`)

El **Módulo de Fincas** administra las propiedades ganaderas de **OptiFauna**, la vinculación de usuarios y trabajadores con sus roles dentro de cada finca, y sirve como entidad raíz de referencia para animales, nutrición, sanidad y finanzas.

---

## 📋 Responsable
- **Desarrollador:** Carlos
- **Rama de desarrollo:** `feature/farms`

---

## 📁 Estructura del Módulo

```text
src/farms/
├── dto/
│   ├── create-farm.dto.ts         # Creación de finca
│   ├── update-farm.dto.ts         # Actualización de finca (sin ownerId)
│   └── assign-worker.dto.ts       # Asignación o actualización de rol de trabajador
├── entities/
│   ├── farm.entity.ts             # Entidad TypeORM: tabla 'farms'
│   └── farm-worker.entity.ts      # Entidad TypeORM: tabla 'farm_workers'
├── interfaces/
│   └── farm-details.interface.ts  # FarmDetails y RemovedWorkerResult
├── farms.controller.ts
├── farms.module.ts
├── farms.service.ts
└── README.md
```

---

## 🗄️ Modelo de Datos

### `Farm` — tabla `farms`

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | Identificador único de la finca. |
| `name` | `varchar(150)` | Not Null | Nombre de la finca. |
| `location` | `varchar(255)` | Not Null | Ubicación o vereda. |
| `sizeHectares` | `decimal(10,2)` | Nullable | Extensión en hectáreas. |
| `ownerId` | `varchar` | Nullable | Identificador del propietario inicial. |
| `createdAt`, `updatedAt` | `timestamp` | Autogenerados | Fechas de creación y actualización. |

### `FarmWorker` — tabla `farm_workers`

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | Identificador del vínculo finca-trabajador. |
| `farmId` | `uuid` | Not Null, FK → `farms.id` (`CASCADE`) | Finca asignada. |
| `userId` | `varchar` | Not Null | Identificador del usuario. |
| `role` | `enum WorkerRole` | Default `OPERATOR` | `OWNER`, `ADMIN`, `VETERINARIAN`, `OPERATOR`. |
| `assignedAt` | `timestamp` | Autogenerado | Fecha de asignación. |

---

## 🚀 Endpoints de la API

Ruta base: `http://localhost:<PORT>/farms`

| Método | Endpoint | Descripción | Códigos |
| :---: | :--- | :--- | :---: |
| `POST` | `/farms` | Crea una nueva finca | `201`, `400` |
| `GET` | `/farms` | Lista fincas (filtro opcional `ownerId`) | `200` |
| `GET` | `/farms/:id` | Obtiene una finca con trabajadores y `animalsCount` | `200`, `404` |
| `PUT` | `/farms/:id` | Actualiza datos básicos de la finca | `200`, `400`, `404` |
| `POST` | `/farms/:id/workers` | Asigna un trabajador o actualiza su rol si ya existe | `201`, `400`, `404` |
| `GET` | `/farms/:id/workers` | Lista los trabajadores asignados a la finca | `200`, `404` |
| `DELETE` | `/farms/:id/workers/:workerId` | Desvincula un trabajador de la finca | `200`, `400`, `404` |

---

### 1. Crear finca
- **`POST /farms`** — Cuerpo (`CreateFarmDto`):

```json
{
  "name": "Finca El Paraíso",
  "location": "Catambuco, Pasto, Nariño",
  "sizeHectares": 12.5,
  "ownerId": "user-carlos-01"
}
```

- Si se envía `ownerId`, crea automáticamente el registro en `farm_workers` con rol `OWNER`.
- Respuesta `201`:

```json
{
  "id": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "name": "Finca El Paraíso",
  "location": "Catambuco, Pasto, Nariño",
  "sizeHectares": 12.5,
  "ownerId": "user-carlos-01",
  "createdAt": "2026-11-12T05:00:00.000Z",
  "updatedAt": "2026-11-12T05:00:00.000Z"
}
```

### 2. Listar fincas
- **`GET /farms`** o **`GET /farms?ownerId=user-carlos-01`**
- Respuesta `200`: arreglo `Farm[]` ordenado por `createdAt DESC`.

### 3. Consultar detalle de finca
- **`GET /farms/:id`**
- Respuesta `200` (`FarmDetails`): incluye `workers` y `animalsCount`. `404` si la finca no existe.

```json
{
  "id": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "name": "Finca El Paraíso",
  "location": "Catambuco, Pasto, Nariño",
  "sizeHectares": "12.50",
  "ownerId": "user-carlos-01",
  "workers": [
    {
      "id": "b19c0a12-4321-4c11-9001-112233445566",
      "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
      "userId": "user-carlos-01",
      "role": "OWNER",
      "assignedAt": "2026-11-12T05:00:00.000Z"
    }
  ],
  "animalsCount": 18,
  "createdAt": "2026-11-12T05:00:00.000Z",
  "updatedAt": "2026-11-12T05:00:00.000Z"
}
```

### 4. Actualizar finca
- **`PUT /farms/:id`** — Cuerpo (`UpdateFarmDto`, todos opcionales, sin `ownerId`):

```json
{
  "name": "Hacienda El Paraíso",
  "location": "Catambuco, Pasto",
  "sizeHectares": 14
}
```

- Respuesta `200`: entidad `Farm` actualizada. `404` si la finca no existe.

### 5. Asignar o actualizar rol de trabajador
- **`POST /farms/:id/workers`** — Cuerpo (`AssignWorkerDto`):

```json
{
  "userId": "vet-02",
  "role": "VETERINARIAN"
}
```

- Si ya existe un `FarmWorker` para la misma combinación `farmId + userId`, actualiza su `role` en lugar de duplicarlo. Si se intenta degradar al último `OWNER`, responde `400 Bad Request`.
- Respuesta `201`: registro `FarmWorker`.

### 6. Listar trabajadores de la finca
- **`GET /farms/:id/workers`**
- Respuesta `200`: arreglo `FarmWorker[]` de la finca. `404` si la finca no existe.

### 7. Desvincular trabajador de la finca
- **`DELETE /farms/:id/workers/:workerId`**
- Elimina el registro `FarmWorker` (por su `id` o por `userId` dentro de la finca), no la cuenta del usuario.
- Responde `400 Bad Request` si se intenta eliminar al último `OWNER` de la finca.
- Respuesta `200` (`RemovedWorkerResult`):

```json
{
  "deleted": true,
  "id": "b19c0a12-4321-4c11-9001-112233445566",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "userId": "vet-02"
}
```

---

## 🔗 Integraciones en OptiFauna

- **Animales (`AnimalsModule`):** `Animal.farmId` referencia a `farms.id`; `FarmsService.findOne` consulta la entidad `Animal` para calcular `animalsCount`.
- **Finanzas (`FinanceModule`), Nutrición (`NutritionModule`) y Salud (`HealthModule`):** utilizan `farmId` para segmentar costos, inventarios, dietas y reportes ICA por finca.

