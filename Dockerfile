FROM node:20-alpine

WORKDIR /usr/src/app

# Instalar deps primero (cache)
COPY package*.json ./
RUN npm install

# Copiar código
COPY src ./src

EXPOSE 3000
CMD ["npm", "run", "start"]
