---
description: "Tareas ejecutables para el CLI de gestión de tareas personales"
---

# Tasks: Gestión de tareas personales con task-cli

**Input**: Documentos de `specs/001-gestionar-tareas/`.

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/cli.md](contracts/cli.md) y
[quickstart.md](quickstart.md), revisados el 2026-10-01.

**Tests**: Se incluyen pruebas Vitest porque la especificación incorpora la constitución
y su principio VII exige pruebas para toda lógica de negocio. El plan también requiere
pruebas de integración, contratos CLI y aceptación multiplataforma. No se exige cobertura mínima.

**Organization**: Una fase por historia, con pruebas y criterios independientes.
Las casillas reflejan la ejecución del 2026-10-04. La evidencia está en `validation/`;
las comprobaciones de plataformas y usuarios que no se han ejecutado permanecen pendientes.

## Format: `[ID] [P?] [Story] Description`

- `[P]`: tarea ejecutable junto a las otras indicadas del mismo grupo, una vez completados
  sus prerrequisitos; sus archivos no se solapan.
- `[US1]` a `[US5]`: historia de la especificación correspondiente.
- Cada línea incluye ruta exacta relativa a la raíz. Los IDs son únicos y consecutivos.

## Path Conventions

Paquete único con `cli.ts`, `types.ts`, `commands/`, `db/`, `utils/`, `tests/` y
`scripts/`. No crear `src/`, capas de servicios, repositorios ni clases propias.
Los informes futuros se guardan bajo `specs/001-gestionar-tareas/validation/`.

## Phase 1: Setup (Shared Infrastructure)

**Propósito**: Preparar el paquete y herramientas indicados en el plan.

- [X] T001 Inicializar `package.json` y `package-lock.json` para `task-cli` 0.1.0, Node `>=24 <25`, ESM, dependencias de ejecución Commander.js/better-sqlite3/cli-table3 y desarrollo TypeScript 5.9/tsx/Vitest/@types/node/@types/better-sqlite3; fijar versiones compatibles e instalar sin añadir otras librerías.
- [X] T002 [P] Configurar `tsconfig.json` y `tsconfig.build.json` con modo estricto, NodeNext, objetivo ES2023 e imports locales `.js`; emitir solo fuentes de aplicación a `dist/`, excluyendo pruebas y scripts del paquete compilado.
- [X] T003 [P] Configurar `vitest.config.ts` para pruebas unitarias, de integración y CLI, con aislamiento y cierre de recursos, sin umbral de cobertura.
- [X] T004 [P] Crear `.gitignore` para excluir `node_modules/`, `dist/`, tarballs y archivos SQLite locales, conservando los documentos y el lockfile.
- [X] T005 Configurar scripts `dev`, `typecheck`, `pretest`, `test`, `build`, `prepack` y `benchmark` en `package.json` según `quickstart.md`, con `pretest: npm run build` y `test: vitest run`, además de `bin.task-cli: dist/cli.js` y `files: ["dist"]`; el script benchmark quedará ejecutable cuando se complete T049.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Propósito**: Base mínima común. Completar T006–T015 antes de iniciar historias.

