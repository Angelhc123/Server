# Servidor de Minecraft para Railway (Especificaciones Completas) 🎮

Este repositorio contiene la plantilla definitiva y completamente configurada para desplegar un servidor de Minecraft en [Railway](https://railway.app/), junto con un **Panel Web de Control** privado (consola en vivo RCON, cambio de versión, restablecimiento del mundo y monitor de almacenamiento).

---

## ⚙️ Archivo de Configuración del Servidor: `Dockerfile`

Todas las especificaciones del servidor de Minecraft se editan directamente en el archivo [Dockerfile](file:///home/desci2/Documentos/Maincra/Dockerfile):

*   `VERSION`: Versión de Minecraft (ej: `1.20.4`, `1.21`, `LATEST`).
*   `TYPE`: Motor de servidor (`VANILLA`, `PAPER`, `FABRIC`, `FORGE`).
*   `ONLINE_MODE`: Cambia a `false` para permitir cuentas no-premium (piratas/TLauncher).
*   `OPS`: Nombres de administradores separados por comas.
*   `MEMORY`: RAM asignada (ej: `2G`, `4G`).
*   `MOTD`, `MAX_PLAYERS`, `PVP`, `SEED`, `DIFFICULTY`, `MODE`.

---

## 🖥️ Panel Web de Control (Consola RCON y Administración)

Ubicado en la carpeta `/console`. Es una aplicación web en Node.js que te permite administrar el juego desde tu navegador de forma segura.

### Cómo desplegar el Panel Web en Railway:

Dado que está en el mismo repositorio (monorepo), puedes agregar el panel web como un segundo servicio en tu proyecto de Railway:

1. Ve a tu proyecto en Railway, haz clic en **New** (Nuevo) -> **GitHub Repo** y selecciona este mismo repositorio.
2. Railway creará un segundo bloque. Haz clic sobre él para abrir su configuración.
3. Ve a la pestaña **Settings** (Configuración) y en la sección **General**, busca **Root Directory** (Directorio Raíz). Escribe:
   ```text
   /console
   ```
4. Guarda los cambios. Railway ahora compilará y ejecutará el Panel Web usando el Dockerfile de la subcarpeta `/console`.

### Configurar Variables del Panel Web (¡CRÍTICO! ⚠️)

Para que el panel web pueda enviar comandos a Minecraft y comunicarse con la API de Railway para cambiar de versión o reiniciar mundos, ve a la pestaña **Variables** del servicio del **Panel Web** y añade las siguientes variables:

#### 1. Para conectar la Consola RCON:
*   `RCON_PASSWORD` = `minecraft_secret_123` (Debe ser la misma contraseña que pusiste en el `Dockerfile` de Minecraft).
*   `RCON_HOST` = `server.railway.internal` (Es el dominio privado de red de tu servidor de Minecraft).

#### 2. Para conectar la API de Railway (Activar cambio de versión, almacenamiento y reinicio):
Genera una clave de API en tu cuenta de Railway (**Account Settings** -> **Tokens**) y configúrala junto con los IDs del proyecto:
*   `RAILWAY_API_TOKEN` = *(Tu Token de API personal de Railway)*
*   `RAILWAY_PROJECT_ID` = *(ID del proyecto actual)*
*   `RAILWAY_ENVIRONMENT_ID` = *(ID del entorno, ej: `production`)*
*   `RAILWAY_SERVICE_ID` = *(ID del servicio de tu servidor de Minecraft)*
*   `RAILWAY_VOLUME_ID` = *(ID de la instancia del volumen de tu almacenamiento)*

*(Nota: Los IDs de Railway se copian muy fácil abriendo el buscador rápido de Railway `Cmd+K` o `Ctrl+K` y seleccionando la opción de copiar ID correspondientes).*

---

## 🚀 Guía de Despliegue del Servidor (Resumen)

1. **Subir a GitHub**: Guarda y sube todos los archivos a tu repositorio.
2. **Desplegar Servidor**: Crea el servicio del Servidor en Railway. Compilará automáticamente gracias a `railway.json` y el `Dockerfile` sin la línea incompatible de volumen.
3. **Volumen de datos**: Crea un volumen (clic derecho en Canvas -> Volume) mapeado a la ruta `/data` y conéctalo al servicio `Server`.
4. **IP Pública (Proxy TCP)**: Ve a `Settings` -> `Network` del servicio `Server`, haz clic en **Add TCP Proxy** y escribe el puerto `25565`. Obtendrás la dirección de conexión.
5. **Panel Web**: Despliega el panel web siguiendo las instrucciones de la sección anterior y obtén su enlace público mediante **Generate Domain** (ya que el panel web sí usa HTTP normal).
