# 🔄 Flujo de trabajo en GitHub — OptiFauna

Guía única del proceso de GitHub para el equipo. Describe, de principio a fin, cómo
mover el trabajo entre tu máquina y el repositorio `itsGabo22/optiFauna` sin pisarse
entre integrantes y sin perder nada.

> Las **convenciones de commits** (formato `tipo(modulo): …`, qué es un commit atómico)
> y el **reparto de módulos** están en el [`README.md`](../README.md) raíz. Este
> documento es solo el **flujo de Git/GitHub**.

---

## Índice

1. [Conceptos y ramas](#1-conceptos-y-ramas)
2. [Preparación por única vez](#2-preparación-por-única-vez)
3. [El ciclo de trabajo, paso a paso](#3-el-ciclo-de-trabajo-paso-a-paso)
4. [Pull Requests y merge](#4-pull-requests-y-merge)
5. [Mantener tu rama al día](#5-mantener-tu-rama-al-día)
6. [Comandos de referencia rápida](#6-comandos-de-referencia-rápida)
7. [Problemas comunes y cómo resolverlos](#7-problemas-comunes-y-cómo-resolverlos)
8. [Qué hacer si se reescribió la historia (force-push)](#8-qué-hacer-si-se-reescribió-la-historia-force-push)
9. [Reglas de oro](#9-reglas-de-oro)

---

## 1. Conceptos y ramas

- **`main`** es la rama de **integración**: siempre debe compilar y arrancar. Nadie
  trabaja directamente sobre ella.
- **`develop`** quedó **desactualizada y NO se usa**.
- Cada integrante trabaja en **ramas de feature**, una por módulo:

  | Responsable | Ramas |
  | :--- | :--- |
  | Gabo | `feature/animals`, `feature/health` |
  | Cristian | `feature/reproduction`, `feature/nutrition` |
  | Carlos | `feature/finance`, `feature/farms` |

- El trabajo llega a `main` **solo a través de Pull Requests revisados**, nunca con un
  push directo.

Representación del flujo:

```text
  origin/main  ─────●───────────────●──────────────▶   (solo recibe merges de PR)
                     \              /
feature/tu-modulo     ●──●──●──●──●      (tus commits atómicos aquí)
                     crear   push → PR → review → merge
```

---

## 2. Preparación por única vez

```bash
# 1. Clonar el repositorio
git clone https://github.com/itsGabo22/optiFauna.git
cd optiFauna

# 2. Configurar tu identidad (usa tu nombre y correo reales)
git config user.name "Tu Nombre"
git config user.email "tucorreo@ejemplo.com"

# 3. Instalar dependencias
npm install

# 4. Crear tu archivo de entorno (no se sube: está en .gitignore)
cp .env.example .env     # en Windows (PowerShell): copy .env.example .env
```

Verifica que apuntas al repositorio correcto:

```bash
git remote -v
# origin  https://github.com/itsGabo22/optiFauna.git (fetch)
# origin  https://github.com/itsGabo22/optiFauna.git (push)
```

---

## 3. El ciclo de trabajo, paso a paso

Este es el ciclo que repites **cada vez** que vas a hacer una tarea.

### Paso 1 — Parte siempre desde `main` actualizado

```bash
git checkout main
git pull origin main
```

### Paso 2 — Crea (o retoma) tu rama de feature

```bash
# La primera vez que creas la rama:
git checkout -b feature/tu-modulo

# Si la rama ya existe y vuelves a ella:
git checkout feature/tu-modulo
```

### Paso 3 — Trabaja y haz commits atómicos

Un cambio lógico = un commit. Antes de **cada** commit:

```bash
npm run build     # debe pasar sin errores
npm run lint      # debe pasar sin errores
```

Luego:

```bash
git add <solo-los-archivos-de-ese-cambio>
git commit -m "feat(tu-modulo): descripcion corta en imperativo"
```

> Formato y ejemplos de mensajes: ver [`README.md`](../README.md) → "Flujo de Git y
> commits atómicos".

### Paso 4 — Sube tu rama a GitHub

```bash
# La primera vez que subes la rama:
git push -u origin feature/tu-modulo

# Las siguientes veces, basta:
git push
```

### Paso 5 — Abre un Pull Request (ver sección 4)

### Paso 6 — Tras el merge, vuelve a sincronizar

```bash
git checkout main
git pull origin main
git branch -d feature/tu-modulo      # borra la rama local ya mergeada
```

---

## 4. Pull Requests y merge

1. En GitHub, entra a **Pull requests → New pull request**.
2. **base:** `main` ← **compare:** `feature/tu-modulo`.
3. Título igual que un commit: `feat(health): alertas sanitarias próximas`.
4. En la descripción pega el **checklist de PR** del [`README.md`](../README.md) y lista
   los endpoints o cambios, con una petición de ejemplo por cada uno.
5. Asigna a **otro integrante** como revisor. **Nadie mergea su propio PR.**
6. Si piden cambios: los haces en tu rama, commiteas y vuelves a hacer `git push`. El PR
   se actualiza solo.
7. Cuando esté aprobado y el PR diga **"Able to merge"**, se mergea con **"Create a merge
   commit"** (no "Squash") para conservar los commits atómicos.

Reglas de importación entre módulos y "contratos" (qué puede usar un módulo de otro)
están en el [`README.md`](../README.md) → "Contratos entre módulos".

---

## 5. Mantener tu rama al día

Si `main` avanzó mientras trabajabas (otro integrante mergeó su PR), actualiza tu rama
**antes** de abrir o actualizar el PR, para evitar conflictos al final:

```bash
git checkout feature/tu-modulo
git fetch origin
git rebase origin/main
# si hay conflictos: edítalos, luego:
git add <archivos-resueltos>
git rebase --continue
# cuando termines, al ser una rama tuya:
git push --force-with-lease
```

> `--force-with-lease` es un force-push **seguro**: solo sube si nadie más tocó tu rama
> remota mientras tanto. Úsalo **solo en tu propia rama de feature**, nunca en `main`.

Alternativa sin reescribir historia (si el rebase te complica):

```bash
git checkout feature/tu-modulo
git merge origin/main        # crea un commit de merge; también es válido
git push
```

---

## 6. Comandos de referencia rápida

| Quiero… | Comando |
| :--- | :--- |
| Ver en qué rama estoy y qué cambié | `git status` |
| Ver mis cambios línea por línea | `git diff` |
| Traer lo último de GitHub sin fusionar | `git fetch origin` |
| Actualizar mi `main` local | `git checkout main && git pull origin main` |
| Ver el historial corto | `git log --oneline -15` |
| Ver qué tengo sin subir | `git log --oneline origin/main..HEAD` |
| Deshacer cambios NO commiteados de un archivo | `git restore <archivo>` |
| Guardar temporalmente sin commitear | `git stash` / recuperar: `git stash pop` |
| Cambiar de rama sin perder lo que escribí | `git stash` → cambiar → `git stash pop` |

---

## 7. Problemas comunes y cómo resolverlos

### "Updates were rejected" al hacer push
`main` o tu rama avanzaron en GitHub y tu copia está atrás.

```bash
git pull origin <tu-rama>     # trae lo remoto y fusiona
# resuelve conflictos si los hay, luego:
git push
```

### Tengo un conflicto de merge
Git marca los archivos en conflicto con `<<<<<<<`, `=======`, `>>>>>>>`. Edita cada uno
dejando la versión correcta, borra esas marcas, y:

```bash
git add <archivo-resuelto>
git commit          # (o git rebase --continue si estabas en un rebase)
```

### Hice commit en `main` por error
```bash
git branch feature/mi-rama      # guarda tu commit en una rama nueva
git reset --hard origin/main    # deja main como en GitHub (¡borra cambios locales de main!)
git checkout feature/mi-rama    # sigue trabajando ahí
```

### Me equivoqué en el último mensaje de commit (y aún NO lo subí)
```bash
git commit --amend -m "nuevo mensaje"
```

---

## 8. Qué hacer si se reescribió la historia (force-push)

Si alguien reescribió `main` en GitHub (por ejemplo para limpiar mensajes de commit), tu
copia local queda **desincronizada**: los commits tienen contenido igual pero otro
identificador. Para alinearte:

```bash
# 1. Guarda primero cualquier cambio tuyo sin subir (si lo tienes):
git stash           # o haz commit en tu rama de feature

# 2. Trae el estado real de GitHub:
git fetch origin

# 3. Deja tu main EXACTAMENTE igual al de GitHub:
git checkout main
git reset --hard origin/main

# 4. Si guardaste algo con stash, recupéralo:
git stash pop
```

> `git reset --hard` **borra los cambios no commiteados** de la rama en que estés. Por eso
> el paso 1 (stash o commit) es obligatorio si tienes trabajo sin guardar.
>
> **No se pierde trabajo del proyecto:** reescribir la historia solo cambia los
> identificadores de los commits; el código y los archivos quedan idénticos.

---

## 9. Reglas de oro

1. **Nunca** trabajes ni hagas commit directo sobre `main`. Siempre en tu rama de feature.
2. **Nunca** `git push --force` sobre `main`. En tu propia rama, usa `--force-with-lease`
   y solo si es necesario.
3. **Siempre** `git pull origin main` antes de crear una rama o abrir un PR.
4. **Siempre** `npm run build` y `npm run lint` en verde antes de cada commit.
5. Un PR lo revisa y mergea **otro** integrante.
6. No subas `node_modules/`, `dist/` ni `.env` (ya están en `.gitignore`).
7. Si algo sale raro con Git, **no fuerces nada**: avisa en el chat del equipo antes de
   `reset --hard` o `push --force`.
