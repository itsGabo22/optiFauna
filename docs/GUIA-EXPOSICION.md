# 🎤 Guía de exposición — OptiFauna (Backend)

Guion para socializar el proyecto. Dice **qué explica cada integrante**, en qué orden, y
los **conceptos clave** que hay que dominar (controllers, DTOs, entities, servicios,
GitHub y Docker). La idea es que cualquiera pueda seguir este documento y presentar sin
improvisar.

- **Duración sugerida:** 12–18 min + demo en vivo.
- **Proyecto:** backend de la Plataforma de Ganadería Inteligente (Pasto, Nariño).
- **Stack:** NestJS + TypeORM + PostgreSQL, documentado con Swagger.

---

## 0. Orden de la presentación

| # | Bloque | Responsable | Minutos |
| :-: | :--- | :--- | :-: |
| 1 | Introducción y problema que resuelve | Cualquiera (Cristian) | 2 |
| 2 | Arquitectura de un módulo (entity, dto, controller, service) | **Cristian** | 3 |
| 3 | Cómo trabajamos juntos con GitHub | **Cristian** | 2 |
| 4 | Módulos de **Animales y Salud** + demo | **Gabo** | 3 |
| 5 | Módulos de **Reproducción y Nutrición** + demo | **Cristian** | 3 |
| 6 | Módulos de **Finanzas y Fincas** + demo (costo por litro) | **Carlos** | 3 |
| 7 | Docker y cierre | **Cristian** | 2 |

> Ajusten quién hace los bloques 1, 2, 3 y 7 según prefieran. Aquí se asignaron a Cristian
> por ser la parte transversal, pero lo importante es que **cada uno domine sus 2 módulos**.

---

## 1. Introducción (2 min)

Qué decir, en palabras simples:

- En el campo de Nariño la ganadería se maneja **en papel o de memoria**. No se sabe el
  costo real de cada vaca ni se lleva la trazabilidad sanitaria que exige el **ICA**.
- OptiFauna es el **backend** (el cerebro y la base de datos) de una plataforma que
  digitaliza todo eso: cada animal tiene una **chapeta** (código QR/RFID = `tagId`) y
  alrededor de ese identificador se registran salud, reproducción, nutrición y finanzas.
- El resultado: reportes automáticos como **costo por litro de leche**, **cobertura de
  vacunación para el ICA** y **alertas de partos y celos**.
- Hoy mostramos el backend funcionando: una **API REST** documentada con **Swagger**.

---

## 2. Arquitectura de un módulo (3 min) — la parte que la profe más valora

Explicar **cómo está organizado un módulo** usando uno como ejemplo (sirve cualquiera;
aquí usamos `animals`). Todos los módulos siguen la misma estructura:

```text
src/animals/
├── entities/animal.entity.ts     ← la TABLA en la base de datos
├── dto/create-animal.dto.ts      ← qué datos ENTRAN y cómo se validan
├── animals.controller.ts         ← las RUTAS (endpoints) de la API
├── animals.service.ts            ← la LÓGICA de negocio
└── animals.module.ts             ← une todo lo anterior
```

Explicar cada pieza con una frase clara y mostrando el archivo:

### a) Entity (entidad) — `*.entity.ts`
> "Es la **representación de una tabla** de la base de datos como una clase. Cada
> `@Column` es una columna; `@PrimaryGeneratedColumn('uuid')` es la llave primaria.
> TypeORM lee estas clases y, con `synchronize: true`, **crea las tablas solas**."

Mostrar en `animal.entity.ts`: `@Entity('animals')`, `tagId` como `@Column({ unique: true })`,
y una **relación** `@ManyToOne` / `@OneToMany` (por ejemplo, un animal tiene muchos
`healthRecords`). Decir: "así conectamos tablas: un animal pertenece a una finca y tiene
muchos registros de salud".

### b) DTO (Data Transfer Object) — `dto/*.dto.ts`
> "Define **qué campos acepta un endpoint y qué reglas deben cumplir**, usando decoradores
> de `class-validator`. Si alguien manda un dato inválido, NestJS lo rechaza con un error
> 400 **antes** de tocar la base de datos."

Mostrar en `create-animal.dto.ts`: `@IsString()`, `@IsNotEmpty()`, `@IsDateString()`,
`@IsOptional()`. Decir: "es nuestro **filtro de seguridad y calidad** de los datos".
Mencionar que el `ValidationPipe` global con `whitelist: true` **descarta** cualquier campo
que no esté en el DTO.

### c) Controller (controlador) — `*.controller.ts`
> "Define las **rutas** (URLs) de la API y qué método responde cada una. Solo recibe la
> petición y la pasa al servicio; no tiene lógica."

Mostrar `@Controller('animals')` y un `@Post()` / `@Get(':tagId')`. Explicar: `@Body()`
recibe el JSON (validado por el DTO), `@Param()` toma algo de la URL, `@Query()` los
filtros `?page=1`.

