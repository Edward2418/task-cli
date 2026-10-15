# Investigación: gestión de tareas personales

Fecha: 2026-10-01. Fuente normativa: `spec.md` y constitución v1.0.0.

## Identidad y almacenamiento

- **Decisión**: SQLite con `better-sqlite3`; tabla `tasks` con ID
  `INTEGER PRIMARY KEY AUTOINCREMENT`. Ruta única resuelta desde el directorio
  personal del sistema: `~/.task-cli/tasks.db`, independientemente del directorio de trabajo.
- **Justificación**: La especificación exige IDs crecientes no reutilizables incluso
  tras eliminar la tarea de mayor ID. `AUTOINCREMENT` conserva esa garantía para
  inserciones confirmadas; no se exige una secuencia sin huecos.
- **Alternativas consideradas**: `INTEGER PRIMARY KEY` sin `AUTOINCREMENT` puede
  reutilizar IDs eliminados; UUID contradice el ID numérico; ORM está prohibido.
- **Fuente**: https://www.sqlite.org/autoinc.html

## Atomicidad y concurrencia local

- **Decisión**: Consultas preparadas con parámetros, transacciones de escritura cortas
  y modo de journal predeterminado. Leer, validar y cambiar estado dentro de una
  transacción inmediata. Las ediciones actualizan solo los campos enviados.
  Configurar espera de bloqueo de 1.000 ms; si expira, comunicar que se reintente.
- **Justificación**: SQLite serializa escritores. La validación del estado y su cambio
  deben observar el mismo estado para impedir transiciones inválidas entre procesos.
  La transacción evita cambios parciales y las actualizaciones parciales evitan
  sobrescribir campos omitidos por una edición concurrente.
- **Alternativas consideradas**: Leer y escribir en operaciones independientes deja
  una carrera; WAL añade archivos auxiliares sin necesidad para 1.000 tareas y
  escrituras breves; un servicio de bloqueo externo contradice la simplicidad local.
- **Decisión complementaria**: Nunca mantener una transacción durante la confirmación
  interactiva. Releer la tarea al borrar; si desapareció, informar ID inexistente.
  La confirmación autoriza eliminar el ID mostrado, aunque otro proceso edite sus datos.
- **Fuente**: https://www.sqlite.org/lang_transaction.html

## Representación y validación

- **Decisión**: Guardar fechas en UTC como texto ISO 8601 de anchura fija, con milisegundos
  y `Z`; ordenar por fecha e ID descendentes. ID tratado como entero seguro positivo
  en JavaScript; rechazar entradas fuera de ese intervalo y revertir una inserción
  si el ID generado lo supera.
- **Justificación**: Orden lexicográfico temporal determinista, zona horaria explícita
  y ausencia de redondeos silenciosos. El límite de enteros seguros excede ampliamente
  la escala prevista de tareas personales.
- **Alternativas consideradas**: Fecha localizada almacenada complica la ordenación;
  IDs sin validación permiten valores truncados; soporte integral de `bigint` no
  aporta valor a la escala prevista.

## Salida y confirmación

- **Decisión**: Tablas con `cli-table3`, sin colores en la primera versión; encabezados
  en español y valores de estado/prioridad canónicos. Neutralizar caracteres de control
  solo al mostrar; ajustar títulos largos con salto visual de línea. Confirmación
  mediante `node:readline/promises`, únicamente con entrada TTY.
- **Justificación**: Se cumple la legibilidad sin añadir una dependencia para colores
  ni para preguntas. Los textos originales permanecen intactos en almacenamiento.
- **Alternativas consideradas**: Librerías de prompts o color añaden dependencias para
  necesidades pequeñas; truncar permanentemente títulos perdería datos.

## Runtime, compilación y distribución global

