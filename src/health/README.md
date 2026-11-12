# 💉 Módulo de Salud (`HealthModule`)

El **Módulo de Salud** de **OptiFauna** gestiona la trazabilidad sanitaria individual y por lote del hato ganadero (vacunaciones, tratamientos médicos y desparasitaciones), el historial clínico por ejemplar, las alertas de eventos próximos o vencidos y la generación del **Reporte Sanitario ICA** exigido para el control oficial y la movilización de ganado en Nariño.

---

## 📋 Responsable
- **Desarrollador:** Gabriel
- **Rama de desarrollo:** `feature/health`

---

## 📁 Estructura del Módulo

```text
src/health/
├── dto/
│   ├── vaccine.dto.ts                # Registro de vacunas (individual o por lote)
│   ├── treatment.dto.ts              # Registro de tratamientos médicos
│   ├── deworming.dto.ts              # Registro de desparasitaciones
│   ├── health-history-query.dto.ts   # Filtro ?type= para el historial del animal
│   └── upcoming-health-query.dto.ts  # Filtros ?farmId=&days= de alertas sanitarias
├── entities/
│   └── health-record.entity.ts       # Entidad TypeORM: tabla 'health_records'
├── interfaces/
│   └── health-reports.interface.ts   # UpcomingHealthEvent, IcaReport
├── health.controller.ts              # Controlador REST con los endpoints sanitarios
├── health.module.ts                  # Módulo de NestJS (importa AnimalsModule)
├── health.service.ts                 # Lógica de negocio y generación del reporte ICA
└── README.md                         # Documentación del módulo
```

---

## 🗄️ Modelo de Datos (`HealthRecord`)

La entidad se mapea a la tabla `health_records` en la base de datos:

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Autogenerado | Identificador único del evento sanitario. |
| `animalId` | `uuid` | Nullable, FK → `animals.id` (`CASCADE`) | Animal al que se aplicó el evento. |
| `farmId` | `uuid` | Nullable, FK → `farms.id` (`SET NULL`) | Finca donde se registró el evento. |
| `batchId` | `varchar` | Nullable | Identificador del lote (cuando la vacunación es grupal). |
| `type` | `enum HealthRecordType` | Default `CHECKUP` | `VACCINE`, `TREATMENT`, `CHECKUP`, `DEWORMING`. |
| `title` | `varchar` | Nullable | Nombre de la vacuna, tratamiento o desparasitante. |
| `description` | `text` | Nullable | Detalle u observaciones clínicas del evento. |
| `medication` | `varchar` | Nullable | Fármaco o biológico aplicado. |
| `dosage` | `varchar` | Nullable | Dosis suministrada (ej. `"2 ml subcutáneo"`). |
| `cost` | `decimal(10,2)` | Nullable | Costo del evento sanitario en COP. |
| `date` | `date` | Not Null (`YYYY-MM-DD`) | Fecha de aplicación. |
| `nextDueDate` | `date` | Nullable (`YYYY-MM-DD`) | Fecha programada para el refuerzo o próxima dosis. |
| `veterinarian` | `varchar` | Nullable | Médico veterinario o técnico responsable. |
| `createdAt`, `updatedAt` | `timestamp` | Autogenerados | Marcas de tiempo de auditoría. |

---

## 🚀 Endpoints de la API

Ruta base: `http://localhost:<PORT>/health`

### Resumen de Rutas

| Método | Endpoint | Descripción | Códigos HTTP |
| :---: | :--- | :--- | :---: |
| `POST` | `/health/vaccines` | Registra una vacunación individual o por lote | `201`, `400` |
| `POST` | `/health/treatments` | Registra un tratamiento médico a un animal | `201`, `400` |
| `POST` | `/health/dewormings` | Registra una desparasitación a un animal | `201`, `400` |
| `GET` | `/health/animal/:animalId` | Historial sanitario completo de un animal | `200`, `400` |
| `GET` | `/health/upcoming` | Eventos sanitarios próximos a vencer y vencidos | `200`, `400` |
| `GET` | `/health/reports/ica` | Resumen sanitario oficial para visita del ICA | `200`, `400` |

---

### Detalle de Endpoints

#### 1. Registrar Vacuna
Registra la aplicación de un biológico. Debe incluir **al menos uno** entre `animalId` o `batchId`.

- **Método:** `POST`
- **Ruta:** `/health/vaccines`
- **Cuerpo de la petición (`VaccineDto`):**

```json
{
  "vaccineName": "Fiebre Aftosa Ciclo II",
  "date": "2026-11-01",
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "nextDueDate": "2027-05-01",
  "veterinarian": "Dra. Sofía Narváez - ICA",
  "dosage": "2 ml vía subcutánea",
  "cost": 4500,
  "description": "Campaña oficial ciclo II Nariño"
}
```

- **Validaciones:**
  - `vaccineName`, `date`: Obligatorios.
  - `animalId` o `batchId`: Al menos uno es obligatorio (si faltan ambos devuelve `400 Bad Request`).
  - `farmId`, `nextDueDate`, `veterinarian`, `dosage`, `cost` (≥ 0), `description`: Opcionales.

