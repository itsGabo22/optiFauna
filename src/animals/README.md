# 🐾 Módulo de Animales (`AnimalsModule`)

El **Módulo de Animales** de **OptiFauna** es el núcleo de gestión y trazabilidad del ganado y fauna productiva en el sistema. Permite el registro individual, consulta con filtros por estado/sexo/especie/finca, control de inventario del hato, baja trazable sin borrado físico (exigencia del ICA) y consulta de genealogía y descendencia mediante un identificador único (**`tagId`** / chapeta QR o RFID).

---

## 📋 Responsable
- **Desarrollador:** Gabriel
- **Rama de desarrollo:** `feature/animals`

---

## 📁 Estructura del Módulo

```text
src/animals/
├── dto/
│   ├── create-animal.dto.ts   # DTO para validación en la creación de animales
│   ├── update-animal.dto.ts   # DTO para validación en la actualización parcial
│   ├── query-animals.dto.ts   # Filtros de consulta para GET /animals
│   └── change-status.dto.ts   # DTO para dar de baja un animal (PATCH /animals/:tagId/status)
├── entities/
│   └── animal.entity.ts       # Entidad TypeORM que mapea la tabla 'animals'
├── animals.controller.ts      # Controlador REST con los endpoints expuestos
├── animals.module.ts          # Módulo de NestJS que encapsula el dominio
├── animals.service.ts         # Capa de servicio con la lógica de negocio
└── README.md                  # Documentación del módulo
```

---

## 🗄️ Modelo de Datos (`Animal`)

La entidad se mapea a la tabla `animals` en la base de datos con los siguientes atributos:

| Campo | Tipo | Restricciones / Modificadores | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Autogenerado | Identificador interno único en el sistema. |
| `tagId` | `varchar` | Unique, Not Null | Arete / chapeta QR o RFID del animal. |
| `name` | `varchar` | Nullable | Nombre común del animal (ej. `"Mariposa"`). |
| `species` | `varchar` | Not Null | Especie del animal (ej. `"Bovino"`, `"Caprino"`, `"Ovino"`, `"Porcino"`). |
| `breed` | `varchar` | Not Null | Raza del animal (ej. `"Holstein"`, `"Jersey"`, `"Normando"`). |
| `sex` | `enum AnimalSex` | Default `FEMALE` | `MALE` o `FEMALE`. |
| `birthDate` | `date` | Not Null (`YYYY-MM-DD`) | Fecha de nacimiento del animal. |
| `weightKg` | `decimal(6,2)` | Nullable | Peso actual en kilogramos. |
| `status` | `enum AnimalStatus` | Default `ACTIVE` | `ACTIVE`, `SOLD`, `DECEASED`, `CULLED`. |
| `statusChangedAt` | `date` | Nullable (`YYYY-MM-DD`) | Fecha en la que el animal cambió a un estado de baja. |
| `statusReason` | `varchar` | Nullable | Motivo de la baja (venta, muerte, descarte). |
| `farmId` | `uuid` | Nullable, FK → `farms.id` (`SET NULL`) | Finca a la que pertenece el animal. |
| `motherId` | `uuid` | Nullable, FK → `animals.id` (`SET NULL`) | Madre del animal (trazabilidad genealógica). |
| `fatherId` | `uuid` | Nullable, FK → `animals.id` (`SET NULL`) | Padre del animal. |
| `createdAt` | `timestamp` | Autogenerado (`@CreateDateColumn`) | Fecha y hora de registro en el sistema. |
| `updatedAt` | `timestamp` | Autogenerado (`@UpdateDateColumn`) | Fecha y hora de la última modificación. |

---

## 🚀 Endpoints de la API

La ruta base del controlador es:  
`http://localhost:<PORT>/animals`

### Resumen de Rutas

