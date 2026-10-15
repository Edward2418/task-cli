# task-cli

Gestiona tareas personales desde la terminal, sin cuentas ni servicios externos.
Requiere **Node.js 24.x LTS** y npm.

## Instalar desde este proyecto

```text
npm ci
npm run typecheck
npm test
npm pack
npm install -g ./task-cli-0.1.0.tgz
task-cli --help
```

`npm pack` compila TypeScript y genera el paquete JavaScript. La instalación global
no necesita TypeScript, tsx ni Vitest. Esta guía instala el paquete local: no presupone
que el nombre `task-cli` publicado en el registro npm corresponda a este proyecto.

## Comandos

```text
task-cli add "Preparar informe"
task-cli add "Revisar cifras" --description "Contrastar fuentes" --priority high
task-cli list
task-cli list --status todo --priority high
task-cli status 1 in-progress
task-cli status 1 done
task-cli status 1 todo
task-cli update 1 --title "Preparar informe final" --priority low
task-cli update 1 --description ""
task-cli delete 1
task-cli delete 2 --force
```

- Prioridades: `high`, `medium` (predeterminada) y `low`.
- Estados: `todo` (inicial), `in-progress` y `done`.
- Transiciones: `todo → in-progress`, `in-progress → done`, `in-progress → todo`
  y `done → todo`. Cambiar al mismo estado es un error.
- Los listados se ordenan por fecha descendente, y después por ID descendente.
  Combinar filtros exige cumplir ambos. No se usan colores.
- La edición conserva los campos omitidos. `--description ""` borra la descripción.
- El borrado pregunta por ID y título. Respuestas afirmativas: `s`, `sí`, `si`, `y`,
  `yes`, sin distinguir mayúsculas. Otra respuesta, EOF o interrupción cancela.
  Una tubería no es confirmación interactiva: usar `--force` para automatización.
- Código de salida `0`: éxito, listado vacío o cancelación. Código `1`: error.
  Consultar `$LASTEXITCODE` en PowerShell o `$?` en Bash inmediatamente después.

Usar comillas para títulos y descripciones con espacios. Para un título que empieza
por guion: `task-cli add -- "-Título"`. La ayuda de cada comando está en
`task-cli <comando> --help`.

PowerShell antiguo puede eliminar argumentos vacíos al llamar ejecutables nativos.
Para `--description ""`, usar una versión reciente que conserve argumentos vacíos
(PowerShell 7.3+ con paso de argumentos compatible), o ejecutar desde Bash.

## Almacenamiento

Archivo único por usuario: `~/.task-cli/tasks.db`, resuelto con el directorio personal
del sistema, también en Windows. No depende del directorio desde el que se ejecuta
el comando. Los datos permanecen entre ejecuciones y los IDs eliminados no se reutilizan.
No se realizan solicitudes de red para gestionar tareas.

Si falla el acceso, revisar permisos y espacio libre. Si otro proceso mantiene una
escritura, el CLI espera hasta 1.000 ms y después pide reintentar. Un archivo corrupto
no se reemplaza automáticamente: restaurar una copia válida. Un esquema más nuevo
requiere una versión compatible del CLI.

## Desarrollo y pruebas

```text
npm run dev -- add "Tarea de desarrollo"
npm run typecheck
npm test
npm run build
npm run benchmark
```

El comando de desarrollo usa el almacenamiento personal normal. Las pruebas y el
benchmark usan directorios temporales aislados; no afectan a las tareas personales.
`npm test` compila primero mediante `pretest`. Si se invoca Vitest directamente,
compilar antes de las pruebas CLI. El benchmark se ejecuta sin otras suites o
reconstrucciones concurrentes y guarda el informe en
`specs/001-gestionar-tareas/validation/performance.md`.

La prueba de empaquetado instala dependencias en un prefijo temporal y puede requerir
acceso al registro npm. Verifica el lanzador global real y la apertura de SQLite.

## Compatibilidad y dependencias nativas

El diseño contempla Windows, macOS y Linux. Validación ejecutada en este entorno:
Windows 11 Pro x64, Node 24.20.0 y npm 11.19.0. La matriz completa del plan y las
comprobaciones manuales se detallan en
[validation/platforms.md](specs/001-gestionar-tareas/validation/platforms.md).

Dependencias de ejecución: Commander 15.0.0, better-sqlite3 13.0.3 y cli-table3 0.6.5.
SQLite incluye un módulo nativo: conservar las dependencias opcionales y permitir que
npm seleccione el binario de la plataforma. No copiar `node_modules` entre sistemas.
Si falla la carga, reinstalar con Node 24 y revisar las instrucciones de
[better-sqlite3](https://github.com/WiseLibs/better-sqlite3/tree/v13.0.3).
Una compilación desde fuentes requiere las herramientas indicadas por
[node-gyp](https://github.com/nodejs/node-gyp#installation), como Python y el compilador
de la plataforma; no debe suponerse que se ejecutará automáticamente.

## Documentación

- [Especificación](specs/001-gestionar-tareas/spec.md)
- [Contrato CLI](specs/001-gestionar-tareas/contracts/cli.md)
- [Validación paso a paso](specs/001-gestionar-tareas/quickstart.md)
- [Tareas y estado](specs/001-gestionar-tareas/tasks.md)