- **Respuesta Exitosa (`201 Created`):** El `HealthRecord` guardado con `type: "VACCINE"`.

---

#### 2. Registrar Tratamiento Médico
Registra un tratamiento curativo o preventivo aplicado a un animal.

- **Método:** `POST`
- **Ruta:** `/health/treatments`
- **Cuerpo de la petición (`TreatmentDto`):**

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "treatmentName": "Tratamiento de mastitis subclínica",
  "medication": "Cefalexina intramamaria",
  "dosage": "1 jeringa cada 12 horas por 3 días",
  "date": "2026-11-05",
  "nextDueDate": "2026-11-12",
  "veterinarian": "Dr. Camilo Rosero",
  "cost": 38000,
  "description": "Cuarto posterior derecho afectado"
}
```

- **Respuesta Exitosa (`201 Created`):** El `HealthRecord` guardado con `type: "TREATMENT"`.

---

#### 3. Registrar Desparasitación
Registra una desparasitación interna o externa para un animal.

- **Método:** `POST`
- **Ruta:** `/health/dewormings`
- **Cuerpo de la petición (`DewormingDto`):**

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "date": "2026-11-10",
  "medication": "Fenbendazol 10%",
  "dosage": "25 ml vía oral",
  "nextDueDate": "2027-02-10",
  "cost": 12000,
  "veterinarian": "Dr. Camilo Rosero"
}
```

- **Respuesta Exitosa (`201 Created`):** El `HealthRecord` guardado con `type: "DEWORMING"`.

---

#### 4. Historial Sanitario por Animal
Devuelve todos los eventos sanitarios de un animal ordenados por `date DESC`.

- **Método:** `GET`
- **Ruta:** `/health/animal/:animalId`
- **Query Params (`HealthHistoryQueryDto`):**
  - `type` *(opcional)*: `VACCINE`, `TREATMENT`, `DEWORMING` o `CHECKUP`.

- **Ejemplo:** `GET /health/animal/e4b95f1c-7389-4a41-b0db-d7903dbf05e2?type=VACCINE`
- **Respuesta Exitosa (`200 OK`):** `HealthRecord[]`.

---

#### 5. Alertas Sanitarias Próximas y Vencidas
Lista los eventos cuyo `nextDueDate` vence dentro de los próximos `days` días (por defecto `30`) o que **ya están vencidos** (`nextDueDate < hoy`, marcados con `overdue: true`), ordenados por `nextDueDate ASC`.

- **Método:** `GET`
- **Ruta:** `/health/upcoming?farmId=<uuid>&days=30`
- **Filtro por finca:** Usa `HealthRecord.farmId`; si es `null`, filtra mediante la relación `animal.farmId`.
- **Respuesta Exitosa (`200 OK` — `UpcomingHealthEvent[]`):**

```json
[
  {
    "recordId": "a12f4c89-0e11-4d2a-991b-8c7e6f5d4c3b",
    "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
    "type": "TREATMENT",
    "title": "Tratamiento de mastitis subclínica",
    "nextDueDate": "2026-11-08",
    "daysRemaining": -3,
    "overdue": true
  },
  {
    "recordId": "b98e1a23-4c55-4f88-8123-9a8b7c6d5e4f",
    "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
    "type": "VACCINE",
    "title": "Brucelosis Bovina",
    "nextDueDate": "2026-11-25",
    "daysRemaining": 14,
    "overdue": false
  }
]
```

---

#### 6. Reporte Sanitario ICA
Genera el consolidado sanitario de una finca para auditoría y requisitos de movilización del ICA.

- **Método:** `GET`
- **Ruta:** `/health/reports/ica?farmId=<uuid>&from=2025-11-11&to=2026-11-11`
- **Query Params:**
  - `farmId` (**obligatorio**, si falta devuelve `400 Bad Request`).
  - `from`, `to` *(opcionales, `YYYY-MM-DD`)*: Por defecto cubre los últimos 12 meses (365 días).
- **Respuesta Exitosa (`200 OK` — `IcaReport`):**

```json
{
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "period": {
    "from": "2025-11-11",
    "to": "2026-11-11"
  },
  "generatedAt": "2026-11-11T23:55:00.000Z",
  "totalAnimals": 20,
  "vaccinations": {
    "total": 18,
    "byVaccine": [
      {
        "vaccineName": "Fiebre Aftosa Ciclo II",
        "count": 18,
        "animalsCovered": 18
      }
    ],
    "coveragePercentage": 90
  },
  "treatments": {
    "total": 2,
    "byMedication": [
      {
        "medication": "Cefalexina intramamaria",
        "count": 2
      }
    ]
  },
  "dewormings": {
    "total": 15
  },
  "pendingEvents": [],
  "records": []
}
```

---

## 🔗 Integraciones en OptiFauna

- **Módulo de Animales (`AnimalsModule`):** `HealthModule` importa `AnimalsModule` y consume `AnimalsService.countByFarm(farmId, AnimalStatus.ACTIVE)` para calcular `totalAnimals` y `coveragePercentage` en el reporte ICA.
- **Módulo de Fincas (`FarmsModule`):** Asociación de eventos sanitarios y reportes ICA por `farmId`.
