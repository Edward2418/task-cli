# Guía de validación: task-cli

Estos comandos permiten validar la implementación. Los resultados ejecutados y las
comprobaciones pendientes están en [validation/final.md](validation/final.md).
Consultar [contratos](contracts/cli.md), [modelo](data-model.md) y [plan](plan.md).

## Requisitos previos

- Node.js 24.x LTS y npm; registrar `node --version` y `npm --version`.
- Código implementado y lockfile disponible. Acceso a red durante instalación de
  dependencias; los comandos de tareas no necesitan red.
- Ejecutar la guía en Windows Server 2022 x64, Ubuntu 24.04 x64 y macOS 14 arm64.
  Registrar versión exacta de SO, arquitectura y terminal. El addon SQLite instalado
  debe poder cargarse en cada sistema; consultar instrucciones de la versión fijada
  si la plataforma requiere herramientas de compilación nativa.

## Preparar y comprobar el proyecto

Desde la raíz:

```text
npm ci
npm run typecheck
npm test
npm run build
npm run dev -- --help
npm pack
```

Scripts previstos: `dev` ejecuta `tsx cli.ts`; `typecheck` ejecuta `tsc --noEmit`;
`pretest` ejecuta `npm run build`; `test` ejecuta `vitest run`;
`build` ejecuta `tsc -p tsconfig.build.json`;
`prepack` ejecuta `npm run build`; `benchmark` ejecuta `tsx scripts/benchmark.ts`.
El tsconfig de compilación incluye solo fuentes de aplicación y emite a `dist/`.

`npm test` compila automáticamente mediante `pretest` antes de ejecutar la suite.
Las pruebas de procesos lanzan la ruta absoluta de `dist/cli.js` mediante
`process.execPath`, con argumentos separados. Si se invoca Vitest directamente,
ejecutar antes `npm run build` para evitar artefactos ausentes o desactualizados.

Resultado: pruebas y tipos pasan; tarball `task-cli-0.1.0.tgz` contiene el ejecutable
y sus módulos, pero no depende de herramientas de desarrollo para ejecutarse.

## Instalar el tarball globalmente con datos aislados

Usar una sesión de terminal dedicada. Los siguientes bloques crean un prefijo npm
y un directorio personal temporales con espacios y acentos. No borran ni modifican
la base personal habitual. Mantener las variables en esta sesión para todo el recorrido.

### Windows (PowerShell)

```powershell
$sandbox = node -e "console.log(require('node:fs').mkdtempSync(require('node:path').join(require('node:os').tmpdir(), 'task-cli-prueba-')))"
$prefix = Join-Path $sandbox 'instalación global'
$testHome = Join-Path $sandbox 'usuario de prueba'
New-Item -ItemType Directory -Path $prefix, $testHome | Out-Null
npm install --global --prefix "$prefix" --omit=dev ./task-cli-0.1.0.tgz
$env:PATH = "$prefix;$env:PATH"
$env:HOME = $testHome
$env:USERPROFILE = $testHome
task-cli --version
task-cli --help
```

### macOS y Linux (Bash)

```bash
sandbox=$(node -e "console.log(require('node:fs').mkdtempSync(require('node:path').join(require('node:os').tmpdir(), 'task-cli-prueba-')))")
prefix="$sandbox/instalación global"
testHome="$sandbox/usuario de prueba"
mkdir -p "$prefix" "$testHome"
npm install --global --prefix "$prefix" --omit=dev ./task-cli-0.1.0.tgz
export PATH="$prefix/bin:$PATH"
export HOME="$testHome"
export USERPROFILE="$testHome"
task-cli --version
task-cli --help
```

Esperado: versión `0.1.0`, ayuda en español y código 0; ayuda/versión no crean la base.
La primera operación de tareas crea `.task-cli/tasks.db` dentro de `testHome`.
El arnés automatizado debe fijar las variables al lanzar cada proceso hijo, sin
mutar concurrentemente el entorno del proceso de pruebas.

## Recorrido funcional

En un almacenamiento temporal nuevo:

```text
task-cli list
task-cli add "Preparar informe"
task-cli add "Revisar entrega" --priority high --description "Comprobar cifras"
task-cli list
task-cli list --status todo --priority high
task-cli status 1 in-progress
task-cli status 1 done
task-cli status 1 todo
task-cli update 1 --title "Preparar informe final" --priority low
task-cli update 2 --description ""
task-cli list
```

Esperado:

- Primer listado vacío con éxito. IDs 1 y 2; ambos `todo`; prioridad inicial de 1
  `medium`. El segundo registra descripción y prioridad `high`.
