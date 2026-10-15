# Implementation Plan: Gestión de tareas personales con task-cli

**Branch**: `001-gestionar-tareas` (identificador del resolutor; sin rama Git creada)
| **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)

**Input**: `specs/001-gestionar-tareas/spec.md`

## Summary

Construir un CLI personal sin conexión con cinco comandos: crear, listar, cambiar
estado, editar y eliminar tareas. Usar funciones TypeScript, Commander.js y acceso
directo a SQLite con `better-sqlite3`. Conservar datos en `~/.task-cli/tasks.db`.
Publicar un ejecutable JavaScript compilado y usar `tsx` para desarrollo directo.
Validar la instalación global y todos los flujos en Windows, macOS y Linux.

## Technical Context

**Language/Version**: TypeScript 5.9 en modo estricto; Node.js 24.x LTS; ESM y
resolución `NodeNext`, con extensiones `.js` en imports locales emitidos.

**Primary Dependencies**: Commander.js, `better-sqlite3`, `cli-table3` en ejecución;
TypeScript, `tsx`, Vitest, `@types/node` y `@types/better-sqlite3` en desarrollo.
Fijar versiones compatibles con Node.js 24 mediante `package-lock.json` al implementar.
No incorporar ORMs, frameworks de capas, librerías de prompts ni de colores.

**Storage**: SQLite local, inicialización idempotente, tabla `tasks`, esquema versión 1
mediante `PRAGMA user_version`. Consultas parametrizadas y transacciones breves.

**Testing**: Vitest para toda lógica de negocio; integración con SQLite temporal real;
procesos CLI para contratos de argumentos, streams y códigos de salida; confirmación
con entrada inyectada en pruebas y verificación manual en terminal real por plataforma.
No umbral porcentual de cobertura. Matriz: Windows Server 2022 x64, Ubuntu 24.04 x64
y macOS 14 arm64, con Node.js 24.x LTS; registrar versiones exactas en cada ejecución.

**Target Platform**: Windows, macOS y Linux con Node.js 24.x y npm. La matriz anterior
es el mínimo de validación, no una promesa sobre todas las arquitecturas o versiones históricas.

**Project Type**: CLI instalable globalmente mediante npm; paquete inicial `task-cli`
versión `0.1.0`, con `bin.task-cli` apuntando a `dist/cli.js`.

**Performance Goals**: Con 1.000 tareas, al menos el 95 % de listados completos en
menos de un segundo, medidos desde lanzamiento de proceso hasta salida completa.
Medir sin contención y registrar el equipo; validar también exactitud y orden.

**Constraints**: Sin red en operaciones de tareas, sin stack traces, códigos 0/1,
sin reutilización de IDs, cambios atómicos, transiciones cerradas y confirmación de
borrado excepto `--force`. Mantener las cinco columnas de listado identificables.

**Scale/Scope**: Una colección personal por directorio de usuario; referencia de 1.000
tareas; cinco historias. No cuentas, sincronización, vencimientos, subtareas, relaciones,
tags, categorías, web ni API REST.

## Constitution Check

Evaluación previa a la investigación: **APROBADA**. Las decisiones iniciales respetan
los diez principios y no requieren excepciones. Revisión posterior al diseño:
**APROBADA** conforme a la siguiente trazabilidad; se evalúa el diseño, no una implementación.

| Principio | Evidencia en el diseño |
|-----------|-----------------------|
| I. TypeScript y Node.js LTS | TypeScript estricto, Node.js 24 LTS y `tsx` para ejecución directa |
| II. SQLite local | `better-sqlite3`, `os.homedir()` y `~/.task-cli/tasks.db` |
| III. Estructura simple | `commands/`, `db/`, `utils/`; sin capas de servicios o repositorios |
| IV. Estilo funcional | Funciones puras para validación y transiciones; tipos PascalCase |
| V. Commander.js | Registro y análisis de los cinco comandos en `cli.ts` |
| VI. Errores | Mensajes españoles accionables, sin stack traces, salida 0/1 |
| VII. Pruebas | Vitest obligatorio para lógica de negocio y casos inválidos |
| VIII. Dependencias | Tres dependencias de ejecución exigidas o autorizadas; sin ORM |
| IX. Salida | Tabla `cli-table3`, texto legible, sin colores en esta versión |
| X. Instalación global | `bin`, shebang portable, paquete compilado y pruebas desde tarball |

