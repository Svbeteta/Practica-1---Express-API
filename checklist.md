## Checklist de Rutas API

### Autenticación
[ x] POST /auth/register → Registrar un nuevo usuario
[ ] POST /auth/login → Iniciar sesión de usuario

### Mensajes
[ ] GET /messages/latest → Obtener los últimos 10 mensajes
[ ] GET /messages/search → Buscar mensajes por texto
[ ] POST /messages → Crear un nuevo mensaje
[ ] GET /messages/user/{id} → Obtener mensajes de un usuario
[ ] GET /messages/following/{id} → Obtener mensajes de usuarios seguidos

### Usuarios
[ ] GET /users/{id} → Obtener un usuario por ID
[ ] DELETE /users/{id} → Eliminar un usuario por ID
[ ] POST /users/{id}/follow/{targetId} → Seguir a otro usuario
[ ] DELETE /users/{id}/follow/{targetId} → Dejar de seguir a un usuario
[ ] GET /users/{id}/messages → Obtener mensajes de un usuario (ruta alternativa)