- [X] T006 Declarar `Task`, `TaskStatus`, `TaskPriority`, `CreateTaskInput`, `UpdateTaskInput` y `TaskFilters` en `types.ts`, sin clases; reflejar status «Solo `todo`, `in-progress`, `done`; obligatorio; inicial `todo`» y priority «Solo `high`, `medium`, `low`; obligatorio; predeterminado `medium`», con descripción `string | null`.
- [X] T007 Escribir pruebas compartidas en `tests/unit/validation.test.ts`, `tests/unit/errors.test.ts` y `tests/integration/connection.test.ts` para IDs decimales seguros, trim Unicode, enumeraciones, inicialización repetida, esquema futuro y errores accionables sin stack traces; comprobar fallos antes de implementar T008–T011.
- [X] T008 Implementar esquema inicial en `db/schema.ts` con restricciones del modelo: ID «`INTEGER PRIMARY KEY AUTOINCREMENT`; positivo, único, inmutable, no reutilizable; máximo `9007199254740991`»; título «Obligatorio; aplicar `trim()` antes de validar; longitud resultante mayor que cero; sin máximo de producto»; descripción «Opcional; omisión al crear y cadena vacía equivalen a null; los demás textos se conservan»; estado/prioridad de T006 y fecha «Obligatorio, inmutable; UTC ISO 8601 con milisegundos y `Z`, generado al crear»; reforzar NOT NULL/CHECK, no hacer títulos únicos, inicializar transaccionalmente `user_version = 1` y rechazar versiones futuras sin cambios.
- [X] T009 Implementar apertura/cierre en `db/connection.ts` con `path.join(os.homedir(), ".task-cli", "tasks.db")`, creación del directorio, inicialización idempotente, journal predeterminado y timeout de 1.000 ms; permitir ruta inyectada para pruebas, cerrar en `finally` y no reinicializar archivos corruptos.
- [X] T010 Implementar funciones puras comunes en `utils/validation.ts`: título con trim Unicode y longitud positiva sin máximo artificial; prioridades/estados exactos; ID con solo dígitos decimales, ceros iniciales permitidos, entero seguro positivo hasta `9007199254740991`, rechazando signos, fracciones, exponentes y conversiones parciales.
- [X] T011 Implementar clasificación y mensajes de errores en `utils/errors.ts` para uso inválido, ID ausente, permisos/espacio, corrupción, bloqueo y esquema futuro; usar valores tipados o Error estándar, con acción correctiva y sin clases ni stack traces visibles.
- [X] T012 Implementar utilidades de salida en `utils/output.ts` y pruebas en `tests/unit/output.test.ts` para streams separados, mensajes en español y neutralización de controles al presentar sin alterar el texto almacenado; mantener la salida sin colores.
- [X] T013 Crear arnés en `tests/helpers/environment.ts` con directorios temporales únicos, fixtures SQLite directos, reloj/streams inyectables y lanzamiento de procesos con HOME/USERPROFILE y CWD propios; ejecutar `dist/cli.js` mediante `process.execPath` con argumentos separados y ruta absoluta al ejecutable, después de una compilación actualizada mediante `npm test` (pretest) o `npm run build` antes de invocar Vitest directamente; cerrar procesos/conexiones antes de limpiar y no mutar entorno global concurrentemente.
- [X] T014 Crear entrada `cli.ts` con shebang portable, Commander, fábrica de Command para pruebas, `parseAsync`, `exitOverride`, ayuda/versionado en español y manejo central de errores 0/1; añadir `tests/cli/help.test.ts` para ayuda sin abrir base, versión y errores generales de comando/opción/argumento extra desconocido; incorporar registros específicos al completar cada historia.
- [X] T015 Ejecutar typecheck, build y pruebas comunes definidas en `package.json`; registrar resultados en `specs/001-gestionar-tareas/validation/foundation.md`, comprobando que el arnés no toca el directorio personal real y corrigiendo fallos antes de habilitar las historias.

**Checkpoint**: Conexión, tipos, validación, errores y arnés disponibles. Las historias
pueden validarse con fixtures directos, sin depender de comandos de otras historias.

---

## Phase 3: User Story 1 - Registrar tareas personales (Priority: P1) 🎯 MVP

**Objetivo**: Crear tareas persistentes con valores predeterminados e ID creciente.

**Prueba independiente**: Crear en un directorio temporal y comprobar confirmación y
filas desde una nueva conexión, sin necesitar `list`; borrar una fila mediante fixture
y verificar que el siguiente ID no se reutiliza.

### Tests for User Story 1

- [X] T016 [P] [US1] Escribir pruebas de `add` en `tests/cli/add.test.ts` para título obligatorio, espacios/Unicode, descripción, prioridades, argumentos inválidos, confirmación completa y códigos 0/1 conforme a `contracts/cli.md`; verificar que `task-cli add -- "-Título"` crea correctamente una tarea con título `-Título`.
- [X] T017 [P] [US1] Escribir pruebas en `tests/integration/add.test.ts` para valores predeterminados, títulos repetidos, descripción null/vacía/con espacios, UTC fijo, persistencia en otro proceso/CWD, rollback y no reutilización tras borrar el máximo ID; cubrir agotamiento del entero seguro con fixture.

### Implementation for User Story 1

