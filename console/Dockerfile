# Usa una imagen ligera de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del paquete
COPY package*.json ./

# Instala solo las dependencias de producción
RUN npm install --production

# Copia el resto del código del panel web
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Arranca el servidor
CMD ["npm", "start"]
