FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código del proyecto (no solo src)
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