- [X] T018 [US1] Implementar normalización de creación en `utils/validation.ts` y pruebas en `tests/unit/create.test.ts`: `CreateTaskInput` con título obligatorio y descripción/prioridad opcionales, sin ID/estado/fecha del usuario; «Descripción con espacios no vacíos se conserva; solo `""` borra explícitamente»; omisión al crear equivale a null y prioridad omitida a medium.
- [X] T019 [US1] Implementar inserción parametrizada en `db/tasks.ts` con conexión y reloj recibidos, ID AUTOINCREMENT, estado todo y fecha UTC ISO con milisegundos; devolver fila tras confirmar, revertir ID fuera del rango seguro y conservar invariantes de `data-model.md`.
- [X] T020 [US1] Implementar `commands/add.ts` y registrar `add <title> [--description <text>] [--priority <priority>]` en `cli.ts`; validar antes de escribir y confirmar ID/título/estado/prioridad/fecha y descripción presente solo tras guardado correcto.
- [X] T021 [US1] Ejecutar pruebas de US1 y comunes, typecheck y build; registrar evidencia de los cinco escenarios de US1 y FR-002–004/015 en `specs/001-gestionar-tareas/validation/us1.md`.

**Checkpoint**: US1 funciona sin listado ni otras historias; incremento mínimo demostrable.

---

## Phase 4: User Story 2 - Consultar y filtrar pendientes (Priority: P1)

**Objetivo**: Recuperar tareas en tabla ordenada y filtrar por estado/prioridad.

**Prueba independiente**: Sembrar filas con diferentes fechas, empates, estados y
prioridades; ejecutar list y comparar resultados sin utilizar add.

### Tests for User Story 2

- [X] T022 [P] [US2] Escribir pruebas en `tests/cli/list.test.ts` para cinco columnas, filtros solos/combinados, vacío exitoso, filtros desconocidos, Unicode, textos extensos y saltos de línea sin mezclar columnas.
- [X] T023 [P] [US2] Escribir pruebas en `tests/integration/list.test.ts` para coincidencias exactas de cada enumeración y combinación, orden `created_at DESC, id DESC`, empates deterministas y ausencia de modificación de datos.

### Implementation for User Story 2

- [X] T024 [US2] Implementar consulta parametrizada de listado en `db/tasks.ts` con `TaskFilters`: «estado y prioridad opcionales, combinados con AND»; devolver todas las coincidencias en orden descendente por fecha e ID, sin paginación ni índices extra.
- [X] T025 [US2] Implementar tabla en `utils/output.ts` y extender `tests/unit/output.test.ts` usando cli-table3 con ID/Título/Estado/Prioridad/Creación, fecha UTC explícita, títulos envueltos, controles neutralizados y mensaje vacío, sin descripción ni colores.
- [X] T026 [US2] Implementar `commands/list.ts` y registrar `list [--status <status>] [--priority <priority>]` en `cli.ts`; validar filtros exactos, no convertir filtros inválidos en listado completo y conservar código 0 para vacío.
- [X] T027 [US2] Ejecutar pruebas de US2 y comunes, typecheck y build; registrar los seis escenarios, FR-005–007/016 y conservación de datos en `specs/001-gestionar-tareas/validation/us2.md`.

**Checkpoint**: US2 funciona con fixtures; junto a US1 constituye el MVP utilizable recomendado.

---

## Phase 5: User Story 3 - Avanzar y reabrir el trabajo (Priority: P2)

**Objetivo**: Cambiar estado aplicando exclusivamente las cuatro transiciones válidas.

**Prueba independiente**: Sembrar una tarea para cada par origen/destino; comprobar cuatro
éxitos y cinco rechazos, sin cambios en los otros campos y sin usar add/list.

### Tests for User Story 3

- [X] T028 [P] [US3] Escribir pruebas en `tests/unit/transitions.test.ts` de los nueve pares de estados y pruebas en `tests/integration/status.test.ts` para atomicidad, ausencia de ID, conservación de campos y dos escritores sin validación sobre un estado obsoleto.
- [X] T029 [P] [US3] Escribir pruebas en `tests/cli/status.test.ts` para `status <id> <status>`, ID inválido/inexistente, estados desconocidos, destinos permitidos en errores y confirmación de ID/estado sin stack traces.

### Implementation for User Story 3

- [X] T030 [US3] Implementar matriz y validación pura en `utils/transitions.ts`: permitir solo todo→in-progress, in-progress→done, in-progress→todo y done→todo; rechazar identidad, todo→done y done→in-progress e indicar destinos válidos.
- [X] T031 [US3] Implementar lectura/validación/escritura de estado en transacción inmediata en `db/tasks.ts`, comprobando existencia y estado actual dentro de la misma transacción y actualizando únicamente status.
- [X] T032 [US3] Implementar `commands/status.ts` y registrar `status <id> <status>` en `cli.ts`, usando validadores comunes, mensajes de transición y confirmación posterior al guardado.
- [X] T033 [US3] Ejecutar pruebas de US3 y comunes, typecheck y build; registrar los nueve pares, FR-008/013 y SC-003 en `specs/001-gestionar-tareas/validation/us3.md`.

