# Biblioteca Personal App

Aplicación Expo/React Native/TypeScript con Expo Router y SQLite local.

## Inicio

```bash
npm install
```

La app ya está configurada para consultar la API HTTPS de producción mediante
`EXPO_PUBLIC_API_URL`. Para desarrollo local, copia `.env.example` a `.env.local`
y cambia el valor solo si vas a usar otra API:

```powershell
Copy-Item .env.example .env.local
npx expo start
```

Los libros se guardan primero en SQLite para que la app siga funcionando sin
conexión. La sincronización con la API se ejecuta al abrir las pestañas de libros
o préstamos, al recuperar la conectividad y al volver a primer plano mientras
una de esas pestañas está activa. Si una operación remota falla, el cambio
permanece pendiente localmente y la pantalla permite reintentar. Las portadas
locales se reducen y suben durante la sincronización.

Configure `EXPO_PUBLIC_API_URL` con la URL pública HTTPS de la API.
Esta variable no contiene secretos.

URL actual de la API desplegada:

```text
https://biblioteca-personal-api.vercel.app
```

## Usuario de prueba local

En builds de desarrollo (`__DEV__`), se puede entrar sin conectar con la API
usando estas credenciales en la pantalla de inicio de sesión:

```text
Correo: demo@biblioteca.local
Contraseña: biblioteca123
```

Esta sesión es solo local: los libros se guardan en SQLite y las solicitudes a
la API se bloquean mientras se usa la cuenta demo. No crea una cuenta en el
servidor y no está disponible en builds de producción.

## Despliegue móvil

Este repositorio es Expo/React Native (no Vite). La app no inicializa el SDK web
de Firebase: autenticación y datos pasan por la API. Las variables `VITE_*` del
archivo de configuración web no se copian al APK; `VITE_API_URL` corresponde a
`EXPO_PUBLIC_API_URL`, y la API usa la clave web de Firebase solo en su servidor.

Para generar el APK de producción, usa EAS Build desde este directorio:

```bash
npx eas-cli build --platform android --profile production
```

El perfil de producción ya incluye la URL HTTPS de la API. Antes de compilar,
confirma que la API está desplegada y que Firebase Authentication tiene habilitado
el proveedor Email/Password.

## Scripts

```bash
npm test
npx tsc --noEmit
npx expo start
```

## Seguridad

- Los tokens se guardan en `expo-secure-store`.
- La app no incluye Firebase Admin, Firebase web config, claves privadas ni tokens de Blob.
- Las variables secretas viven exclusivamente en Vercel.
- Las llamadas requieren HTTPS y no usan `localhost` dentro del APK.