El pendiente administrativo de ratificación de la constitución se conserva en su
documento; no altera los principios ni bloquea este diseño.

## Project Structure

### Documentation (this feature)

```text
specs/001-gestionar-tareas/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli.md
└── checklists/
    └── requirements.md
```

`tasks.md` se generará posteriormente mediante `/speckit.tasks`.

### Source Code (repository root)

Estructura propuesta para la implementación:

```text
cli.ts
types.ts
commands/
├── add.ts
├── list.ts
├── status.ts
├── update.ts
└── delete.ts
db/
├── connection.ts
├── schema.ts
└── tasks.ts
utils/
├── validation.ts
├── transitions.ts
├── output.ts
├── errors.ts
└── confirmation.ts
tests/
├── unit/
├── integration/
├── cli/
└── helpers/
    └── environment.ts
scripts/
└── benchmark.ts
package.json
package-lock.json
tsconfig.json
tsconfig.build.json
vitest.config.ts
README.md
dist/                         # Salida generada; no editar a mano
```

**Structure Decision**: Un único paquete con directorios funcionales en la raíz.
`cli.ts` configura Commander y captura errores; cada comando coordina validación,
funciones de `db/tasks.ts` y salida. `types.ts` declara `Task`, `TaskStatus`,
`TaskPriority` y entradas de creación/edición sin clases propias.

`db/connection.ts` resuelve la ruta con `os.homedir()` y `path.join`, crea el
directorio necesario y cierra la conexión en `finally`. La ayuda no abre la base.
`db/schema.ts` inicializa versión 1 y rechaza versiones futuras desconocidas sin
modificarlas. `db/tasks.ts` contiene SQL parametrizado; `utils/transitions.ts`
define la única tabla de transiciones. Las funciones reciben dependencias pequeñas
(conexión, streams, reloj o confirmación), sin contenedor de inyección ni abstracciones de capas.

## Complexity Tracking

Sin violaciones constitucionales ni excepciones de complejidad.

## Phase 0: Investigación

Las decisiones, alternativas y fuentes se consolidan en [research.md](research.md):
distribución global, dependencias nativas, identidad, transacciones, representación,
errores, salida y aislamiento de pruebas. No quedan decisiones funcionales pendientes.

## Phase 1: Diseño y validación

- [data-model.md](data-model.md): campos, restricciones, invariantes y transiciones.
- [contracts/cli.md](contracts/cli.md): comandos, opciones, streams y resultados.
- [quickstart.md](quickstart.md): instalación, recorrido funcional, errores, empaquetado
  y aceptación multiplataforma. Los comandos se ejecutarán tras implementar el CLI.

### Estrategia de implementación posterior

1. Preparar paquete, compilación, conexión, esquema, validaciones y salida compartida.
2. Entregar US1 (creación) y US2 (listado) como primer incremento utilizable.
3. Añadir US3 (estado), US4 (edición) y US5 (eliminación), con pruebas de negocio.
4. Verificar tarball global, tres plataformas, rendimiento y evaluación de usuarios.

### Estrategia de pruebas y aceptación

- US1: valores predeterminados, títulos, prioridades, persistencia y no reutilización.
- US2: filtros individuales y combinados, cinco columnas, vacío, empate y textos extensos.
- US3: los nueve pares de estados, ID inválido/inexistente y actualización atómica.
- US4: edición parcial y múltiple, descripción vacía y rechazo íntegro de datos inválidos.
- US5: respuestas afirmativas/negativas, entrada no TTY, `--force`, cancelación y ausencia.
- Transversal: errores de almacenamiento, bloqueos, códigos 0/1, ausencia de stack traces,
  Unicode, directorios distintos, proceso nuevo y datos separados por entorno de prueba.
- Empaquetado: construir y empaquetar una vez; instalar el tarball sin dependencias de
  desarrollo y ejecutar el comando mediante el mecanismo nativo de cada sistema.
- SC-001/006: sesión manual con cinco usuarios; SC-002: al menos 100 listados con 1.000
  tareas; SC-003–005/007: resultados automatizados y comprobación interactiva documentada.

La documentación de diseño queda completa al cerrar esta fase; la ejecución de pruebas,
instalación y mediciones corresponde a la implementación y no se da por realizada aquí.