**Checkpoint**: Transiciones verificadas de forma independiente y seguras frente a escrituras simultáneas.

---

## Phase 6: User Story 4 - Corregir los datos de una tarea (Priority: P2)

**Objetivo**: Editar campos enviados conservando identidad, estado, fecha y campos omitidos.

**Prueba independiente**: Sembrar tarea, aplicar ediciones individuales y conjuntas,
borrar descripción y comprobar rechazo íntegro de una edición mixta inválida.

### Tests for User Story 4

- [X] T034 [P] [US4] Escribir pruebas en `tests/unit/update.test.ts` y `tests/integration/update.test.ts` para campos ausentes frente a vacíos, validación conjunta, edición en cada estado, conservación de ID/fecha/estado y escrituras concurrentes que no sobrescriben campos omitidos.
- [X] T035 [P] [US4] Escribir pruebas en `tests/cli/update.test.ts` para `update <id>`, opciones sin valor, ausencia de campos, descripción vacía pasada como argumento separado, título/prioridad inválidos, ID ausente y confirmación de campos resultantes.

### Implementation for User Story 4

- [X] T036 [US4] Implementar validación de `UpdateTaskInput` en `utils/validation.ts`: «al menos uno de título, descripción o prioridad presente; distinguir propiedad ausente de cadena vacía. Validar todos antes de escribir»; conservar espacios de descripción no vacía y rechazar título vacío tras trim.
- [X] T037 [US4] Implementar edición transaccional parametrizada en `db/tasks.ts` con lista cerrada de columnas editables, comprobación de existencia y actualización exclusiva de propiedades presentes; no permitir modificar ID/status/created_at y revertir cualquier fallo.
- [X] T038 [US4] Implementar `commands/update.ts` y registrar `update <id> [--title <text>] [--description <text>] [--priority <priority>]` en `cli.ts`, preservando argumentos vacíos e informando ID y valores guardados, incluido borrado de descripción.
- [X] T039 [US4] Ejecutar pruebas de US4 y comunes, typecheck y build; registrar los cuatro escenarios, FR-009–010 y rechazo sin cambios parciales en `specs/001-gestionar-tareas/validation/us4.md`.

**Checkpoint**: Ediciones independientes verificadas con fixtures en los tres estados.

---

## Phase 7: User Story 5 - Eliminar tareas con control (Priority: P3)

**Objetivo**: Eliminar solo tras confirmación afirmativa o uso explícito de force.

**Prueba independiente**: Sembrar tareas y probar cancelación/confirmación con streams
inyectados, force y rechazo no TTY mediante procesos; comprobar filas directamente.

### Tests for User Story 5

- [X] T040 [P] [US5] Escribir pruebas en `tests/unit/confirmation.test.ts` y `tests/integration/delete.test.ts` para respuestas s/sí/si/y/yes normalizadas, negativas/vacías/desconocidas, EOF/interrupción, eliminación en cada estado, ID desaparecido durante confirmación y secuencia no reiniciada.
- [X] T041 [P] [US5] Escribir pruebas en `tests/cli/delete.test.ts` para `delete <id> [--force]`, ID inválido/inexistente, force sin pregunta, rechazo de tubería aunque contenga s, códigos 0/1 y ausencia de borrado al cancelar.

### Implementation for User Story 5

- [X] T042 [US5] Implementar `utils/confirmation.ts` con `node:readline/promises`, streams inyectados y verificación TTY; preguntar en stderr con ID/título y `[s/N]`, aceptar solo s/sí/si/y/yes tras trim/minúsculas y cancelar con limpieza en negativa, EOF o interrupción.
- [X] T043 [US5] Implementar consulta por ID y eliminación atómica en `db/tasks.ts`, validando existencia antes de preguntar y filas afectadas al borrar; no mantener transacción durante espera, no reiniciar IDs y autorizar eliminación por el ID confirmado aunque cambien otros campos.
- [X] T044 [US5] Implementar coordinación en `commands/delete.ts`: validar ID/existencia, exigir confirmación salvo force, error inmediato no TTY, cancelación exitosa sin borrar y confirmación de ID solo tras borrado efectivo.
- [X] T045 [US5] Registrar `delete <id> [--force]` en `cli.ts`, esperar acción asíncrona y cerrar conexión/lector antes de terminar; integrar tratamiento de errores y cancelación 0/1.
- [X] T046 [US5] Ejecutar pruebas de US5 y comunes, typecheck y build; registrar los seis escenarios y FR-011–012 en `specs/001-gestionar-tareas/validation/us5.md`, dejando la comprobación TTY real por plataforma para T052.

