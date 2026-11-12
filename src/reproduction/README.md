# 🐄 Módulo de Reproducción (`ReproductionModule`)

El **Módulo de Reproducción** registra la vida reproductiva de cada hembra del hato (celos, inseminaciones, chequeos de preñez, partos y abortos) y calcula los indicadores que el proyecto necesita para la lechería de minifundio: **estado reproductivo actual**, **días abiertos** y **partos próximos**.

---

## 📋 Responsable
- **Desarrollador:** Cristian
- **Rama de desarrollo:** `feature/reproduction`

---

## 📁 Estructura del Módulo

```text
src/reproduction/
├── dto/
│   ├── heat.dto.ts                   # Registro de celo
│   ├── insemination.dto.ts           # Registro de inseminación
│   ├── pregnancy-check.dto.ts        # Chequeo de preñez
│   ├── birth.dto.ts                  # Registro de parto
│   ├── abortion.dto.ts               # Registro de aborto
│   ├── history-query.dto.ts          # Filtro ?eventType= del historial
│   └── upcoming-births-query.dto.ts  # Filtros ?farmId=&days= de partos próximos
├── entities/
│   └── reproduction-record.entity.ts # Entidad TypeORM: tabla 'reproduction_records'
├── interfaces/
│   └── reproduction-reports.interface.ts # Tipos de respuesta de los indicadores
├── reproduction.controller.ts
├── reproduction.module.ts
├── reproduction.service.ts
└── README.md
```

Las utilidades de fecha (`daysBetween`, `addDays`, `todayIso`) viven en `src/common/utils/date.utils.ts`.

---

## 🗄️ Modelo de Datos (`ReproductionRecord`)

Cada fila es **un evento**. La historia de una vaca es la secuencia de sus eventos ordenados por `eventDate`.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | Identificador del evento. |
| `animalId` | `uuid` | Not Null, FK → `animals.id` (`CASCADE`) | Hembra a la que pertenece el evento. |
| `eventType` | `enum ReproductionEventType` | Not Null | `HEAT_DETECTION`, `INSEMINATION`, `PREGNANCY_CHECK`, `BIRTH`, `ABORTION`, `WEANING`. |
| `eventDate` | `date` | Not Null | Fecha del evento (`YYYY-MM-DD`). |
| `inseminationType` | `enum InseminationType` | Nullable | `ARTIFICIAL` o `NATURAL`. Solo en inseminaciones. |
| `sireIdOrSemen` | `varchar` | Nullable | Toro o código de pajilla. |
| `pregnancyResult` | `enum PregnancyResult` | Nullable | `PENDING`, `CONFIRMED_POSITIVE`, `CONFIRMED_NEGATIVE`. |
| `estimatedDueDate` | `date` | Nullable | Fecha probable de parto = inseminación + 283 días. |
| `offspringTagId` | `varchar` | Nullable | `tagId` de la cría (si ya tiene chapeta). |
| `offspringSex` | `enum OffspringSex` | Nullable | `MALE` o `FEMALE`. |
| `details` | `text` | Nullable | Observaciones. |
| `technician` | `varchar` | Nullable | Quién inseminó / observó el celo. |
| `createdAt`, `updatedAt` | `timestamp` | Autogenerados | |

### Cómo se encadenan los eventos

1. `POST /heat` registra el celo (no cambia el estado reproductivo).
2. `POST /insemination` crea el evento con `pregnancyResult = PENDING` y calcula `estimatedDueDate`.
3. `POST /pregnancy-check` crea el evento del chequeo **y escribe el resultado sobre la última inseminación pendiente**. Si es positivo, el chequeo hereda su `estimatedDueDate`.
4. `POST /birth` o `POST /abortion` cierran la gestación y dejan a la vaca **abierta** otra vez.

---

## 🚀 Endpoints de la API

Ruta base: `http://localhost:<PORT>/reproduction`

| Método | Endpoint | Descripción | Códigos |
| :---: | :--- | :--- | :---: |
| `POST` | `/reproduction/heat` | Registra un celo | `201`, `400` |
| `POST` | `/reproduction/insemination` | Registra una inseminación y calcula fecha probable de parto | `201`, `400` |
| `POST` | `/reproduction/pregnancy-check` | Registra chequeo de preñez y resuelve la inseminación pendiente | `201`, `400` |
| `POST` | `/reproduction/birth` | Registra un parto | `201`, `400` |
| `POST` | `/reproduction/abortion` | Registra un aborto | `201`, `400` |
| `GET` | `/reproduction/upcoming-births` | Partos próximos por finca | `200`, `400` |
| `GET` | `/reproduction/history/:animalId` | Historial de eventos de una vaca | `200` |
| `GET` | `/reproduction/status/:animalId` | Estado reproductivo actual | `200` |
| `GET` | `/reproduction/open-days/:animalId` | Días abiertos | `200` |
| `GET` | `/reproduction/due-date/:animalId` | Fecha probable de parto de la última inseminación | `200` |

> `animalId` es siempre el **`id` (uuid)** del animal, no el `tagId`. El frontend resuelve el `tagId` escaneado con `GET /animals/:tagId` y usa el `id` que devuelve.

---

### 1. Registrar celo
- **`POST /reproduction/heat`** — Cuerpo (`HeatDto`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "date": "2026-11-10",
  "observedBy": "Don Jaime",
  "notes": "Monta a otras vacas, moco claro"
}
```

- Validaciones: `animalId` y `date` obligatorios; `observedBy` y `notes` opcionales.
- Respuesta `201`: el `ReproductionRecord` creado con `eventType: "HEAT_DETECTION"`.

### 2. Registrar inseminación
- **`POST /reproduction/insemination`** — Cuerpo (`InseminationDto`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "date": "2026-11-11",
  "bullIdOrSemen": "HOL-7781-A",
  "inseminationType": "ARTIFICIAL",
  "technician": "Inseminador CORPOICA"
}
```

