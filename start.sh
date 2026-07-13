#!/bin/bash
# =========================================================================
# SCRIPT DE INICIO PERSONALIZADO PARA COPIAR MODS DESDE GITHUB AL VOLUMEN
# =========================================================================

echo "[Auto-Mods] Copiando mods desde el repositorio de GitHub al volumen persistente..."

# Crea la carpeta de mods en el volumen si no existe
mkdir -p /data/mods

# Copia todos los mods de la caché de la imagen al volumen (sobrescribiendo los viejos)
cp -f /mods-cache/* /data/mods/ 2>/dev/null || true

echo "[Auto-Mods] Mods copiados con éxito. Iniciando el servidor de Minecraft..."

# Ejecuta el script de inicio original de la imagen itzg/minecraft-server
exec /start
