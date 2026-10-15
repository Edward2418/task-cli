# Feature Specification: Gestión de tareas personales con task-cli

**Feature Branch**: Sin rama asociada; no se ejecutó ningún hook de creación de rama.

**Created**: 2026-09-30

**Status**: Borrador validado

**Input**: Descripción de `spec-input.md`: construir un CLI llamado `task-cli` para
gestionar tareas personales desde la terminal.

## Clarifications

### Session 2026-10-01

- Q: ¿En qué sistemas operativos debe funcionar y validarse `task-cli` en esta primera versión? → A: Windows, macOS y Linux.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar tareas personales (Priority: P1)

Como persona que organiza su trabajo desde la terminal, quiero registrar una tarea
con un título y, opcionalmente, una descripción y prioridad para no olvidar pendientes.

**Why this priority**: Registrar pendientes es la base del valor del producto.

**Independent Test**: Crear tareas en un entorno sin datos previos y comprobar la
confirmación y la conservación de sus valores al volver a abrir el CLI.

**Acceptance Scenarios**:

1. **Dado** un entorno sin tareas, **cuando** creo una con solo título, **entonces**
   recibo un ID entero positivo, estado `todo`, prioridad `medium` y fecha de creación.
2. **Dado** un título válido, **cuando** incluyo descripción y cualquiera de las
   prioridades `high`, `medium` o `low`, **entonces** se conservan los valores indicados.
3. **Dado** un título ausente, vacío o compuesto solo de espacios, o una prioridad
   inválida, **cuando** intento crear una tarea, **entonces** se rechaza sin crear datos.
4. **Dado** que he creado y eliminado tareas, **cuando** creo otra, **entonces** recibe
   un ID mayor que todos los asignados anteriormente, sin reutilizar IDs eliminados.
5. **Dado** que una tarea se guardó correctamente, **cuando** cierro y vuelvo a ejecutar
   el CLI desde otro directorio y sin conexión, **entonces** la tarea sigue disponible.

---

### User Story 2 - Consultar y filtrar pendientes (Priority: P1)

Como usuario, quiero ver mis tareas y filtrar por estado o prioridad para identificar
en qué trabajar a continuación.

**Why this priority**: Recuperar los pendientes convierte el registro en una herramienta útil.

**Independent Test**: Con un conjunto de tareas previamente preparado, comprobar el
listado completo, cada filtro y su combinación sin depender del flujo de creación.

**Acceptance Scenarios**:

1. **Dado** un conjunto de tareas, **cuando** solicito el listado sin filtros,
   **entonces** veo una tabla con ID, título, estado, prioridad y fecha de creación,
   ordenada de más reciente a más antigua.
2. **Dado** un conjunto con estados y prioridades variados, **cuando** uso
   `--status` o `--priority`, **entonces** solo aparecen las tareas coincidentes.
3. **Dado** ambos filtros, **cuando** listo las tareas, **entonces** cada resultado
   cumple simultáneamente el estado y la prioridad solicitados.
4. **Dado** que no hay tareas o coincidencias, **cuando** listo, **entonces** recibo
   un mensaje explícito de ausencia de resultados y la operación termina con éxito.
5. **Dado** un filtro con valor desconocido, **cuando** listo, **entonces** recibo
   un error que indica los valores válidos y no un listado sin filtrar.
6. **Dado** que varias tareas tienen la misma fecha de creación, **cuando** listo,
   **entonces** las empatadas aparecen por ID descendente.

---

### User Story 3 - Avanzar y reabrir el trabajo (Priority: P2)

Como usuario, quiero cambiar el estado de una tarea por su ID para reflejar el progreso
sin completar tareas que todavía no he comenzado.

**Why this priority**: El seguimiento distingue los pendientes del trabajo iniciado y terminado.

**Independent Test**: Preparar una tarea en cada estado y probar cada par de estado
de origen y destino, comprobando el resultado y la conservación del resto de campos.

**Acceptance Scenarios**:

1. **Dada** una tarea en el estado de origen, **cuando** solicito cualquiera de las
   transiciones permitidas, **entonces** se actualiza únicamente su estado:

   | Origen | Destino |
   |--------|---------|
   | `todo` | `in-progress` |
   | `in-progress` | `done` |
   | `in-progress` | `todo` |
   | `done` | `todo` |

2. **Dada** una tarea, **cuando** solicito `todo` → `done`, `done` → `in-progress`
   o un cambio al mismo estado, **entonces** se rechaza sin modificarla y se muestran
   los destinos permitidos para su estado actual.
3. **Dado** un estado desconocido, **cuando** solicito el cambio, **entonces** se
   rechaza y se indican los estados válidos.
4. **Dado** un ID inexistente o inválido, **cuando** solicito un cambio, **entonces**
   recibo un error accionable y ninguna tarea resulta modificada.

---

### User Story 4 - Corregir los datos de una tarea (Priority: P2)

Como usuario, quiero editar título, descripción o prioridad para mantener mis tareas
actualizadas sin perder su identidad ni su progreso.

**Why this priority**: Permite corregir y precisar el trabajo ya registrado.

**Independent Test**: Con una tarea preparada, editar cada campo por separado y varios
campos juntos, comprobando que los campos no indicados permanecen iguales.

**Acceptance Scenarios**:

1. **Dada** una tarea existente, **cuando** actualizo uno o varios campos permitidos,
   **entonces** se guardan juntos y se conservan el ID, estado, fecha y campos omitidos.
2. **Dada** una descripción existente, **cuando** envío una descripción vacía,
   **entonces** queda eliminada sin alterar el título.
3. **Dada** una actualización con título vacío o prioridad inválida, **cuando** la
   solicito junto con otros cambios válidos, **entonces** se rechaza toda la operación.
4. **Dado** un ID inexistente o inválido, o una solicitud sin campos editables,
   **cuando** intento actualizar, **entonces** recibo un error y no se modifican datos.

---

### User Story 5 - Eliminar tareas con control (Priority: P3)

Como usuario, quiero eliminar tareas innecesarias confirmando mi intención, y poder
omitir esa confirmación cuando uso explícitamente `--force`.

**Why this priority**: Permite mantener la lista útil y reduce eliminaciones accidentales.

**Independent Test**: Con tareas preparadas, verificar confirmación, cancelación,
eliminación forzada y ejecución sin posibilidad de responder.

**Acceptance Scenarios**:

1. **Dada** una tarea existente, **cuando** pido eliminarla sin `--force`, **entonces**
   veo su ID y título y se solicita confirmación antes de efectuar cambios.
2. **Dada** la confirmación pendiente, **cuando** respondo afirmativamente, **entonces**
   la tarea se elimina y deja de aparecer en los listados.
3. **Dada** la confirmación pendiente, **cuando** respondo negativamente o envío una
   respuesta vacía o no reconocida, **entonces** la operación se cancela sin borrar datos.
4. **Dada** una tarea existente, **cuando** la elimino con `--force`, **entonces** se
   elimina sin preguntas adicionales.
5. **Dado** un ID inexistente o inválido, **cuando** pido eliminarlo incluso con
   `--force`, **entonces** recibo un error y no se elimina ninguna otra tarea.
6. **Dada** una ejecución sin entrada interactiva y sin `--force`, **cuando** solicito
   eliminar, **entonces** se rechaza sin esperar indefinidamente y se explica cómo
   repetir la operación con confirmación interactiva o con `--force`.

### Edge Cases

- Un ID cero, negativo, fraccionario o no numérico se rechaza sin modificar datos.
- Los títulos con espacios interiores, tildes y otros caracteres Unicode se conservan;
  los espacios iniciales y finales se eliminan antes de validar si el título está vacío.
- Los textos extensos o con saltos de línea no deben desplazar los valores de una tarea
  hacia las columnas de otra; la presentación puede ajustarse sin alterar el texto guardado.