### d) Service (servicio) — `*.service.ts`
> "Aquí está la **lógica de negocio**: crear, buscar, calcular. Habla con la base de datos
> a través del **repositorio** de TypeORM (`this.animalRepository`)."

Mostrar un método como `findByTagId` y señalar el `throw new NotFoundException(...)`
cuando no existe.

### e) Module — `*.module.ts`
> "Es el **ensamblador**: declara el controlador y el servicio, registra las entidades con
> `TypeOrmModule.forFeature([...])` y puede **exportar** su servicio para que otros módulos
> lo usen."

Cerrar el bloque con la idea grande:
> "Este patrón **entity → dto → controller → service** se repite **idéntico en los 6
> módulos**. Eso hace el código ordenado, predecible y fácil de repartir entre nosotros."

Mostrar en **Swagger** la sección **Schemas** (abajo del todo): ahí aparecen todos los DTOs
y entidades generados automáticamente. "Esto confirma visualmente la estructura que
acabamos de explicar."

---

## 3. Cómo trabajamos juntos con GitHub (2 min)

Apoyarse en [`docs/FLUJO-GITHUB.md`](FLUJO-GITHUB.md). Puntos a contar:

- El proyecto se **repartió en módulos** (ver tabla abajo); cada quien en **su rama de
  feature** (`feature/animals`, `feature/reproduction`, etc.).
- `main` es la rama **estable**; nadie trabaja directo ahí.
- Cada cambio entra por **Pull Request** que **revisa otro compañero** antes de hacer merge.
  Así evitamos romper el trabajo de los demás y revisamos calidad.
- Usamos **commits atómicos** con mensajes claros tipo `feat(reproduction): ...`, para que
  el historial se entienda y se pueda revertir algo puntual.
- Definimos **contratos entre módulos** (en el README): por ejemplo, Finanzas usa un método
  que expone Nutrición (`getFeedCostForAnimal`) sin meterse en su código.

> Frase de cierre: "GitHub fue nuestra forma de **trabajar en paralelo sin pisarnos**:
> ramas separadas, revisión cruzada y una rama `main` siempre funcional."

Reparto de módulos:

| Integrante | Módulos |
| :--- | :--- |
| **Gabo** | Animales (`AnimalsModule`), Salud (`HealthModule`) |
| **Cristian** | Reproducción (`ReproductionModule`), Nutrición (`NutritionModule`) |
| **Carlos** | Finanzas (`FinanceModule`), Fincas (`FarmsModule`) |

---

## 4. Gabo — Animales y Salud (3 min)

**Qué explicar (código):** abrir `src/animals/` y `src/health/` y mostrar que siguen la
misma estructura del bloque 2. Resaltar:

- **Animales** es el **núcleo**: todo gira alrededor del `tagId` (la chapeta). Endpoints de
  crear, listar con filtros (`status`, `sex`, `species`), buscar por chapeta, actualizar, y
  **dar de baja** sin borrar (`PATCH /animals/:tagId/status`) para conservar la
  trazabilidad. Mencionar `GET /animals/:tagId/offspring` (crías).
- **Salud** registra vacunas, tratamientos y desparasitaciones, y genera el **reporte ICA**
  con **cobertura de vacunación**, que es justo lo que pide la norma.

**Demo en vivo (Swagger):**
1. `POST /farms` → crear finca, copiar el `id`.
2. `POST /animals` → crear vaca con ese `farmId` y `tagId: "BOV-2026-001"`, copiar el `id`.
3. `GET /animals/BOV-2026-001` → mostrar búsqueda por chapeta.
4. `POST /health/vaccines` → registrar vacuna (con `animalId` y `farmId`).
5. `GET /health/reports/ica?farmId=<id>` → mostrar el reporte con `coveragePercentage`.

---

## 5. Cristian — Reproducción y Nutrición (3 min)

**Qué explicar (código):** abrir `src/reproduction/` y `src/nutrition/`. Resaltar que aquí
hay **lógica de cálculo** (no solo guardar datos), y que los tipos de respuesta se definen
en `interfaces/` para no devolver `any`. Además se usan utilidades de fecha compartidas en
`src/common/utils/date.utils.ts`.

- **Reproducción:** registra celos, inseminaciones, chequeos de preñez, partos y abortos.
  Calcula automáticamente la **fecha probable de parto** (inseminación + 283 días), el
  **estado reproductivo** (`OPEN / INSEMINATED / PREGNANT`), los **días abiertos** (meta 85)
  y las **alertas de partos próximos**.
- **Nutrición:** maneja el **inventario de alimento** (entradas, salidas, alertas de stock
  bajo) y las **dietas por animal**, y calcula el **costo de alimentación por animal**, que
  es el dato que luego usa Finanzas para el costo por litro.

**Demo en vivo (usar el `animalId` creado por Gabo):**
1. `POST /reproduction/insemination` → mostrar `estimatedDueDate` calculada (+283 días).
2. `GET /reproduction/status/:animalId` → mostrar el estado reproductivo.
3. `POST /nutrition/diets` → asignar dieta con `costPerKg`.
4. `GET /nutrition/cost/:animalId` → mostrar `dailyFeedCost` y `periodFeedCost`.

