# Contrato de interfaz: task-cli

## Convenciones generales

- Ejecutable global: `task-cli`. Subcomandos en inglés; ayuda, encabezados y mensajes
  en español. Nombres de estado y prioridad conservan sus valores canónicos.
- `task-cli --help`, `task-cli <comando> --help` y `task-cli --version` terminan con
  código 0 sin acceder al almacenamiento. Sin subcomando, mostrar ayuda y terminar con 0.
- Comando, opción o argumento adicional desconocido: error con código 1 y orientación
  hacia `--help`. Los argumentos que empiezan por guion pueden pasarse tras `--`.
- stdout: resultados, confirmaciones de éxito, ayuda y mensajes de cancelación/vacío.
  stderr: errores y pregunta de confirmación. stdin: respuesta interactiva de borrado.
- Éxito, cancelación y vacío: código 0. Fallos de uso, datos o almacenamiento: código 1.
  Ninguna ruta de error expone stack traces ni anuncia éxito antes del guardado.
- Los mensajes exactos pueden evolucionar, pero deben conservar resultado, ID cuando
  corresponda y acción correctiva. No se ofrece formato JSON ni contrato de parseo de tablas.
- Todo acceso a tareas usa el archivo personal definido en el modelo, sin depender de CWD.

## Crear — US1

```text
task-cli add <title> [--description <text>] [--priority <priority>]
```

- Un único título obligatorio; usar comillas para espacios. Prioridad predeterminada
  `medium`; valores válidos `high|medium|low`. Descripción opcional, admite texto vacío.
- Crea estado `todo`, ID y fecha automáticamente.
- Confirmación con ID, título, estado, prioridad y fecha; incluir descripción si existe,
  de manera que el usuario pueda comprobar el valor guardado.
- Título vacío tras `trim()` o prioridad inválida: código 1, sin insertar.

## Listar — US2

```text
task-cli list [--status <status>] [--priority <priority>]
```

- Estado `todo|in-progress|done` y prioridad `high|medium|low`; ambos filtros aplican AND.
- Tabla con encabezados `ID`, `Título`, `Estado`, `Prioridad`, `Creación` en ese orden.
  Fecha ISO UTC con milisegundos y `Z`. Orden descendente por fecha y después ID.
- Sin coincidencias: mensaje explícito, sin filas ficticias, código 0.
- Sin paginación ni opciones adicionales de orden. La descripción no es columna del listado.
- Títulos extensos se envuelven dentro de su celda. Los controles de terminal se
  neutralizan al presentar, sin cambiar los datos guardados. Sin colores por defecto.

## Cambiar estado — US3

```text
task-cli status <id> <status>
```

- Aplicar exclusivamente la matriz de [data-model.md](../data-model.md).
- Éxito: confirmar ID y estado de destino. Rechazo de transición: informar estado
  actual y destinos permitidos. Estado desconocido: enumerar los tres valores válidos.
- No hay avance implícito: `todo` → `done` falla y no pasa automáticamente por `in-progress`.

## Actualizar — US4

```text
task-cli update <id> [--title <text>] [--description <text>] [--priority <priority>]
```

- Requiere al menos una opción de edición. Una opción presente sin valor es error;
  `--description ""` sí representa el borrado de descripción.
- Omitir un campo lo conserva. No permite editar ID, fecha ni estado.
- Validación conjunta; guardar todo o nada. Confirmar ID y valores resultantes de
  los campos enviados, incluida la eliminación de descripción.

## Eliminar — US5

```text
task-cli delete <id> [--force]
```

- Primero validar ID y existencia. Sin `--force`, exigir `stdin.isTTY`, mostrar ID
  y título y preguntar `¿Eliminar esta tarea? [s/N]` mediante stderr.
- Normalizar respuesta con `trim()` y minúsculas; solo `s`, `sí`, `si`, `y`, `yes`
  confirman. Respuesta vacía o distinta cancela con mensaje y código 0.
- Fin de entrada sin respuesta cancela sin borrar. Interrupción de la confirmación
  cancela limpiamente sin borrar y cierra la lectura.
- Sin entrada interactiva: código 1 sin esperar respuesta; explicar el uso de una
  terminal o `--force`. Enviar `s` por una tubería no sustituye a `--force`.
- Con `--force`: eliminar directamente, sin pregunta. Un ID inexistente sigue siendo error.
- Éxito: confirmar el ID eliminado. La secuencia de IDs no se reinicia.

## Errores compartidos

| Caso | Información mínima y acción |
|------|----------------------------|
| ID inválido | Exigir entero decimal positivo seguro y mostrar un ejemplo válido |
| ID inexistente | Identificar el ID y sugerir `task-cli list` |
| Título vacío | Pedir un título no vacío y recordar comillas para espacios |
| Enumeración inválida | Indicar el valor recibido y los valores permitidos |
| Sin campos de edición | Indicar `--title`, `--description` o `--priority` |
| Archivo sin acceso | Indicar que no se pudo acceder y sugerir revisar permisos/espacio |
| Archivo corrupto | Indicar fallo de lectura y sugerir restaurar una copia válida; no borrar |
| Bloqueo > 1.000 ms | Indicar almacenamiento ocupado y sugerir reintentar |
| Esquema futuro | Solicitar una versión compatible del CLI, sin modificar la base |

Los errores propios son valores tipados o `Error` estándar con clasificación;
no se introducen clases de aplicación. Configurar Commander con `exitOverride`
y salida controlada, diferenciando ayuda/versión de errores. Usar `parseAsync`
para esperar la confirmación y cerrar recursos antes de terminar.
