# Validación por plataforma — T052 pendiente

Fecha: 2026-10-04.

| Entorno | Evidencia disponible | Estado |
|---------|----------------------|--------|
| Windows 11 Pro 10.0.26200 x64, Node 24.20.0, npm 11.19.0 | Suite local, tarball global con lanzador .cmd, SQLite nativo, rendimiento | Automatización local aprobada |
| Windows Server 2022 x64 | No ejecutado en este entorno | Pendiente |
| Ubuntu 24.04 x64 | No disponible en esta ejecución | Pendiente |
| macOS 14 arm64 | No disponible en esta ejecución | Pendiente |

La confirmación se probó con streams inyectados y señales; falta el recorrido TTY
manual de `quickstart.md` en los tres sistemas del plan. La suite local de Windows 11
no acredita Windows Server 2022, Linux ni macOS.

Para cerrar T052: ejecutar la suite y guía en la matriz prevista, registrar versiones
y resultados de los cinco flujos, y comprobar confirmación/cancelación desde terminal real.
