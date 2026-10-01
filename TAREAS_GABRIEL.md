# 📋 Plan de Trabajo: Módulos de Gabriel

Este documento detalla los siguientes pasos de desarrollo e implementación requeridos para los módulos bajo tu responsabilidad en la arquitectura de **OptiFauna**.

Actualmente estás trabajando en la rama `feature/Gabriel-modulos`.

---

## 1. Módulo de Fincas / Configuración (`FarmsModule`)

Este módulo es fundamental porque otros dominios (como animales y finanzas) dependen lógicamente de la existencia de una finca. 

### 📌 Objetivos del Módulo
- Registrar y administrar fincas/propiedades ganaderas.
- Manejar la asociación de trabajadores/usuarios a una finca con distintos roles (dueño, trabajador, veterinario).

### 🛠️ Tareas a Implementar

- [ ] **Completar Entidades (`Farm`)**:
  - Definir las relaciones en TypeORM. Una finca (`Farm`) debe poder relacionarse con los usuarios (ej. tabla intermedia `FarmUsers` o roles).
  - Agregar campos adicionales si son necesarios (ej. tamaño de la finca, ubicación geográfica exacta, etc).
- [ ] **Creación de la Finca (`POST /farms`)**:
  - Implementar la lógica real en `FarmsService.createFarm()`.
  - Asegurar de que quien crea la finca quede automáticamente asignado como el dueño (owner) de la misma.
- [ ] **Asignación de Trabajadores (`POST /farms/:id/workers`)**:
  - Implementar la lógica en `FarmsService.assignWorker()`.
  - Debe recibir un `userId` y un `role` (ej. Worker, Veterinarian).
  - Validar que la finca exista y que el usuario que hace la solicitud tenga permisos para agregar trabajadores (lógica de roles/autorización futura).
- [ ] **Mejoras de DTOs**:
  - Actualizar `AssignWorkerDto` para incluir el campo de `role` u otros datos necesarios para la asociación.

---

## 2. Módulo de Finanzas (`FinanceModule`)

Este módulo se encarga del rastreo de costos operativos y rendimiento de producción (ej. leche, ganancia de peso), para calcular la viabilidad y el ROI (Retorno de Inversión) de los animales.

### 📌 Objetivos del Módulo
- Registrar los rendimientos (ingresos/producción) diarios de cada animal.
- Registrar los gastos (alimentación, salud, laborales) a nivel de animal o a nivel de finca.
- Calcular el rendimiento financiero (ROI).

### 🛠️ Tareas a Implementar

- [ ] **Mejorar la Entidad (`FinanceRecord`)**:
  - Definir relaciones TypeORM: Un `FinanceRecord` debería relacionarse con `Animal` (si el gasto/ingreso es individual) o con `Farm` (si es un gasto general de la finca).
- [ ] **Registro de Rendimiento/Producción (`POST /finance/yields`)**:
  - Implementar `FinanceService.registerYield()`.
  - Lógica para guardar registros de producción (ej. litros de leche ordenados, peso ganado). Debe validar que el animal exista antes de registrar el dato.
- [ ] **Registro de Gastos (`POST /finance/expenses`)**:
  - Implementar `FinanceService.registerExpense()`.
  - Guardar compras de insumos, pagos de nómina, o costos médicos.
- [ ] **Cálculo de Rentabilidad / ROI (`GET /finance/roi/:animalId`)**:
  - Implementar el algoritmo en `FinanceService.calculateAnimalProfitability()`.
  - **Lógica de negocio clave**: Debe consultar todos los ingresos asociados al animal (`YIELD`) y restarle los costos directos asociados (`EXPENSE`). 
  - (Opcional por ahora pero importante a futuro): Considerar los gastos generales de la finca divididos entre el total de animales para dar un ROI más exacto.

---

## 💡 Próximos Pasos (Flujo de Git)

1. Ve completando los *TODOs* modificando los servicios, DTOs y entidades en las carpetas `src/farms/` y `src/finance/`.
2. Prueba que la aplicación siga compilando correctamente con `npm run build`.
3. Cuando vayas terminando hitos, haz commits atómicos. Ej: `git commit -m "feat(farms): implementa relacion y creacion de fincas"`.
4. Una vez culmines las tareas, haz push a tu rama y crea un Pull Request hacia `develop`:
   ```bash
   git push origin feature/Gabriel-modulos
   ```
