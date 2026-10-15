# Validación US4: edición

Fecha: 2026-10-04. T034–T039 completadas en Windows 11 Pro x64.

- Pruebas escritas y fallidas antes de disponer de la edición.
- Después: typecheck/build aprobados; 16 archivos y 83 pruebas acumuladas.
- Los tres estados admiten edición; ID, estado, fecha y campos omitidos se conservan.
- Descripción vacía se pasa como argumento separado y se almacena como null;
  espacios no vacíos se conservan. Falta de campos o valores inválidos rechazan todo.
- Dos procesos editan campos distintos y ambos valores sobreviven.
- Cobertura: cuatro escenarios de US4 y FR-009–010.
