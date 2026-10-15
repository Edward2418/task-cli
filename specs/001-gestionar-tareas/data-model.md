# Modelo de datos: task-cli

## Entidad Task

Una tarea personal independiente; no existen usuarios, relaciones ni tablas auxiliares
de negocio. Correspondencia de propiedades TypeScript y columnas SQLite:

| Propiedad / columna | Tipo | Restricciones |
|--------------------|------|---------------|
| `id` / `id` | Entero | `INTEGER PRIMARY KEY AUTOINCREMENT`; positivo, único, inmutable, no reutilizable; máximo `9007199254740991` |
| `title` / `title` | Texto | Obligatorio; aplicar `trim()` antes de validar; longitud resultante mayor que cero; sin máximo de producto |
| `description` / `description` | Texto o null | Opcional; omisión al crear y cadena vacía equivalen a null; los demás textos se conservan |
| `status` / `status` | Texto enumerado | Solo `todo`, `in-progress`, `done`; obligatorio; inicial `todo` |
| `priority` / `priority` | Texto enumerado | Solo `high`, `medium`, `low`; obligatorio; predeterminado `medium` |
| `createdAt` / `created_at` | Texto temporal | Obligatorio, inmutable; UTC ISO 8601 con milisegundos y `Z`, generado al crear |

El máximo del ID evita pérdida de precisión en JavaScript. Validar `Number.isSafeInteger`
y rango positivo; no truncar fracciones ni convertir prefijos numéricos parciales.
El token de ID admite únicamente dígitos decimales; ceros iniciales son aceptables
si el valor resultante es positivo. No se admiten notación exponencial ni signos.

## Restricciones y normalización

- `TaskStatus` y `TaskPriority` son uniones literales; entradas se validan también en
  runtime. Valores en minúsculas exactas, sin normalización silenciosa.
- SQLite refuerza `NOT NULL`, enumeraciones mediante `CHECK`, título de longitud
  positiva e ID dentro del rango. La aplicación realiza `trim()` Unicode y validación
  completa antes de persistir; no depender del `trim` limitado de SQLite.
- Títulos pueden repetirse. No se crean restricciones de unicidad sobre contenido.
- Descripción con espacios no vacíos se conserva; solo `""` borra explícitamente.
- `CreateTaskInput`: título obligatorio, descripción y prioridad opcionales; no acepta
  ID, estado ni fecha proporcionados por el usuario.
- `UpdateTaskInput`: al menos uno de título, descripción o prioridad presente;
  distinguir propiedad ausente de cadena vacía. Validar todos antes de escribir.
- `TaskFilters`: estado y prioridad opcionales, combinados con AND.
- No hay límite funcional de tareas ni longitud de texto añadido por este diseño;
  los límites de recursos se comunican como errores de almacenamiento.

## Ciclo de vida

| Origen | Destino | Resultado |
|--------|---------|-----------|
| `todo` | `todo` | Rechazar |
| `todo` | `in-progress` | Permitir |
| `todo` | `done` | Rechazar |
| `in-progress` | `todo` | Permitir |
| `in-progress` | `in-progress` | Rechazar |
| `in-progress` | `done` | Permitir |
| `done` | `todo` | Permitir |
| `done` | `in-progress` | Rechazar |
| `done` | `done` | Rechazar |

La edición de título, descripción o prioridad y la eliminación se permiten en cualquiera
de los tres estados. La eliminación es física y no reinicia la secuencia de IDs.

## Operaciones e invariantes

- Crear: insertar valores validados y confirmar transacción antes de mostrar ID.
  Si falla, no anunciar una tarea creada ni conservar una inserción parcial.
- Listar: seleccionar las cinco columnas visibles; ordenar por `created_at DESC,
  id DESC`, también al filtrar. El formato temporal fijo permite ese orden.
- Cambiar estado: transacción inmediata que lee, valida transición y actualiza estado;
  los otros cinco campos no cambian.
- Editar: transacción que comprueba existencia y actualiza únicamente campos enviados.
  Ningún error guarda una parte de la edición.
- Eliminar: consultar para mostrar ID/título, confirmar sin transacción abierta y
  borrar por ID en una escritura atómica; comprobar que se eliminó una fila.
- ID inexistente produce error, también si otra ejecución eliminó la tarea previamente.
- Ediciones concurrentes de un mismo campo se ordenan por confirmación de escritura;
  prevalece la última escritura completada. No añadir historial ni versiones de tarea.

## Persistencia y esquema

- Conexión a `path.join(os.homedir(), ".task-cli", "tasks.db")`.
- Inicialización transaccional e idempotente; `PRAGMA user_version = 1` identifica
  el esquema inicial. Si la versión es mayor que 1, fallar sin alterar datos y sugerir
  utilizar una versión compatible del CLI.
- No borrar ni reinicializar automáticamente un archivo corrupto o inaccesible.
- Mantener el journal SQLite predeterminado; timeout de bloqueo de 1.000 ms.
- Sin índices adicionales inicialmente: la escala de aceptación es 1.000 tareas.
  Cualquier optimización posterior se justifica mediante la medición de SC-002.
