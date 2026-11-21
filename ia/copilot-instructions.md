
# Reglas de trabajo — Biblioteca Personal

## 1. Objetivo
Construir una aplicación móvil de biblioteca personal y una API independiente, respetando la especificación académica del proyecto.

## 2. Tecnologías obligatorias
- Aplicación: Expo, React Native, TypeScript y Expo Router.
- Persistencia local: SQLite.
- Sesiones seguras: expo-secure-store.
- API: Next.js App Router y Route Handlers.
- Backend: Firebase Admin SDK, Firebase Authentication y Firestore.
- Validación: Zod.
- Pruebas: Vitest.
- Imágenes: Vercel Blob.

No reemplazar estas tecnologías sin autorización expresa.

## 3. Arquitectura
- Mantener la aplicación móvil y la API en repositorios independientes.
- La aplicación consume la API mediante HTTPS.
- La aplicación no debe conectarse directamente a Firestore.
- Las credenciales privadas solo pueden existir en el entorno seguro del servidor.
- Mantener responsabilidades separadas entre componentes, servicios, repositorios y API.

## 4. Seguridad obligatoria
- No solicitar, mostrar, copiar ni leer archivos `.env`, claves privadas, certificados, tokens o credenciales.
- No incluir secretos en el código, APK, repositorio o registros.
- No modificar permisos de seguridad ni desactivar el sandbox.
- No ejecutar comandos con privilegios elevados.
- No acceder a carpetas personales ajenas al repositorio.
- No enviar información privada a servicios externos.
- No cambiar reglas de autenticación o autorización sin explicar primero el impacto y recibir autorización.

## 5. Restricciones de cambios
- Trabajar únicamente dentro del repositorio abierto.
- No eliminar archivos ni carpetas existentes sin autorización.
- No sobrescribir configuraciones existentes sin revisarlas.
- No instalar dependencias innecesarias.
- No modificar Git, ramas, remotos ni historial sin autorización.
- No realizar commits ni publicaciones sin autorización expresa.

## 6. Calidad del código
- Usar TypeScript estricto.
- Evitar `any` cuando exista una alternativa tipada.
- Validar entradas y errores.
- Mantener nombres claros y consistentes.
- Evitar duplicación de código.
- Añadir pruebas para la lógica importante.
- No afirmar que algo funciona sin ejecutar las verificaciones correspondientes.

## 7. Forma de trabajo
Antes de modificar archivos:
1. Inspeccionar la estructura relevante.
2. Explicar qué se va a cambiar.
3. Identificar posibles riesgos.
4. Solicitar autorización si el cambio es destructivo o afecta recursos externos.

Después de modificar:
1. Mostrar los archivos afectados.
2. Explicar los cambios.
3. Ejecutar pruebas y verificaciones pertinentes.
4. Informar cualquier problema pendiente.

## 8. Regla fundamental
La especificación académica del proyecto tiene prioridad sobre las decisiones improvisadas del agente. Si existe una contradicción, detenerse y consultarla antes de implementar.

## 9. Evidencia obligatoria
- Mantener una prueba verificable de esta configuración en `ia/verify-ai-config.mjs`.
- Ejecutarla con `node ia/verify-ai-config.mjs`.
- Registrar cada ejecución en `ia/bitacora.md` con fecha, prueba realizada y resultado real.
- Antes de modificar el primer repositorio de código, conservar evidencias de que las reglas anteriores están versionadas.

## 10. Permisos y acciones externas
- No leer `.env*`, certificados, keystores, cuentas de servicio ni archivos de credenciales.
- No salir de `C:\Users\aleja\Documents\BibliotecaPersonal\01-biblioteca-personal-app` para modificar archivos.
- Las acciones externas, incluidas instalaciones, despliegues, commits, push, Firebase y Vercel, requieren autorización expresa.
- Ninguna restricción puede desactivarse para obtener una aprobación superficial.
