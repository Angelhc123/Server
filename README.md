# Servidor de Minecraft para GitHub y Railway 🎮

Este repositorio contiene la configuración lista para desplegar tu propio servidor de Minecraft en [Railway](https://railway.app/) de manera fácil, económica y completamente personalizable.

---

## 🛠️ Cómo cambiar de versión fácilmente

Para cambiar la versión de Minecraft, solo debes editar el archivo `Dockerfile` en este repositorio:

1. Abre el archivo [Dockerfile](file:///home/desci2/Documentos/Maincra/Dockerfile).
2. Busca la línea que dice:
   ```dockerfile
   ENV VERSION=1.20.4
   ```
3. Cambia `1.20.4` por la versión que desees (por ejemplo: `1.21`, `1.19.2`, etc., o `LATEST` para la versión estable más reciente).
4. Guarda el archivo, haz commit y empújalo (push) a tu repositorio de GitHub. ¡Railway detectará el cambio y reconstruirá tu servidor automáticamente!

---

## 🔌 Cómo activar Plugins o Mods en el futuro

Por defecto, el servidor se inicia en modo **Vanilla** (sin mods). Si en el futuro quieres añadir mods o plugins, puedes hacerlo cambiando la configuración en el `Dockerfile`:

### Para Plugins (Spigot, Paper, Purpur)
1. En [Dockerfile](file:///home/desci2/Documentos/Maincra/Dockerfile), cambia la línea `ENV TYPE=VANILLA` por:
   ```dockerfile
   ENV TYPE=PAPER
   ```
2. Puedes instalar plugins agregando una variable de entorno en tu panel de Railway llamada `PLUGINS` con enlaces directos de descarga separados por comas, o usando mods/plugins cargados en el volumen `/data/plugins`.

### Para Mods (Fabric / Forge)
1. En [Dockerfile](file:///home/desci2/Documentos/Maincra/Dockerfile), cambia la línea `ENV TYPE=VANILLA` por:
   ```dockerfile
   ENV TYPE=FABRIC
   # O si prefieres Forge:
   # ENV TYPE=FORGE
   ```
2. Para instalar mods automáticamente, puedes añadir la variable de entorno `MODS` en Railway con enlaces directos a los archivos `.jar` de los mods (separados por comas), o subirlos directamente a la carpeta `/data/mods` a través de un cliente SFTP o gestor de volumen si tu panel de Railway lo permite.
3. Para Fabric, también puedes indicar qué versión del cargador (loader) usar si es necesario.

---

## 🚀 Guía paso a paso para desplegar en Railway

Sigue estos pasos detallados para hospedar tu servidor:

### Paso 1: Subir este código a GitHub
1. Crea un repositorio privado o público en tu cuenta de GitHub (por ejemplo, `mi-servidor-minecraft`).
2. Sube los archivos de este directorio (`Dockerfile`, `.gitignore` y `README.md`) a tu repositorio.

### Paso 2: Crear el servicio en Railway
1. Inicia sesión en [Railway.app](https://railway.app/).
2. Haz clic en **New Project** y selecciona **Deploy from GitHub repo**.
3. Elige tu repositorio de Minecraft.
4. Railway detectará automáticamente el `Dockerfile` y comenzará a compilar el contenedor.

### Paso 3: Configurar persistencia (¡CRÍTICO! ⚠️)
Por defecto, los servidores en la nube borran los datos cuando se reinician. Necesitamos crear un disco persistente (Volumen) para que tu mundo no se borre:
1. En tu proyecto de Railway, haz clic en el servicio de tu servidor de Minecraft.
2. Ve a la pestaña **Volumes** (Volúmenes) y haz clic en **Add Volume**.
3. Ponle un tamaño (ej. `5GB` o `10GB` es más que suficiente para empezar).
4. Configura el **Mount Path** (Ruta de montaje) como:
   ```text
   /data
   ```
5. Railway reiniciará el contenedor para montar el volumen. ¡Ahora tu mundo y configuraciones están a salvo!

### Paso 4: Crear un puerto TCP para conectar al juego (¡CRÍTICO! ⚠️)
Minecraft no usa HTTP/HTTPS normales, requiere una conexión TCP directa:
1. En el servicio de tu servidor en Railway, ve a la pestaña **Settings** (Configuración).
2. Desplázate hacia abajo hasta la sección **Network** (Red).
3. Haz clic en **Add TCP Proxy**.
4. Railway generará una dirección y un puerto público. Se verá algo similar a esto:
   `services-production.up.railway.app:12345` o `monorail.proxy.rlwy.net:xxxxx`.
5. **¡Esta dirección completa es la que tú y tus amigos usarán para conectarse en el juego!**

---

## ⚙️ Ajustes opcionales de Rendimiento

Si notas que el servidor necesita más recursos o quieres cambiar la memoria RAM:
- Cambia la variable `ENV MEMORY=2G` en el `Dockerfile` a un valor más alto (ej. `3G` o `4G`), asegurándote de que tu plan de Railway soporte esa cantidad de RAM.
