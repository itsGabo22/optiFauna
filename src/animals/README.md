# 🐾 Módulo de Animales (`AnimalsModule`)

El **Módulo de Animales** de **OptiFauna** es el núcleo de gestión y trazabilidad del ganado y fauna productiva en el sistema. Permite el registro individual, consulta, control de inventario y actualización de información genealógica y biológica básica de cada ejemplar mediante un identificador único (**tagId** / arete / caravana).

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
│   └── update-animal.dto.ts   # DTO para validación en la actualización parcial
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
| `tagId` | `varchar` | Unique, Not Null | Arete / identificador visual o electrónico del animal. |
| `species` | `varchar` | Not Null | Especie del animal (ej: Bovino, Caprino, Ovino, Porcino). |
| `breed` | `varchar` | Not Null | Raza del animal (ej: Holstein, Brahman, Angus, etc.). |
| `birthDate` | `date` | Not Null (YYYY-MM-DD) | Fecha de nacimiento del animal. |
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
| `GET` | `/animals` | Lista animales con paginación y filtro opcional por finca | `200` |
| `GET` | `/animals/:tagId` | Obtiene el detalle de un animal por su identificador/arete | `200`, `404` |
| `PUT` | `/animals/:tagId` | Actualiza los datos de un animal existente | `200`, `404`, `400` |

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
  "species": "Bovino",
  "breed": "Holstein",
  "birthDate": "2024-05-15"
}
```

- **Validaciones:**
  - `tagId`: Cadena de texto no vacía (`@IsString`, `@IsNotEmpty`). Debe ser único en base de datos.
  - `species`: Cadena de texto no vacía (`@IsString`, `@IsNotEmpty`).
  - `breed`: Cadena de texto no vacía (`@IsString`, `@IsNotEmpty`).
  - `birthDate`: Formato fecha válido ISO/DateString (`@IsDateString`, `@IsNotEmpty`).

- **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "tagId": "BOV-2026-001",
  "species": "Bovino",
  "breed": "Holstein",
  "birthDate": "2024-05-15",
  "createdAt": "2026-10-01T17:45:00.000Z",
  "updatedAt": "2026-10-01T17:45:00.000Z"
}
```

---

#### 2. Listar Animales (Paginado)
Obtiene una lista paginada de animales (10 registros por página por defecto) con el total de registros existentes.

- **Método:** `GET`
- **Ruta:** `/animals`
- **Parámetros de consulta (Query Params):**
  - `page` *(opcional)*: Número de página (ej: `?page=1`). Por defecto es `1`.
  - `farmId` *(opcional)*: Identificador de la finca para filtrado (integración con `FarmsModule`).

- **Ejemplo de Petición:**
```http
GET /animals?page=1 HTTP/1.1
Host: localhost:3000
```

- **Respuesta Exitosa (`200 OK`):**
```json
{
  "data": [
    {
      "id": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
      "tagId": "BOV-2026-001",
      "species": "Bovino",
      "breed": "Holstein",
      "birthDate": "2024-05-15",
      "createdAt": "2026-10-01T17:45:00.000Z",
      "updatedAt": "2026-10-01T17:45:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### 3. Consultar Animal por `tagId`
Busca un animal por su identificador único (arete/caravana).

- **Método:** `GET`
- **Ruta:** `/animals/:tagId`
- **Parámetros de ruta:**
  - `tagId`: Código único del animal (ej: `BOV-2026-001`).

- **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "tagId": "BOV-2026-001",
  "species": "Bovino",
  "breed": "Holstein",
  "birthDate": "2024-05-15",
  "createdAt": "2026-10-01T17:45:00.000Z",
  "updatedAt": "2026-10-01T17:45:00.000Z"
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
Permite modificar los datos básicos de un animal (especie, raza, fecha de nacimiento) identificado por su `tagId`.

- **Método:** `PUT`
- **Ruta:** `/animals/:tagId`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la petición (`UpdateAnimalDto`):** Todos los campos son opcionales.

```json
{
  "species": "Bovino",
  "breed": "Jersey",
  "birthDate": "2024-05-10"
}
```

- **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "e4b95f1c-7389-4a41-b0db-d7903dbf05e2",
  "tagId": "BOV-2026-001",
  "species": "Bovino",
  "breed": "Jersey",
  "birthDate": "2024-05-10",
  "createdAt": "2026-10-01T17:45:00.000Z",
  "updatedAt": "2026-10-01T18:10:00.000Z"
}
```

---

## 🔗 Integraciones en OptiFauna

El módulo `AnimalsModule` exporta su servicio `AnimalsService`, permitiendo su reutilización e integración con los demás dominios del sistema:

- **Módulo de Salud (`HealthModule`):** Registro de vacunas, tratamientos, enfermedades e historial clínico asociado al `tagId` o `id` del animal.
- **Módulo de Reproducción (`ReproductionModule`):** Registro de montas, inseminaciones, preñez, partos y linaje genealógico.
- **Módulo de Nutrición (`NutritionModule`):** Asignación de dietas, raciones y pesajes periódicos por animal.
- **Módulo de Fincas (`FarmsModule`):** Control del hato o rebaño según la ubicación geográfica y potrero dentro de la finca.
