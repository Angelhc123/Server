# =========================================================================
# CONFIGURACIÓN DEL SERVIDOR DE MINECRAFT EN RAILWAY
# =========================================================================
# Usa la imagen base oficial de itzg para servidores de Minecraft en Docker
FROM itzg/minecraft-server:latest

# --- 1. CONFIGURACIÓN BÁSICA Y LICENCIA ---
# Aceptar el EULA de Minecraft (Obligatorio para que inicie el servidor)
ENV EULA=TRUE

# --- 2. CONFIGURACIÓN DE VERSIONES Y TIPOS (Fácil de cambiar) ---
# Tipo de servidor: VANILLA, PAPER, FORGE, FABRIC, PURPUR, SPIGOT, etc.
ENV TYPE=VANILLA

# Versión del juego: LATEST, 1.20.4, 1.20.1, 1.19.2, 1.18.2, etc.
ENV VERSION=1.20.4

# --- 3. RECURSOS Y RENDIMIENTO ---
# Memoria RAM máxima y mínima que usará el servidor (ej: 2G, 4G)
# Ajusta según los recursos de tu plan en Railway.
ENV MEMORY=2G

# --- 4. CONFIGURACIÓN DEL JUEGO (Opciones del Servidor) ---
# Mensaje del día (MOTD) que aparece en la lista de servidores
ENV MOTD="¡Servidor de Minecraft en Railway!"

# Modo de juego por defecto: SURVIVAL, CREATIVE, ADVENTURE, SPECTATOR
ENV MODE=survival

# Dificultad: PEACEFUL, EASY, NORMAL, HARD
ENV DIFFICULTY=normal

# Cantidad máxima de jugadores permitidos al mismo tiempo
ENV MAX_PLAYERS=20

# Habilitar o deshabilitar el combate PvP (true / false)
ENV PVP=true

# --- 5. ACCESO Y SEGURIDAD ---
# ONLINE_MODE: 
# - true: Solo permite cuentas premium (compradas).
# - false: Permite cuentas no premium / piratas (TLauncher, etc.).
ENV ONLINE_MODE=true

# Administradores del servidor (Jugadores con OP).
# Agrega tu nombre de usuario de Minecraft aquí (separado por comas si son varios).
# Ejemplo: ENV OPS=MiUsuarioMinecraft,AmigoMinecraft
ENV OPS=""

# Habilitar lista blanca / whitelist (true / false)
ENV ENABLE_WHITELIST=false

# --- 6. GENERACIÓN DEL MUNDO ---
# Semilla del mundo (Déjalo vacío para una semilla aleatoria)
ENV SEED=""

# Nombre de la carpeta del mundo (Por defecto es "world")
ENV LEVEL=world

# Generar estructuras como aldeas, templos, etc. (true / false)
ENV GENERATE_STRUCTURES=true

# --- 7. RED Y PUERTOS ---
# Expone el puerto por defecto de Minecraft (TCP 25565)
EXPOSE 25565

# Directorio interno donde se guardará todo el progreso (Mundo, configs, plugins)
VOLUME /data