**Checkpoint**: Las cinco historias son funcionales; validaciones globales pendientes en fase 8.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Propósito**: Verificar paquete, integridad transversal, rendimiento y aceptación real.

- [X] T047 [P] Implementar y ejecutar `tests/integration/storage-failures.test.ts` y `tests/cli/persistence.test.ts` para corrupción, permisos/espacio mediante fixtures o fallos inyectados, bloqueo superior a 1.000 ms, rollback, esquema futuro, reinicio/CWD distinto y funcionamiento sin red; comprobar FR-004/014–015 y SC-004–005.
- [X] T048 [P] Implementar y ejecutar `tests/cli/package.test.ts` para construir/empaquetar e instalar el tarball con `--global --prefix` temporal y `--omit=dev`, verificar binarios Windows/Unix, ayuda sin base, ausencia de herramientas dev y apertura real de SQLite con rutas de espacios/acentos; aislar prefijo y HOME/USERPROFILE.
- [X] T049 Implementar `scripts/benchmark.ts` con 1.000 tareas temporales y al menos 100 listados del JS compilado, comprobando coincidencias/orden y midiendo lanzamiento→salida completa sin excluir calentamientos; ejecutar después de finalizar T047 y T048, sin compilaciones ni suites de pruebas concurrentes, y registrar equipo, percentil 95 y umbral ≥95 % inferior a 1 s en `specs/001-gestionar-tareas/validation/performance.md`.
- [X] T050 [P] Redactar `README.md` con Node 24, instalación global, cinco comandos, ejemplos de comillas/argumentos vacíos, ubicación de datos, transiciones, códigos 0/1 y solución de fallos del addon según la versión fijada; enlazar `specs/001-gestionar-tareas/quickstart.md`.
- [X] T051 Ejecutar typecheck, suite completa y build definidos en `package.json`, resolver regresiones y verificar los diez principios constitucionales; registrar resultados y versiones exactas en `specs/001-gestionar-tareas/validation/final.md` sin afirmar aprobaciones no ejecutadas.
- [ ] T052 Ejecutar `specs/001-gestionar-tareas/quickstart.md` y la suite en Windows Server 2022 x64, Ubuntu 24.04 x64 y macOS 14 arm64 con Node 24, tarball instalado y confirmación en TTY real; registrar cada escenario, versiones y resultados en `specs/001-gestionar-tareas/validation/platforms.md` para SC-007; mantener pendiente cualquier plataforma no disponible.
- [ ] T053 Realizar evaluación con cinco usuarios de SC-001/006 y documentar tiempos, identificación sin colores y corrección de prioridad inválida en `specs/001-gestionar-tareas/validation/usability.md`; exigir al menos cuatro éxitos en cada criterio, recorrido menor de dos minutos y no sustituir participantes por resultados simulados.

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Preparación T001–T005
          ↓
Base común T006–T015
          ├── US1 T016–T021 ──┐
          ├── US2 T022–T027 ──┤
          ├── US3 T028–T033 ──┼── Validación final T047–T053
          ├── US4 T034–T039 ──┤
          └── US5 T040–T046 ──┘
