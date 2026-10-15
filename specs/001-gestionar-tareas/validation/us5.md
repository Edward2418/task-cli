# Validación US5: eliminación

Fecha: 2026-10-04. T040–T046 completadas en Windows 11 Pro x64.

- Pruebas iniciales fallaron por ausencia de confirmación/comando.
- Después: typecheck/build aprobados; 19 archivos y 108 pruebas acumuladas.
- Respuestas afirmativas normalizadas, negativas, vacías, desconocidas, EOF y SIGINT
  verificadas con streams inyectados; se limpian los listeners de interrupción.
- Borrado en los tres estados, force sin invocar pregunta, cancelación que conserva
  datos e ID desaparecido durante la espera comprobados con SQLite real.
- Procesos verifican force, ID inválido/inexistente y rechazo de tubería afirmativa.
- No hay transacción abierta mientras se solicita confirmación y no se reutilizan IDs.
- Cobertura automatizada de FR-011–012 y escenarios de US5. La interacción en una
  terminal real de cada plataforma permanece pendiente en T052.