---

## 6. Carlos — Finanzas y Fincas (3 min)

**Qué explicar (código):** abrir `src/finance/` y `src/farms/`. Resaltar que Finanzas
**cruza información de varios módulos**: ingresos por leche, gastos y el costo de nutrición.

- **Fincas:** administra las fincas y sus trabajadores (roles: dueño, operario,
  veterinario). Es el "contenedor" al que pertenecen los animales.
- **Finanzas:** registra producción de leche (`POST /finance/milk`), gastos y ventas, y
  calcula el indicador estrella del proyecto: **costo por litro de leche** por animal,
  cruzando ingresos, gastos directos y el costo de alimentación que expone Nutrición. Esto
  es lo que le dice al ganadero **si una vaca es rentable o no**.

**Demo en vivo (usar el mismo `animalId`):**
1. `POST /finance/milk` → registrar litros producidos con precio por litro.
2. `GET /finance/cost-per-liter/:animalId` → mostrar `costPerLiter` y `marginPerLiter`
   (precio de venta menos costo real). Explicar que si el margen es negativo, esa vaca
   está dando pérdidas.
3. (Opcional) `GET /finance/summary?farmId=<id>` → balance de toda la finca.

> Frase de cierre del bloque: "Aquí se ve el valor del proyecto: datos sueltos de salud,
> reproducción y nutrición **se convierten en una decisión económica concreta**."

---

## 7. Docker y cierre (2 min)

Mostrar los archivos `Dockerfile` y `docker-compose.yml` y explicar en simple:

- **¿Por qué Docker?** Para que el proyecto **corra igual en cualquier computador** sin
  tener que instalar Node ni PostgreSQL a mano. Se empaqueta todo en **contenedores**.
- **`Dockerfile`:** receta para construir la **imagen de la API**. Es **multietapa**: una
  etapa compila el código (`npm run build`) y otra deja una imagen liviana solo con lo
  necesario para ejecutar.
- **`docker-compose.yml`:** levanta **dos contenedores juntos** — la **base de datos**
  PostgreSQL y la **API** — ya conectados entre sí. La API espera a que la base esté lista
  (`healthcheck`) antes de arrancar.
- **Un solo comando** levanta todo:

  ```bash
  docker compose up --build
  ```

  Y queda la API en `http://localhost:3000` con Swagger en `http://localhost:3000/api`.

> Nota técnica para responder si preguntan: las credenciales **no están escritas** en el
> compose; se leen de variables de entorno (`.env`, que no se sube a GitHub) con valores por
> defecto genéricos. La base se publica en el puerto `5433` del host para no chocar con un
> PostgreSQL instalado localmente.

**Cierre general (cualquiera):**
> "En resumen: un backend ordenado en 6 módulos con el mismo patrón, trabajado en equipo con
> GitHub, documentado con Swagger y empaquetado con Docker. Resuelve trazabilidad sanitaria,
> control reproductivo y, sobre todo, le dice al ganadero **cuánto le cuesta producir cada
> litro de leche**."

---

## 8. Cómo dejar todo listo ANTES de exponer

1. **Con Docker (recomendado, más limpio):**
   ```bash
   copy .env.example .env      # y ajusta la contraseña si quieres
   docker compose up --build
   ```
   Abrir `http://localhost:3000/api`. Requiere **Docker Desktop abierto**.

2. **Sin Docker (como corre hoy):**
   ```bash
   npm install
   npm run start:dev
   ```
   Requiere PostgreSQL instalado y la base `optifauna` creada; el `.env` con tus
   credenciales. Abrir `http://localhost:3000/api` (o el puerto que diga tu `.env`).

3. **Antes de empezar**, hagan una pasada rápida del flujo de la demo con datos de prueba
   para que no haya sorpresas en vivo, y tengan a mano un `tagId` y los `id` que van
   copiando entre pasos.

---

## 9. Preguntas típicas y respuestas cortas

| Pregunta | Respuesta corta |
| :--- | :--- |
| ¿Por qué NestJS? | Framework de Node estructurado (módulos, inyección de dependencias); ordena el código y escala bien. |
| ¿Qué es un DTO y por qué sirve? | Define y **valida** los datos que entran a un endpoint; evita datos corruptos. |
| ¿Cómo se crean las tablas? | TypeORM las genera desde las entidades con `synchronize: true` (modo desarrollo). |
| ¿Qué es el `tagId`? | El identificador de la chapeta física (QR/RFID) de cada animal; la clave de toda la trazabilidad. |
| ¿Cómo evitaron pisarse en el código? | Ramas por módulo, Pull Requests revisados y contratos entre módulos. Ver `docs/FLUJO-GITHUB.md`. |
| ¿Swagger cómo aparece? | Se configura en `main.ts` con `SwaggerModule`; lee los controladores y DTOs y arma la doc en `/api`. |
| ¿Por qué el margen puede salir negativo? | Porque el costo real (gastos + alimentación) supera el precio de venta del litro: esa vaca no es rentable. |
