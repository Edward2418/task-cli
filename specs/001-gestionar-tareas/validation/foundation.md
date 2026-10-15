# Validación de la base compartida

Fecha: 2026-10-04. Entorno: Windows 11 Pro x64, Node 24.20.0, npm 11.19.0.

- T001–T005: dependencias fijadas, lockfile, scripts, TypeScript/Vitest e ignores.
- Carga real de better-sqlite3 en Windows comprobada con una consulta en memoria.
- T006–T015: tipos, esquema, conexión, validadores, errores, salida, arnés y ayuda.
- Pruebas iniciales fallaron por módulos aún ausentes; después de implementar,
  `npm run typecheck` y `npm test` pasaron: 5 archivos, 36 pruebas.
- Ayuda y versión no crearon la base. Archivos de pruebas aislados en temporales;
  SQLite cerrado antes de limpiar. Inicialización, esquema futuro y corrupción cubiertos.
- La prueba de títulos con guion pertenece a US1, no a esta puerta de entrada.
