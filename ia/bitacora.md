# Bitácora de IA

## Evidencia inicial

- Fecha: 2026-11-20
- Alcance: configuración de IA del repositorio móvil.
- Prueba: `node ia/verify-ai-config.mjs`
- Resultado: 6 comprobaciones aprobadas, 0 fallidas.

## Bloque 2 · Arquitectura móvil

- Fecha: 2026-11-20
- Alcance: proyecto Expo, Expo Router y estructura de rutas.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores.

## Bloque 3 · SQLite y migraciones

- Fecha: 2026-11-20
- Alcance: apertura de la base, migración `libro` y campos de sincronización.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.

## Bloque 12 · Pruebas mínimas de app

- Fecha: 2026-11-20
- Alcance: Jest/jest-expo, React Native Testing Library instalada y pruebas de servicio, préstamo, formulario y sensor.
- Prueba: `npm test`
- Resultado: 3 suites aprobadas, 5 pruebas aprobadas.

## Bloque 13 · Secure Store y sesión

- Fecha: 2026-11-20
- Alcance: tokens en Secure Store, URL pública y refresco único ante 401.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores.
- Verificación adicional: `npm test`, 3 suites y 5 pruebas aprobadas.

## Bloque 15 · Sincronización offline

- Fecha: 2026-11-20
- Alcance: cola `pending`, envío antes de descarga, `since`, cursor y aplicación incremental.
- Prueba: `npm test`
- Resultado: 4 suites aprobadas, 7 pruebas aprobadas.
- Verificación adicional: `npx tsc --noEmit`, aprobado.

## Bloque 18 · Documentación y EAS preparado

- Fecha: 2026-11-20
- Alcance: README, `eas.json`, configuración Expo pública y checklist técnico local.
- Prueba: `npx expo config --type public`
- Resultado: configuración Expo válida.
- EAS build, despliegue y APK: pendientes de autorización externa.

## Bloque 19 · Despliegue externo

- Fecha: 2026-11-20
- API desplegada: `https://01-biblioteca-personal-api.vercel.app`
- Prueba: `npx vercel curl https://01-biblioteca-personal-api.vercel.app/api/health`
- Resultado: `{"status":"ok"}`
- APK EAS: bloqueado porque no hay sesión Expo activa.

## Reintento EAS

- Fecha: 2026-11-20
- Resultado: bloqueado; el CLI sigue sin detectar una sesión Expo activa.
- No se creó ni publicó un APK.

## Bloque 16 · Portadas

- Fecha: 2026-11-20
- Alcance: reducción a JPEG 1280 px, subida a `/api/imagenes` y URL remota.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores.
- Verificación adicional: `npm test`, 4 suites y 7 pruebas aprobadas.

## Bloque 17 · Validación completa

- Fecha: 2026-11-20
- Alcance: tipos y suite completa sin instalación externa ni despliegue.
- Prueba: `npm test`
- Resultado: 4 suites aprobadas, 7 pruebas aprobadas.
- Verificación adicional: `npx tsc --noEmit`, aprobado.

## Bloque 14 · Login y registro

- Fecha: 2026-11-20
- Alcance: pantallas de autenticación, sesión persistente y comprobación inicial.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores.
- Verificación adicional: `npm test`, 3 suites y 5 pruebas aprobadas.

## Bloque 11 · Accelerometer

- Fecha: 2026-11-20
- Alcance: disponibilidad, suscripción limpia y alternativa «Sorpréndeme».
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.

## Bloque 10 · Image Picker

- Fecha: 2026-11-20
- Alcance: galería con explicación, permiso contextual y alternativa sin portada.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.

## Bloque 9 · Gestos y accesibilidad

- Fecha: 2026-11-20
- Alcance: swipe izquierdo/derecho, pulsación larga, pinch y alternativas por botón.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.

## Bloque 8 · Contadores

- Fecha: 2026-11-20
- Alcance: total de libros, leídos y prestados.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.

## Bloque 7 · Préstamos locales

- Fecha: 2026-11-20
- Alcance: registrar préstamo, rechazar duplicado, devolver y listar préstamos.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.

## Bloque 6 · Formularios y detalle

- Fecha: 2026-11-20
- Alcance: alta, edición, validación visible y confirmación de eliminación.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.

## Bloque 5 · Búsqueda y filtros

- Fecha: 2026-11-20
- Alcance: búsqueda incremental, filtros por estado y estado vacío.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.

## Bloque 4 · CRUD local

- Fecha: 2026-11-20
- Alcance: repositorios SQL parametrizados y servicio crear/listar/editar/eliminar.
- Prueba: `npx tsc --noEmit`
- Resultado: aprobado, 0 errores de TypeScript.