- **Decisión**: Node.js 24.x LTS como única rama soportada inicialmente; TypeScript
  5.9 estricto, ESM `NodeNext`, salida objetivo ES2023. `tsx` en desarrollo; `tsc`
  genera `dist/` para distribuir. `package.json` declara `engines.node: ">=24 <25"`,
  `type: "module"`, `bin.task-cli: "dist/cli.js"` y `files: ["dist"]`.
  El ejecutable lleva `#!/usr/bin/env node`; `prepack` ejecuta la compilación.
- **Justificación**: Node 24 es LTS en la fecha del plan. npm crea los lanzadores
  apropiados para Windows y Unix; el usuario final no necesita TypeScript ni `tsx`.
  Fijar una rama probada reduce la matriz sin excluir ningún sistema operativo acordado.
- **Alternativas consideradas**: Ejecutar TS publicado con `tsx` agrega dependencia
  de runtime; bundling es innecesario; Node 26 aún no es LTS el 1 de octubre de 2026.
  Node 22 puede añadirse posteriormente con validación propia.
- **Fuentes**:
  - https://github.com/nodejs/Release/blob/main/schedule.json
  - https://www.typescriptlang.org/tsconfig/module.html
  - https://docs.npmjs.com/cli/v11/configuring-npm/package-json#bin
  - https://tsx.hirok.io/compilation

## Dependencias y addon nativo

- **Decisión**: Mantener `commander`, `better-sqlite3` y `cli-table3` como dependencias
  de ejecución externas a la compilación. Resolver versiones compatibles con Node 24
  al implementar, conservarlas en el lockfile y comprobar el tarball en cada plataforma.
  Usar solo APIs documentadas de conexión, sentencias y transacciones.
- **Justificación**: `better-sqlite3` incorpora código nativo; que TypeScript compile
  no demuestra que el paquete instalado pueda cargar SQLite. La disponibilidad de
  binarios y la estrategia de instalación dependen de la versión concreta elegida.
- **Alternativas consideradas**: Incluir `node_modules` generado en Windows en el
  paquete rompe portabilidad; sustituir SQLite o Commander incumple la constitución.
  No se asume una compilación nativa automática si falta un binario: comprobar las
  instrucciones de la versión fijada y documentar herramientas requeridas si procede.
- **Fuentes**:
  - https://github.com/WiseLibs/better-sqlite3
  - https://github.com/nodejs/node-gyp#installation
  - https://github.com/tj/commander.js#override-exit-and-output-handling
  - https://github.com/cli-table/cli-table3

## Pruebas y matriz de aceptación

- **Decisión**: Vitest; un archivo SQLite temporal por prueba de persistencia y
  funciones puras probadas directamente. Procesos de aceptación con `HOME` y
  `USERPROFILE` en directorios temporales únicos, configurados antes de iniciar el CLI.
  Las pruebas no modifican variables globales compartidas concurrentemente.
  Cerrar conexión y proceso antes de borrar archivos, especialmente en Windows.
- **Justificación**: Verificar el comportamiento real de `os.homedir()` y persistencia
  entre procesos sin tocar las tareas personales. Inyectar conexión, streams y reloj
  permite probar errores, confirmación y orden de forma determinista.
- **Alternativas consideradas**: Usar solo SQLite en memoria no verifica persistencia;
  probar solo funciones no verifica el lanzador npm ni los códigos reales del proceso.
- **Decisión de alcance**: Matriz mínima con Windows Server 2022 x64, Ubuntu 24.04 x64
  y macOS 14 arm64, siempre Node 24.x. Usar el tarball real con prefijo npm temporal,
  incluyendo rutas con espacios y acentos. La confirmación real se verifica además
  manualmente en una terminal de cada sistema, sin añadir dependencias de pseudoterminal.
- **Fuentes**:
  - https://nodejs.org/docs/latest-v24.x/api/os.html#oshomedir
  - https://vitest.dev/api/vi.html#vi-stubenv

## Resultado de la fase 0

Decisiones de diseño resueltas. La instalación de dependencias, el lockfile y las
mediciones pertenecen a implementación; no se afirma haber probado binarios ni rendimiento.