- Un destino igual al estado actual se trata como transición no permitida.
- Si no se puede leer o guardar información, se muestra el problema y una acción de
  recuperación, sin stack traces ni confirmaciones falsas de éxito.
- Un error de validación o guardado no debe dejar cambios parciales en la tarea.
- Una eliminación cancelada termina con éxito y un mensaje de cancelación; una
  eliminación que no puede confirmar por falta de entrada interactiva termina con error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `task-cli` DEBE permitir gestionar tareas personales desde la terminal
  mediante creación, listado, cambio de estado, actualización y eliminación.
- **FR-002**: La creación DEBE exigir un título no vacío, aceptar una descripción
  opcional y aceptar únicamente prioridades `high`, `medium` y `low`.
- **FR-003**: Cada tarea nueva DEBE recibir un ID entero positivo autoincremental,
  único y no reutilizable, estado `todo`, fecha de creación y prioridad `medium`
  cuando no se especifique otra.
- **FR-004**: Las tareas DEBEN conservarse localmente entre ejecuciones, estar
  disponibles desde distintos directorios para el mismo usuario del equipo y poder
  gestionarse sin conexión a servicios externos.
- **FR-005**: El listado DEBE presentar una tabla con ID, título, estado, prioridad
  y fecha de creación, ordenada por fecha descendente y, en caso de empate, ID descendente.
- **FR-006**: El listado DEBE aceptar `--status todo|in-progress|done` y
  `--priority high|medium|low`, por separado o combinados mediante coincidencia de ambos.
- **FR-007**: Un listado vacío DEBE indicarlo explícitamente y terminar con éxito.
- **FR-008**: El cambio de estado por ID DEBE permitir exclusivamente `todo` →
  `in-progress`, `in-progress` → `done`, `in-progress` → `todo` y `done` → `todo`.
  Cualquier otra transición DEBE rechazarse sin modificar la tarea.
- **FR-009**: La actualización por ID DEBE permitir modificar título, descripción
  y prioridad, juntos o por separado. DEBE conservar los campos omitidos, el ID,
  el estado y la fecha de creación; una descripción vacía DEBE borrar la descripción.
- **FR-010**: Una actualización sin campos editables o con algún valor inválido
  DEBE rechazarse íntegramente, sin guardar cambios parciales.
- **FR-011**: La eliminación por ID DEBE solicitar confirmación mostrando ID y título.
  Solo una respuesta afirmativa explícita DEBE autorizar el borrado; cualquier otra
  respuesta DEBE cancelar la operación sin modificar datos.
- **FR-012**: `--force` DEBE permitir eliminar sin confirmación. Sin entrada interactiva,
  una eliminación sin `--force` DEBE fallar inmediatamente con un mensaje accionable.
- **FR-013**: Toda operación sobre un ID inválido o inexistente DEBE fallar sin
  modificar otras tareas. Los valores de estado y prioridad desconocidos DEBEN rechazarse.
- **FR-014**: Los errores DEBEN describir el problema y una acción de recuperación,
  sin mostrar stack traces. El código de salida DEBE ser `0` para éxito, incluidos
  listados vacíos y cancelaciones voluntarias, y `1` para errores.
- **FR-015**: Las operaciones que cambien datos DEBEN confirmar el resultado solo
  después de guardarlo correctamente e identificar la tarea afectada por su ID.
  Un fallo DEBE dejar los datos previos sin cambios parciales.
- **FR-016**: La salida DEBE mantener identificables las columnas incluso con textos
  extensos. Los colores, si se usan, DEBEN limitarse a estados y prioridades, cuyos
  valores también DEBEN expresarse mediante texto.
- **FR-017**: El usuario DEBE poder instalar el CLI globalmente y ejecutar `task-cli`
  desde cualquier directorio de trabajo en Windows, macOS y Linux. Los cinco flujos
  principales y la conservación local de tareas DEBEN funcionar en los tres sistemas.

### Key Entities *(include if feature involves data)*

- **Tarea**: Unidad de trabajo personal. Contiene ID numérico único e inmutable,
  título obligatorio, descripción opcional, estado, prioridad y fecha de creación
  inmutable. No pertenece a cuentas ni mantiene relaciones con otras tareas.
