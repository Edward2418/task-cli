<!--
Informe de impacto de sincronización (temporal; retirar antes de confirmar el archivo).
Cambio de versión: sin versión (plantilla inicial) → 1.0.0.
Motivo: primera definición de la constitución a partir de las diez reglas de reglas.md.
Principios modificados: los cinco espacios genéricos de la plantilla se sustituyen por
diez principios concretos, sin principios previos ratificados que conservar:
I. TypeScript y Node.js LTS; II. Persistencia local con SQLite;
III. Estructura simple por funcionalidad; IV. Estilo funcional y nombres;
V. Comandos con Commander.js; VI. Errores claros y códigos de salida;
VII. Pruebas de la lógica de negocio; VIII. Dependencias mínimas y sin ORM;
IX. Salida legible; X. Instalación global con npm.
Secciones añadidas: Restricciones del proyecto; Flujo de desarrollo y revisión;
contenido concreto de Governance.
Secciones eliminadas: ninguna; se conserva la jerarquía de la plantilla activa.
Pendientes: TODO(RATIFICATION_DATE): confirmar la fecha original de adopción.
-->

# task-cli Constitution

## Core Principles

### I. TypeScript y Node.js LTS

El CLI DEBE desarrollarse en TypeScript y ejecutarse sobre una versión LTS de Node.js.
La ejecución directa del código TypeScript DEBE utilizar `tsx` o una herramienta
equivalente que resuelva su transformación para Node.js. Esto mantiene un entorno
de ejecución estable y un flujo de desarrollo sencillo.

### II. Persistencia local con SQLite

La persistencia DEBE utilizar SQLite mediante `better-sqlite3`. La base de datos DEBE
almacenarse en `~/.task-cli/tasks.db`, resolviendo `~` al directorio del usuario.
El almacenamiento local permite gestionar las tareas sin un servicio de base de datos externo.

### III. Estructura simple por funcionalidad

El proyecto DEBE mantener una estructura simple y plana, organizada en `commands/`,
`db/` y `utils/`. NO DEBE introducir clean architecture ni capas adicionales que solo
deleguen llamadas sin aportar funcionalidad. Esta restricción mantiene la complejidad
proporcionada al tamaño del CLI.

### IV. Estilo funcional y nombres

El código propio DEBE organizarse mediante funciones en lugar de clases. La lógica
que no requiere efectos secundarios DEBE expresarse como funciones puras; los efectos
necesarios, como acceso a la base de datos o escritura al terminal, DEBEN mantenerse
fuera de esas funciones. Variables y funciones DEBEN usar `camelCase`.
`PascalCase` DEBE reservarse para tipos e interfaces.

### V. Comandos con Commander.js

El análisis de argumentos y la definición de comandos DEBEN utilizar Commander.js.
Los comandos nuevos DEBEN integrarse con este mecanismo para mantener una interfaz
consistente y evitar analizadores de argumentos duplicados.

### VI. Errores claros y códigos de salida

El CLI NO DEBE mostrar stack traces al usuario. Los errores DEBEN expresarse mediante
mensajes que describan el problema e indiquen una acción para resolverlo.
Toda ejecución DEBE finalizar con código `0` si tiene éxito o `1` si ocurre un error.

### VII. Pruebas de la lógica de negocio

Las pruebas unitarias DEBEN utilizar Vitest. Toda lógica de negocio DEBE contar con
pruebas que verifiquen su comportamiento, incluidos los casos de error aplicables.
Cada cambio en dicha lógica DEBE incorporar o actualizar sus pruebas.
No se exige un porcentaje mínimo de cobertura: la obligación recae sobre el
comportamiento de negocio, no sobre alcanzar una métrica.

### VIII. Dependencias mínimas y sin ORM

NO DEBEN utilizarse ORMs. NO DEBEN añadirse librerías para operaciones que puedan
resolverse con pocas líneas de código local. Toda dependencia nueva DEBE justificar
en la revisión qué necesidad cubre y por qué una implementación local breve no basta.
Las herramientas exigidas por esta constitución constituyen decisiones explícitas del proyecto.

### IX. Salida legible

Toda salida al terminal DEBE presentar información legible, con etiquetas que permitan
identificar sus valores. Los listados DEBEN mostrarse como tablas mediante `cli-table3`
o una solución equivalente. Los colores DEBEN usarse únicamente para estados y prioridades;
el texto DEBE identificar esos valores sin depender exclusivamente del color.

### X. Instalación global con npm

El CLI DEBE poder instalarse globalmente mediante `npm install -g` y quedar disponible
como comando ejecutable. El paquete distribuido DEBE incluir los archivos y las
dependencias necesarios para funcionar sobre Node.js LTS después de la instalación.

## Restricciones del proyecto

`task-cli` es un CLI de gestión de tareas construido con TypeScript y SQLite.
Las diez reglas de `reglas.md` son la fuente de esta adopción inicial y quedan
formalizadas en los principios anteriores.

Las decisiones de diseño y las especificaciones DEBEN respetar las tecnologías,
la ubicación de la base de datos y la estructura aquí establecidas. Una propuesta
que cambie estas restricciones DEBE tramitar una enmienda constitucional antes
de incorporarse al proyecto.

## Flujo de desarrollo y revisión

- Cada especificación y plan DEBE comprobar su compatibilidad con los diez principios.
- Cada revisión de código DEBE verificar estructura, estilo, dependencias, tratamiento
  de errores y salida al terminal según los cambios realizados.
- Antes de integrar cambios de lógica de negocio, DEBEN ejecutarse y pasar las pruebas
  unitarias correspondientes con Vitest.
- Los cambios de empaquetado o del punto de entrada DEBEN verificar la instalación
  global con npm y la ejecución del comando instalado.
- Los incumplimientos detectados DEBEN corregirse o resolverse mediante una enmienda
  aprobada antes de integrar el cambio.

## Governance

Esta constitución rige las especificaciones, los planes, las implementaciones y sus
revisiones. En caso de conflicto con otra práctica del proyecto, prevalece esta
constitución hasta que se apruebe una enmienda.

Toda enmienda DEBE documentar la regla afectada, la justificación, el impacto y,
cuando corresponda, la adaptación necesaria del trabajo existente. La persona
responsable del proyecto DEBE aprobarla antes de su adopción. El documento aprobado
DEBE actualizar su versión y la fecha de última modificación, conservando la fecha
original de ratificación.

La versión DEBE seguir el esquema semántico `MAJOR.MINOR.PATCH`:

- `MAJOR`: eliminación o redefinición incompatible de principios o reglas de gobernanza.
- `MINOR`: incorporación de principios o secciones, o ampliación material de las reglas.
- `PATCH`: aclaraciones, correcciones de redacción y ajustes sin cambio normativo.

La revisión de cumplimiento DEBE realizarse durante la planificación y antes de
integrar cada cambio. Las excepciones NO DEBEN aceptarse de manera implícita: cualquier
cambio normativo requiere el procedimiento de enmienda anterior.

TODO(RATIFICATION_DATE): confirmar la fecha original de adopción; no consta en la
constitución previa, que contenía únicamente la plantilla sin completar.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-09-30
