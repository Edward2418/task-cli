# Validación US1: creación

Fecha: 2026-10-04. T016–T021 completadas en Windows 11 Pro x64.

- Pruebas escritas y ejecutadas antes de la implementación: comando/funciones ausentes.
- Tras implementar: typecheck y build aprobados; 8 archivos, 48 pruebas acumuladas.
- Verificados los valores predeterminados, descripción, prioridades, título obligatorio,
  Unicode, espacios y título con guion tras `--`.
- SQLite real comprueba no reutilización de IDs, descripciones null/vacías/con espacios,
  fecha UTC fija y rollback al superar el entero seguro.
- Un proceso crea y una conexión posterior recupera datos desde un CWD diferente
  del directorio personal. La persistencia completa entre comandos se amplía en T047.
- Cobertura: FR-002–004/015 y los cinco escenarios de US1.