- Validaciones: `inseminationType` debe ser `ARTIFICIAL` o `NATURAL`; `technician` opcional.
- Respuesta `201`:

```json
{
  "id": "0c1f...",
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "eventType": "INSEMINATION",
  "eventDate": "2026-11-11",
  "inseminationType": "ARTIFICIAL",
  "sireIdOrSemen": "HOL-7781-A",
  "technician": "Inseminador CORPOICA",
  "pregnancyResult": "PENDING",
  "estimatedDueDate": "2027-08-21",
  "details": "ARTIFICIAL insemination with sire/straw: HOL-7781-A",
  "createdAt": "2026-11-11T14:02:11.000Z",
  "updatedAt": "2026-11-11T14:02:11.000Z"
}
```

### 3. Chequeo de preñez
- **`POST /reproduction/pregnancy-check`** — Cuerpo (`PregnancyCheckDto`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "date": "2027-01-15",
  "isPregnant": true
}
```

- Efecto: crea el evento `PREGNANCY_CHECK` y actualiza la última inseminación `PENDING` anterior o igual a `date` con `CONFIRMED_POSITIVE` / `CONFIRMED_NEGATIVE`.
- Respuesta `201`: el evento del chequeo; si es positivo incluye `estimatedDueDate`.

### 4. Registrar parto
- **`POST /reproduction/birth`** — Cuerpo (`BirthDto`):

```json
{
  "motherId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "date": "2027-08-19",
  "calfGender": "FEMALE",
  "offspringTagId": "BOV-2027-014",
  "notes": "Parto normal, ternera 32 kg"
}
```

- Validaciones: `calfGender` debe ser `MALE` o `FEMALE`. `offspringTagId` y `notes` opcionales.
- La cría **no se crea aquí**: se registra con `POST /animals` (módulo de Animales) usando `motherId`.

### 5. Registrar aborto
- **`POST /reproduction/abortion`** — Cuerpo (`AbortionDto`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "date": "2027-03-02",
  "cause": "Sospecha de neosporosis"
}
```

- Respuesta `201`: evento `ABORTION` con `pregnancyResult: "CONFIRMED_NEGATIVE"`.

### 6. Partos próximos
- **`GET /reproduction/upcoming-births?farmId=<uuid>&days=30`**
- Query: `farmId` opcional (filtra por la finca del animal); `days` opcional, entero entre 1 y 365, por defecto `30`.
- Devuelve inseminaciones con preñez confirmada cuya `estimatedDueDate` cae entre hoy y hoy + `days`, excluyendo las que ya terminaron en parto o aborto.
- Respuesta `200` (`UpcomingBirth[]`):

```json
[
  {
    "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
    "tagId": "BOV-2026-001",
    "farmId": "7a1d...",
    "inseminationDate": "2026-11-11",
    "estimatedDueDate": "2027-08-21",
    "daysToDueDate": 12,
    "sireIdOrSemen": "HOL-7781-A"
  }
]
```

### 7. Historial
- **`GET /reproduction/history/:animalId?eventType=INSEMINATION`**
- `eventType` opcional; debe ser un valor de `ReproductionEventType`.
- Respuesta `200`: `ReproductionRecord[]` ordenado por `eventDate DESC`.

### 8. Estado reproductivo
- **`GET /reproduction/status/:animalId`**
- Se calcula con el último evento que cambia el estado (celos y destetes no lo cambian):

| `status` | Significado |
| :--- | :--- |
| `NO_RECORDS` | Sin eventos. |
| `OPEN` | Parida, abortada, chequeo negativo o nunca servida. |
| `INSEMINATED` | Inseminada, chequeo pendiente. |
| `PREGNANT` | Preñez confirmada. |

- Respuesta `200` (`ReproductiveStatusReport`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "status": "PREGNANT",
  "lastEventType": "PREGNANCY_CHECK",
  "lastEventDate": "2027-01-15",
  "daysInStatus": 40,
  "estimatedDueDate": "2027-08-21",
  "daysToDueDate": 178
}
```

### 9. Días abiertos
- **`GET /reproduction/open-days/:animalId`**
- **Días abiertos** = días desde el último parto hasta la inseminación que resultó en preñez confirmada (ignorando las anuladas por un aborto posterior). Si aún no hay concepción, se cuentan hasta hoy. Meta: **85 días**.
- Para novillas sin parto todos los valores numéricos son `null`.
- Respuesta `200` (`OpenDaysReport`):

```json
{
  "animalId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "lastBirthDate": "2026-09-01",
  "conceptionDate": "2026-11-11",
  "openDays": 71,
  "isClosed": true,
  "target": 85,
  "exceedsTarget": false
}
```

### 10. Fecha probable de parto
- **`GET /reproduction/due-date/:animalId`**
- Respuesta `200` (`DueDateInfo`): `lastInseminationDate`, `pregnancyResult`, `estimatedDueDate`, `daysToDueDate` (negativo si ya pasó). Todos `null` si nunca fue inseminada.

---

## 🔗 Integraciones en OptiFauna

- **Animales (`AnimalsModule`)**: `ReproductionRecord.animalId` → `animals.id`. El filtro por finca de `upcoming-births` usa `animal.farmId`.
- **Finanzas (`FinanceModule`)**: `getReproductiveStatus(animalId)` queda exportado para futuros indicadores de productividad por lactancia.
- **Frontend / app móvil**: `status`, `open-days` y `upcoming-births` son las tres pantallas de alertas reproductivas del ganadero.