```

- T001 precede T002/T003/T004; T005 cierra preparación.
- En base común, seguir orden numérico. T007 define pruebas inicialmente fallidas;
  T015 es la puerta de salida y requiere todas las tareas anteriores.
- Todas las historias dependen de T015, no de otras historias: fixtures preparan sus datos.
- Para trabajo secuencial, completar US1 → US2 → US3 → US4 → US5, respetando P1/P2/P3.
- T047, T048 y T050 pueden empezar cuando las cinco historias están completas, en
  archivos separados. T049 requiere finalizar T047 y T048 y se ejecuta sin
  reconstrucciones ni suites concurrentes; T050 sigue siendo independiente.
  Ejecutar T051 tras completar T047–T050; T052 y T053 después de T051, registrando evidencia separada.

### User Story Dependencies

La independencia funcional no implica que todos los cambios puedan editarse simultáneamente:
`db/tasks.ts`, `cli.ts`, `utils/validation.ts` y `utils/output.ts` son archivos compartidos.
Serializar sus cambios por historia, integrando US1, US2, US3, US4 y US5 en ese orden
cuando se trabaje en paralelo. Las historias posteriores pueden usar las versiones
compartidas ya integradas, pero sus pruebas no deben llamar comandos previos para crear fixtures.

### Within Each User Story

1. Tras T015, escribir el par de tareas de pruebas de la historia en paralelo.
2. Ejecutarlas y verificar fallos por el comportamiento aún ausente, no por errores del arnés.
3. Implementar validadores/persistencia antes de coordinar y registrar el comando.
4. Ejecutar las pruebas y comprobaciones de cierre; corregir fallos antes de marcar tareas.
5. Conservar regresiones de historias ya integradas al continuar.

### Parallel Opportunities

- Preparación: T002, T003 y T004 tras T001.
- Pruebas por historia: T016/T017, T022/T023, T028/T029, T034/T035, T040/T041 tras T015.
- Cierre: T047, T048 y T050 tras todas las historias, con entornos temporales
  independientes. Ejecutar T049 después de T047/T048 sobre una compilación estable,
  sin pruebas ni reconstrucciones concurrentes.
- Los marcadores `[P]` autorizan trabajo independiente dentro de cada grupo, no saltarse
  la base común ni modificar archivos compartidos concurrentemente.

---

## Parallel Example: User Story 1

Tras T015, escribir T016 (`tests/cli/add.test.ts`) y T017
(`tests/integration/add.test.ts`) simultáneamente. Integrar antes de T018–T021.

## Parallel Example: User Story 2

Tras T015, escribir T022 (`tests/cli/list.test.ts`) y T023
(`tests/integration/list.test.ts`) simultáneamente. Integrar antes de T024–T027.

## Parallel Example: User Story 3

Tras T015, escribir T028 (pruebas unitarias/integración de estados) y T029
(`tests/cli/status.test.ts`) simultáneamente. Integrar antes de T030–T033.

## Parallel Example: User Story 4

Tras T015, escribir T034 (pruebas unitarias/integración de edición) y T035
(`tests/cli/update.test.ts`) simultáneamente. Integrar antes de T036–T039.

## Parallel Example: User Story 5

Tras T015, escribir T040 (confirmación/eliminación) y T041
(`tests/cli/delete.test.ts`) simultáneamente. Integrar antes de T042–T046.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

Completar fases 1–3 y validar US1 de forma independiente: creación persistente y
confirmación permiten demostrar el incremento mínimo. Para un MVP de uso cotidiano,
añadir US2: **crear y listar** es el alcance recomendado por el plan.

### Incremental Delivery

Base común → crear → listar → estados → edición → eliminación → aceptación global.
Cada historia incorpora su evidencia y mantiene las pruebas previas. No declarar
compatibilidad multiplataforma ni éxito de usabilidad hasta T052/T053.

### Parallel Team Strategy

Repartir las parejas de pruebas y archivos de comandos distintos después de la base.
Asignar integración secuencial de archivos compartidos a una persona. Los ejemplos
describen oportunidades; este documento no inicia agentes ni ejecuta tareas.

## Notes

- Estado al 2026-10-04: **51/53 completadas**. T052 requiere la matriz de plataformas
  y TTY reales; T053 requiere cinco participantes. Evidencia local en `validation/final.md`.
- Resumen: 53 tareas; preparación 5, base 10, US1 6, US2 6, US3 6, US4 6,
  US5 7 y cierre 7. Hay 16 tareas marcadas `[P]`.
- FR-001 se cubre con las cinco historias; FR-002–004 con US1 y T047;
  FR-005–007 con US2; FR-008 con US3; FR-009–010 con US4; FR-011–012 con US5;
  FR-013–016 con base, historias y T047; FR-017 con T048/T052.
- SC-001/006: T053; SC-002: T049; SC-003: T033; SC-004: pruebas de historias y T047;
  SC-005: T017/T047; SC-007: T052.
- Las tareas de evidencia crean sus archivos al ejecutarse. Registrar resultados reales;
  las limitaciones de entorno mantienen la tarea correspondiente abierta.
- Antes de integrar, verificar ausencia de capas adicionales, ORMs, dependencias
  superfluas y clases propias, conforme a la constitución v1.0.0.