- **Estado**: Situación de la tarea: pendiente (`todo`), en curso (`in-progress`)
  o terminada (`done`). Sus cambios están limitados por FR-008.
- **Prioridad**: Importancia relativa de la tarea: alta (`high`), media (`medium`)
  o baja (`low`); el valor inicial predeterminado es `medium`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una evaluación con cinco usuarios familiarizados con la terminal,
  al menos cuatro completan sin asistencia el recorrido de crear, listar, iniciar
  y completar una tarea en menos de dos minutos, con el CLI instalado.
- **SC-002**: En un conjunto de 1.000 tareas, el 100 % de los listados de aceptación
  contiene exactamente las coincidencias esperadas, con las cinco columnas requeridas
  y el orden definido; al menos el 95 % se presenta en menos de un segundo en el
  equipo local de evaluación, cuyas características se registran con el resultado.
- **SC-003**: Los nueve pares posibles entre los tres estados producen el resultado
  esperado: cuatro transiciones aceptadas y cinco rechazadas sin modificación.
- **SC-004**: El 100 % de los escenarios de validación y cancelación conserva los
  datos previos; ninguna eliminación sin `--force` ocurre sin respuesta afirmativa.
- **SC-005**: Después de cerrar y reabrir el CLI desde otro directorio y sin conexión,
  el 100 % de las creaciones, ediciones y transiciones confirmadas conserva sus valores,
  y ninguna tarea cuya eliminación fue confirmada reaparece.
- **SC-006**: En la evaluación de usuarios de SC-001, al menos cuatro de cinco
  identifican correctamente estado y prioridad en el listado sin colores y corrigen
  un valor de prioridad inválido usando únicamente el mensaje de error recibido.
- **SC-007**: En Windows, macOS y Linux se verifica satisfactoriamente la instalación
  global, la ejecución desde distintos directorios y el 100 % de los escenarios de
  aceptación de las cinco historias, incluida la conservación de tareas entre ejecuciones.
  Las versiones de los sistemas evaluados se registran con los resultados.

## Assumptions

- El actor es una persona que gestiona tareas propias en su equipo. No se incluyen
  usuarios, autenticación, sincronización externa, fechas de vencimiento, subtareas,
  dependencias entre tareas, etiquetas, categorías, interfaz web ni API REST.
- Las cuatro transiciones enumeradas en `spec-input.md` constituyen la lista exhaustiva
  de cambios permitidos; cambiar al mismo estado no es una operación válida.
- Los filtros combinados se interpretan como una intersección. Solo se exige el orden
  de creación descendente; otros criterios o sentidos de ordenación quedan fuera del alcance.
- Los IDs empiezan en `1` en un registro nuevo y aumentan sin reutilizar valores;
  no se exige que la secuencia carezca de huecos.
- Los valores de estado y prioridad se introducen exactamente en minúsculas como
  aparecen en esta especificación. Los mensajes para el usuario se redactan en español.
- La confirmación acepta `s`, `sí`, `si`, `y` o `yes`, sin distinguir mayúsculas y
  descartando espacios exteriores. Cualquier otra respuesta cancela el borrado.
- La descripción omitida al crear equivale a ausencia de descripción; omitirla al
  actualizar conserva su valor. No se incorpora un comando adicional de consulta de detalles.
- La fecha de creación se muestra con fecha, hora y zona horaria identificables.
- Se requiere acceso de lectura y escritura al almacenamiento personal del equipo.
  Los fallos de acceso se comunican conforme a FR-014 y FR-015.
- La primera versión es compatible con Windows, macOS y Linux; la planificación
  concretará las versiones evaluadas de cada sistema sin excluir ninguna de estas familias.
- La constitución de `.specify/memory/constitution.md` rige la planificación técnica,
  las pruebas y la distribución. Esta especificación define el comportamiento observable
  compatible con sus diez principios; la selección técnica se desarrolla en el plan.