| Método | Endpoint | Descripción | Códigos HTTP |
| :---: | :--- | :--- | :---: |
| `POST` | `/animals` | Registra un nuevo animal en el sistema | `201`, `400` |
| `GET` | `/animals` | Lista animales paginados con filtros (`farmId`, `status`, `sex`, `species`, `page`) | `200`, `400` |
| `GET` | `/animals/:tagId` | Obtiene el detalle de un animal por su identificador/chapeta | `200`, `404` |
| `PUT` | `/animals/:tagId` | Actualiza los datos de un animal existente | `200`, `404`, `400` |
| `PATCH` | `/animals/:tagId/status` | Registra la baja de un animal (`SOLD`, `DECEASED`, `CULLED`) conservando su historial | `200`, `400`, `404` |
| `GET` | `/animals/:tagId/offspring` | Lista las crías (`motherId` o `fatherId`) de un animal | `200`, `404` |

---

### Detalle de Endpoints

#### 1. Crear Animal
Crea un nuevo registro de animal validando los datos requeridos.

- **Método:** `POST`
- **Ruta:** `/animals`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la petición (`CreateAnimalDto`):**

```json
{
  "tagId": "BOV-2026-001",
  "name": "Mariposa",
  "species": "Bovino",
  "breed": "Holstein",
  "sex": "FEMALE",
  "birthDate": "2024-05-15",
  "weightKg": 480.5,
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11"
}
```

- **Validaciones:**
  - `tagId`: Cadena de texto no vacía (`@IsString`, `@IsNotEmpty`). Debe ser único en base de datos.
  - `species`: Cadena de texto no vacía (`@IsString`, `@IsNotEmpty`).
  - `breed`: Cadena de texto no vacía (`@IsString`, `@IsNotEmpty`).
  - `birthDate`: Formato fecha válido `YYYY-MM-DD` (`@IsDateString`, `@IsNotEmpty`).
  - `name`, `sex` (`AnimalSex`), `weightKg`, `status` (`AnimalStatus`), `farmId`, `motherId`, `fatherId`: Opcionales.

