# Usa la imagen base de itzg/minecraft-server que maneja automáticamente la descarga e inicio de Minecraft
FROM itzg/minecraft-server:latest

# ---------------------------------------------------------
# CONFIGURACIÓN BÁSICA DEL SERVIDOR
# ---------------------------------------------------------

# Aceptar los términos de licencia de Minecraft (EULA) - Obligatorio para arrancar el servidor
ENV EULA=TRUE

# Tipo de servidor de Minecraft. Ejemplos:
# - VANILLA (Predeterminado, sin mods)
# - PAPER (Optimizado para plugins de Spigot/Paper)
# - FABRIC (Para mods usando la plataforma Fabric)
# - FORGE (Para mods usando la plataforma Forge)
ENV TYPE=VANILLA

# Versión del juego. Ejemplos:
# - LATEST (Última versión estable)
# - 1.20.4, 1.20.1, 1.19.2, etc.
# Cambia esta línea para actualizar o bajar de versión fácilmente.
ENV VERSION=1.20.4

# ---------------------------------------------------------
# RENDIMIENTO Y MEMORIA
# ---------------------------------------------------------

# Memoria asignada al servidor de Minecraft.
# Ajusta este valor según la capacidad de tu plan de Railway.
# Ejemplo: 2G (2 Gigabytes), 4G (4 Gigabytes)
ENV MEMORY=2G

# ---------------------------------------------------------
# CONFIGURACIÓN DE RED Y DATOS
# ---------------------------------------------------------

# Expone el puerto estándar de Minecraft
EXPOSE 25565

# La imagen base almacena todos los datos del mundo en la carpeta /data.
# Se recomienda montar un volumen de Railway en esta ruta para no perder progreso al reiniciar.
VOLUME /data
