# Servidor de Minecraft para Railway (Especificaciones Completas) 🎮

Este repositorio contiene la plantilla definitiva y completamente configurada para desplegar un servidor de Minecraft en [Railway](https://railway.app/). 

Se incluye un archivo de automatización `railway.json` para indicarle a Railway de forma explícita cómo compilar el servidor usando Docker, evitando cualquier fallo de compilación automático.

---

## ⚙️ Archivo de Configuración Completo: `Dockerfile`

Todas las especificaciones del servidor se editan directamente en el archivo [Dockerfile](file:///home/desci2/Documentos/Maincra/Dockerfile). A continuación tienes la lista de variables que puedes cambiar:

### Configuración del Servidor y Versión
*   `VERSION`: Cambia la versión de Minecraft (ej: `1.20.4`, `1.21`, `1.18.2` o `LATEST`).
*   `TYPE`: Cambia el motor del servidor (`VANILLA` para juego original, `PAPER` para plugins, `FABRIC` o `FORGE` para mods).
*   `MEMORY`: RAM asignada al servidor (ej: `2G` para 2 Gigabytes, `4G` para 4 Gigabytes).

### Propiedades del Mundo e Interacción
*   `ONLINE_MODE`: 
    *   `true`: Solo entran cuentas Premium originales.
    *   `false`: Permite entrar a jugadores No-Premium (TLauncher, launchers piratas, etc.).
*   `OPS`: Agrega nombres de jugadores administradores separados por comas para que tengan permisos de comandos (ej: `MiNombreUsuario,Amigo1`).
*   `MOTD`: El texto de descripción que verán los jugadores en la lista de servidores multijugador.
*   `MAX_PLAYERS`: Límite máximo de jugadores simultáneos (ej: `20`).
*   `MODE`: Modo de juego (`survival`, `creative`, `adventure`, `spectator`).
*   `DIFFICULTY`: Dificultad del juego (`peaceful`, `easy`, `normal`, `hard`).
*   `PVP`: Combate entre jugadores (`true` habilitado, `false` deshabilitado).
*   `SEED`: Escribe una semilla específica si quieres generar un mapa concreto.
*   `GENERATE_STRUCTURES`: Si se deben generar aldeas y monumentos (`true`/`false`).

---

## 🛠️ Cómo aplicar los cambios y desplegar

1. **Sube los archivos a GitHub**: Sube los archivos `Dockerfile`, `railway.json`, `.gitignore` y `README.md` actualizados a tu repositorio.
2. **Despliega en Railway**: 
   *   Al detectar el archivo `railway.json`, Railway utilizará el **Dockerfile** automáticamente para compilar el servidor de manera correcta, solucionando el error de compilación anterior.
3. **Crea el Volumen Persistente (Para no perder el Mundo)**:
   *   Haz clic derecho en el fondo oscuro (Project Canvas) de tu panel de Railway.
   *   Selecciona **Volume**.
   *   Asigna un tamaño (ej: `5 GB` o `10 GB`) y en **Mount Path** escribe: `/data`.
   *   Conéctalo a tu servicio del servidor de Minecraft.
4. **Crea el Proxy TCP**:
   *   Entra a la configuración de tu servicio, ve a la pestaña **Settings**.
   *   Baja hasta **Network** y haz clic en **Add TCP Proxy**.
   *   Usa la dirección generada (ej: `xxxx.rlwy.net:yyyyy`) para conectarte dentro de Minecraft.