- **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "tagId": "BOV-2026-001",
  "name": "Mariposa",
  "species": "Bovino",
  "breed": "Holstein",
  "sex": "FEMALE",
  "birthDate": "2024-05-15",
  "weightKg": 480.5,
  "status": "ACTIVE",
  "statusChangedAt": null,
  "statusReason": null,
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "motherId": null,
  "fatherId": null,
  "createdAt": "2026-11-11T17:45:00.000Z",
  "updatedAt": "2026-11-11T17:45:00.000Z"
}
```

---

#### 2. Listar Animales (Paginado y con Filtros)
Obtiene una lista paginada de animales (10 registros por página) y el total de coincidencias.

- **Método:** `GET`
- **Ruta:** `/animals`
- **Parámetros de consulta (`QueryAnimalsDto`):**
  - `farmId` *(opcional)*: UUID de la finca para filtrar el hato.
  - `status` *(opcional)*: `ACTIVE`, `SOLD`, `DECEASED`, `CULLED` o `ALL`. **Por defecto devuelve solo animales `ACTIVE`.** Para incluir dados de baja, enviar `status=ALL`.
  - `sex` *(opcional)*: `MALE` o `FEMALE`.
  - `species` *(opcional)*: Especie del animal (ej. `Bovino`).
  - `page` *(opcional)*: Número entero ≥ 1. Por defecto `1`.

- **Ejemplo de Petición:**
```http
GET /animals?farmId=7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11&sex=FEMALE&page=1 HTTP/1.1
Host: localhost:3000
```

- **Respuesta Exitosa (`200 OK`):**
```json
{
  "data": [
    {
      "id": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
      "tagId": "BOV-2026-001",
      "name": "Mariposa",
      "species": "Bovino",
      "breed": "Holstein",
      "sex": "FEMALE",
      "birthDate": "2024-05-15",
      "weightKg": "480.50",
      "status": "ACTIVE",
      "statusChangedAt": null,
      "statusReason": null,
      "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
      "motherId": null,
      "fatherId": null,
      "createdAt": "2026-11-11T17:45:00.000Z",
      "updatedAt": "2026-11-11T17:45:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### 3. Consultar Animal por `tagId`
Busca un animal por su identificador único (arete/chapeta).

- **Método:** `GET`
- **Ruta:** `/animals/:tagId`
- **Parámetros de ruta:**
  - `tagId`: Código único del animal (ej: `BOV-2026-001`).

- **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "tagId": "BOV-2026-001",
  "name": "Mariposa",
  "species": "Bovino",
  "breed": "Holstein",
  "sex": "FEMALE",
  "birthDate": "2024-05-15",
  "weightKg": "480.50",
  "status": "ACTIVE",
  "statusChangedAt": null,
  "statusReason": null,
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "motherId": null,
  "fatherId": null,
  "createdAt": "2026-11-11T17:45:00.000Z",
  "updatedAt": "2026-11-11T17:45:00.000Z"
}
```

- **Respuesta de Error (`404 Not Found`):**
```json
{
  "message": "Animal with tagId BOV-9999-999 not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

#### 4. Actualizar Datos de un Animal
Permite modificar los datos básicos de un animal identificado por su `tagId`.

- **Método:** `PUT`
- **Ruta:** `/animals/:tagId`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la petición (`UpdateAnimalDto`):** Todos los campos son opcionales.

```json
{
  "name": "Mariposa II",
  "breed": "Jersey",
  "weightKg": 495
}
```

- **Respuesta Exitosa (`200 OK`):** El registro `Animal` actualizado.

---

#### 5. Dar de Baja / Cambiar Estado de un Animal
Cambia el estado de un animal a `SOLD`, `DECEASED` o `CULLED` sin borrarlo de la base de datos para conservar la trazabilidad sanitaria y reproductiva exigida por el ICA.

- **Método:** `PATCH`
- **Ruta:** `/animals/:tagId/status`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la petición (`ChangeStatusDto`):**

```json
{
  "status": "SOLD",
  "date": "2026-11-11",
  "reason": "Venta en feria ganadera de Guachucal"
}
```

- **Validaciones:**
  - `status`: Obligatorio, valor de `AnimalStatus` distinto de `ACTIVE` (`SOLD`, `DECEASED`, `CULLED`).
  - `date`: Obligatorio, fecha `YYYY-MM-DD` (`@IsDateString`).
  - `reason`: Opcional (`@IsString`).

- **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "tagId": "BOV-2026-001",
  "name": "Mariposa",
  "species": "Bovino",
  "breed": "Jersey",
  "sex": "FEMALE",
  "birthDate": "2024-05-15",
  "weightKg": "495.00",
  "status": "SOLD",
  "statusChangedAt": "2026-11-11",
  "statusReason": "Venta en feria ganadera de Guachucal",
  "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
  "motherId": null,
  "fatherId": null,
  "createdAt": "2026-11-11T17:45:00.000Z",
  "updatedAt": "2026-11-11T18:30:00.000Z"
}
```

---

#### 6. Consultar Crías / Descendencia (`offspring`)
Devuelve todos los animales registrados cuyo `motherId` o `fatherId` coincida con el `id` del animal consultado por su `tagId`.

- **Método:** `GET`
- **Ruta:** `/animals/:tagId/offspring`
- **Respuesta Exitosa (`200 OK`):**
```json
[
  {
    "id": "9f2a1d88-3c4b-4e1a-8f00-112233445566",
    "tagId": "BOV-2027-014",
    "name": "Lucero",
    "species": "Bovino",
    "breed": "Holstein",
    "sex": "FEMALE",
    "birthDate": "2027-08-19",
    "weightKg": "34.00",
    "status": "ACTIVE",
    "statusChangedAt": null,
    "statusReason": null,
    "farmId": "7a1d2c90-1b1e-4f6d-9c1e-5d2f0d9c1a11",
    "motherId": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
    "fatherId": null,
    "createdAt": "2027-08-19T12:00:00.000Z",
    "updatedAt": "2027-08-19T12:00:00.000Z"
  }
]
```
- **Error (`404 Not Found`):** Si el `tagId` consultado no existe.

---

## 🔗 Integraciones en OptiFauna

El módulo `AnimalsModule` exporta `AnimalsService` con los siguientes métodos de contrato para los demás módulos:

- `findByTagId(tagId: string): Promise<Animal>` — Busca por chapeta o lanza `NotFoundException`.
- `findByFarm(farmId: string): Promise<Animal[]>` — Devuelve los animales de una finca.
- `countByFarm(farmId: string, status = AnimalStatus.ACTIVE): Promise<number>` — Cuenta animales por finca y estado (usado por `HealthModule` para calcular el porcentaje de cobertura vacunal en el reporte ICA).
