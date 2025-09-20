# Practica 1 — API de Mensajes (Express + PostgreSQL + Docker)

API para registro/login con JWT, publicación de mensajes, follow/unfollow y búsquedas.

## 🚀 Stack
- **Node.js 20**, **Express 4**
- **PostgreSQL 16**
- **Docker / Docker Compose**
- **Swagger UI** (docs en `/docs`)
- JWT con **jsonwebtoken**

---

## 📁 Estructura
```
.
├─ src/
│  ├─ index.js
│  ├─ db.js
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ messages.js
│  │  └─ users.js
│  └─ docs/
│     └─ openapi.yaml
├─ db/
│  └─ init/           # SQL de bootstrap (001-init.sql)
├─ .env
├─ Dockerfile
├─ docker-compose.yml
└─ package.json
```
---

## ⚙️ Variables de entorno (.env)

Crea un archivo **.env** en la raíz:

```
# DB
DB_HOST=db
DB_PORT=5432
DB_NAME=practica1
DB_USER=postgres
DB_PASSWORD=postgres

# API
PORT=3000
NODE_ENV=development
JWT_SECRET=mi_clave_secreta_super_segura
JWT_EXPIRES=7d
```
## 🐳 Levantar con Docker

```bash
# 1) Build + up
docker compose up -d --build

# 2) Ver logs de la app
docker compose logs -f app

# 3) Detener
docker compose down

# 4) Reset duro (borra datos y node_modules del contenedor)
docker compose down -v
docker volume rm practica1-samuelbeteta_db_data practica1-samuelbeteta_node_modules
```

La API corre en: **http://localhost:3000**  
Swagger UI: **http://localhost:3000/docs**

---

## 🗃️ Base de datos

Tablas principales:

- `"USER"(id_user SERIAL PK, username, display_name, email, password, dob, bio, created_at, updated_at)`
- `"MESSAGE"(id_message SERIAL PK, id_user FK→USER, body, created_at)`
- `"FOLLOWER"(id_follower FK→USER, id_followee FK→USER, PK compuesta)`
- `"FOLLOW"(id_follower, id_followee, follow_date)` con FK al par en `FOLLOWER`

> Las `FK` evitan borrar un usuario con mensajes sin manejar previamente sus dependencias.

---

## 🔐 Autenticación
- **POST /auth/register**: crea usuario (dob en **YYYY-MM-DD**).
- **POST /auth/login**: devuelve `{ token, user }`.
- Rutas protegidas requieren header:  
  `Authorization: Bearer <token>`

---

## 🧠 Reglas de Mensajes
- Al crear un mensaje, el servidor etiqueta el autor en `body` con `--author:{id}` para poder hacer joins rápidos con FOLLOW.
- Endpoints que devuelven **exactamente 10** resultados (desc):  
  - **GET /messages/latest**  
  - **GET /messages/following/{id}**

---

## 🔌 Endpoints principales

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Mensajes
- `GET /messages/latest` → 10 últimos (desc).
- `GET /messages/search?q=texto`
- `POST /messages` *(JWT)* → crea mensaje.
- `GET /messages/user/{id}` → mensajes por usuario (puedes añadir `?limit=` si lo dejaste habilitado).

### Usuarios
- `GET /users/{id}`
- `DELETE /users/{id}` *(JWT, solo self)* → borra usuario + sus mensajes + follows.
- `POST /users/{id}/follow/{targetId}` *(JWT)*  
  Respuesta:
  ```json
  { "follower": 1, "followee": 2, "message": "Ahora sigues a este usuario." }
  ```
- `DELETE /users/{id}/follow/{targetId}` *(JWT)*  
  Respuesta:
  ```json
  { "follower": 1, "followee": 2, "message": "Has dejado de seguir a este usuario." }
  ```

---

## 🧪 Ejemplos (cURL)

**Registrar**
```bash
curl -X POST http://localhost:3000/auth/register   -H "Content-Type: application/json"   -d '{"username":"sam","display_name":"Samuel Beteta","email":"sam@example.com","password":"pass123","dob":"2003-06-03"}'
```

**Login**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"sam@example.com","password":"pass123"}' | jq -r .token)
echo $TOKEN
```

**Crear mensaje**
```bash
curl -X POST http://localhost:3000/messages   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -d '{"body":"Hola a todos!"}'
```

**Últimos 10**
```bash
curl http://localhost:3000/messages/latest
```

**Buscar**
```bash
curl "http://localhost:3000/messages/search?q=hola"
```

**Seguir**
```bash
# id=1 sigue a targetId=2
curl -X POST http://localhost:3000/users/1/follow/2   -H "Authorization: Bearer $TOKEN"
```

**Dejar de seguir**
```bash
curl -X DELETE http://localhost:3000/users/1/follow/2   -H "Authorization: Bearer $TOKEN"
```

**Eliminar usuario (self)**
```bash
curl -X DELETE http://localhost:3000/users/1   -H "Authorization: Bearer $TOKEN"
```

---

## 🧭 Probar con Postman

1) Crear **environment** con:
- `baseUrl = http://localhost:3000`
- `token = <vacío>`

2) **Login** → copia `token` en el env.  
3) En requests protegidos agrega header:
```
Authorization: Bearer {{token}}
```

---

## 🛠️ Desarrollo

```bash
# dentro del contenedor
docker compose exec app npm install
docker compose exec app npm run dev   # nodemon
```

**Hot reload**: se monta `./src` en el contenedor.  
**Swagger**: actualiza `src/docs/openapi.yaml` y reinicia nodemon.
---
