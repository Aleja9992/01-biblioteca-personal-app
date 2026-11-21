
# AGENTS.md — Biblioteca Personal App

## Alcance
Este repositorio contiene exclusivamente la aplicación móvil Biblioteca Personal.

El repositorio de la API es independiente. No crear ni modificar archivos de la API desde este repositorio.

## Estructura esperada
- app/: rutas y pantallas Expo Router.
- src/components/: componentes reutilizables.
- src/db/: base de datos SQLite y migraciones.
- src/repositories/: acceso a datos.
- src/services/: lógica de aplicación.
- src/api/: comunicación HTTP con el backend.
- src/sensors/: integración con sensores y capacidades del dispositivo.
- ia/: documentación, reglas y evidencias de configuración de IA.

No crear esta estructura automáticamente si todavía no se ha aprobado la arquitectura inicial.

## Comandos
Antes de ejecutar comandos:
- Revisar package.json y utilizar los scripts realmente existentes.
- No asumir que una dependencia está instalada.
- No ejecutar instalaciones globales.
- No ejecutar comandos destructivos sin autorización.

## Reglas de implementación
- TypeScript para el código de la aplicación.
- Expo Router para navegación.
- SQLite para persistencia local.
- SecureStore para tokens y datos de sesión sensibles.
- HTTPS para comunicarse con la API.
- No utilizar Firestore directamente desde la aplicación.

## Prohibiciones
- No leer ni imprimir secretos.
- No incluir credenciales en código fuente.
- No acceder a otros proyectos del equipo.
- No eliminar archivos existentes sin autorización.
- No cambiar la configuración de seguridad del entorno.
- No publicar ni enviar datos externamente sin autorización.

## Verificación
Antes de finalizar una tarea, revisar:
- Tipos y errores de TypeScript.
- Lint, si está configurado.
- Pruebas, si están configuradas.
- Compatibilidad con la especificación académica.