- Tabla con cinco columnas, tarea 2 antes que 1; filtro combinado devuelve solo 2.
- Las tres transiciones tienen éxito y conservan ID y fecha. La tarea 1 termina `todo`.
- Edición mantiene campos omitidos y cambia título/prioridad. Descripción de 2 se borra;
  la confirmación de edición lo indica. El listado no muestra descripción.

Las comillas vacías deben llegar como un argumento vacío al proceso. En entornos
PowerShell antiguos que las eliminen al invocar ejecutables nativos, comprobar este
caso mediante el arnés de procesos con argumentos separados y repetir manualmente
en una versión de PowerShell que preserve argumentos vacíos; registrar la terminal.

## Errores y transiciones

```text
task-cli add "   "
task-cli add "Inválida" --priority urgent
task-cli status 1 done
task-cli status 1 todo
task-cli status 999 in-progress
task-cli update 1
task-cli update 1 --title "Cambio que no debe guardarse" --priority urgent
task-cli list --status unknown
task-cli delete 0 --force
```

Cada comando termina con código 1 y mensaje accionable sin stack trace. No inserta
ni modifica tareas. Comprobar código inmediatamente con `$LASTEXITCODE` en PowerShell
o `$?` en Bash. El título de 1 debe seguir siendo `Preparar informe final`.

La suite parametrizada debe cubrir los nueve pares de estado: cuatro aceptados y
cinco rechazados. Incluir IDs fraccionarios, negativos, no numéricos y fuera del
rango seguro del modelo; confirmar que no se convierten silenciosamente.

## Confirmación y eliminación

```text
task-cli delete 2
```

Ver ID y título. Responder `n`: cancelar con código 0 y conservar 2. Repetir con
respuesta vacía y una respuesta desconocida; ambas cancelan. Repetir y responder `s`:
eliminar 2. Probar además las otras respuestas afirmativas en pruebas con fixtures.

```text
task-cli add "Tarea temporal"
task-cli delete 3 --force
task-cli delete 3 --force
task-cli add "Revisar mañana"
```

Esperado: ID 3 no reutiliza 2; primer borrado forzado tiene éxito sin preguntar;
segundo falla por ausencia. La siguiente tarea recibe ID 4.

En Bash: `printf 's\n' | task-cli delete 4`. En PowerShell:
`'s' | task-cli delete 4`. Esperado: código 1 por entrada no interactiva, sin espera
ni eliminación. `task-cli list` debe seguir mostrando 4.

## Persistencia, independencia del directorio y fallos

- Cambiar a otro directorio de trabajo dentro de la misma sesión y ejecutar
  `task-cli list`: conserva tareas 1 y 4, sus valores y el orden esperado.
- Repetir sin conexión a red y en un proceso nuevo con el mismo directorio personal.
- Usar fixtures independientes para almacenamiento inaccesible, corrupto o bloqueado;
  nunca alterar la base del recorrido. Verificar código 1, acción correctiva y ausencia
  de cambios parciales. Para bloqueo, sostener una escritura desde otra conexión
  por más de 1.000 ms; la operación debe fallar tras agotar la espera configurada.
- Verificar Unicode, títulos extensos y saltos de línea: los valores permanecen
  asociados a sus columnas y el texto almacenado no cambia por su presentación.
- Probar dos escritores para transiciones y ediciones: ninguna transición se valida
  sobre un estado obsoleto ni se sobrescriben campos omitidos de una edición.

## Rendimiento y usabilidad

```text
npm run benchmark
```

Ejecutar desde la raíz del proyecto tras compilar y después de finalizar las pruebas
transversales y de empaquetado (T047/T048), sin compilaciones ni suites concurrentes.
El script previsto usa exclusivamente
un directorio temporal, crea 1.000 tareas con estados/prioridades conocidos y lanza
al menos 100 listados mediante el JavaScript compilado. Medir desde creación del
proceso hasta recepción de salida completa, sin contención ni calentamientos excluidos.
Comparar resultados con el conjunto esperado y registrar percentil 95, equipo,
versiones y tamaño de datos. Criterio: al menos 95 de 100 listados en menos de 1 s.

Para SC-001 y SC-006, cinco personas familiarizadas con terminal usan el paquete
instalado y su ayuda: al menos cuatro completan crear/listar/iniciar/completar en
menos de dos minutos sin asistencia. Al menos cuatro identifican estado y prioridad
sin color y corrigen una prioridad inválida usando el mensaje recibido.

## Registro de aceptación

Conservar resultados de cada plataforma con fecha, SO/arquitectura, terminal, Node,
npm, versión del paquete, pruebas, confirmación interactiva, instalación global,
rendimiento y sesiones de usuarios. SC-007 requiere pasar todos los escenarios de
las cinco historias en cada familia; una ejecución local en Windows no acredita
macOS o Linux. Cerrar conexiones antes de retirar los directorios temporales.
