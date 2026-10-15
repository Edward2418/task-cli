# Validación US3: estados

Fecha: 2026-10-04. T028–T033 completadas en Windows 11 Pro x64.

- Pruebas iniciales detectaron ausencia de comando y lógica de transición.
- Después: typecheck/build aprobados; 13 archivos y 70 pruebas acumuladas.
- Nueve pares probados: cuatro permitidos y cinco rechazados, con destinos permitidos
  en el error. ID inexistente no modifica ninguna tarea.
- Dos procesos solicitan simultáneamente la misma transición: uno tiene éxito,
  el otro falla al ver el estado actualizado. Campos restantes se conservan.
- Cobertura: FR-008/013 y SC-003.
