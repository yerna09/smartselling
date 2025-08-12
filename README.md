# API Backend para Mercado Libre Integration

Este proyecto es un backend completo en Flask que permite:

- ✅ Registro y login de usuarios con JWT que expira a los 30 días
- ✅ Integración OAuth2 con Mercado Libre
- ✅ Gestión de tokens de acceso y refresh de ML
- ✅ Rutas protegidas para consultar datos de Mercado Libre
- ✅ Manejo de errores y validaciones

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

2. **Configurar variables de entorno:**
Edita el archivo `.env` y agrega tus credenciales de Mercado Libre:

```env
ML_CLIENT_ID=TU_CLIENT_ID_REAL
ML_CLIENT_SECRET=TU_CLIENT_SECRET_REAL
SECRET_KEY=una_clave_super_segura_para_jwt
```

3. **Ejecutar la aplicación:**
```bash
python app.py
```

La aplicación se ejecutará en `http://localhost:5000`

## 📚 API Endpoints

### Autenticación

#### `POST /register`
Registra un nuevo usuario.

**Request:**
```json
{
    "username": "usuario123",
    "password": "contraseña123"
}
```

**Response:**
```json
{
    "message": "User registered successfully",
    "user_id": 1,
    "username": "usuario123"
}
```

#### `POST /login`
Inicia sesión y obtiene un token JWT.

**Request:**
```json
{
    "username": "usuario123",
    "password": "contraseña123"
}
```

**Response:**
```json
{
    "message": "Logged in successfully",
    "user_id": 1,
    "username": "usuario123",
    "ml_linked": false
}
```

#### `POST /logout`
Cierra sesión (requiere token).

### Perfil de Usuario

#### `GET /profile`
Obtiene información del perfil del usuario (requiere token).

**Headers:**
```
x-access-token: tu_jwt_token
```

**Response:**
```json
{
    "user_id": 1,
    "username": "usuario123",
    "ml_linked": true,
    "ml_user_id": "123456789",
    "created_at": "2025-08-11T10:30:00"
}
```

### Integración Mercado Libre

#### `GET /mercadolibre/auth`
Obtiene la URL para autorizar acceso a Mercado Libre (requiere token).

**Response:**
```json
{
    "auth_url": "https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=...",
    "message": "Redirect user to this URL to authorize Mercado Libre access"
}
```

#### `GET /mercadolibre/callback`
Recibe el código de autorización de ML y obtiene los tokens (requiere token).

#### `GET /mercadolibre/data`
Obtiene datos del perfil de Mercado Libre (requiere token y ML vinculado).

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": 123456789,
        "nickname": "USUARIO123",
        "email": "usuario@email.com",
        "first_name": "Usuario",
        "last_name": "Apellido"
    }
}
```

#### `POST /mercadolibre/refresh`
Refresca el token de acceso de Mercado Libre (requiere token).

## 🔒 Autenticación

Todas las rutas protegidas requieren un token JWT que puede enviarse de dos maneras:

1. **Header:** `x-access-token: tu_jwt_token`
2. **Cookie:** Se establece automáticamente al hacer login

## 🔄 Flujo de Integración con Mercado Libre

1. **Usuario se registra/loguea** → Obtiene token JWT
2. **Usuario solicita vincular ML** → GET `/mercadolibre/auth`
3. **Frontend redirige** → Usuario autoriza en ML
4. **ML redirige de vuelta** → GET `/mercadolibre/callback?code=...`
5. **Backend obtiene tokens** → Guarda access_token y refresh_token
6. **Usuario puede consultar datos** → GET `/mercadolibre/data`

## 🗃️ Base de Datos

Se usa SQLite con el modelo:

```python
class User(db.Model):
    id = Integer (Primary Key)
    username = String (Unique)
    password = String
    token = String (JWT Token)
    ml_access_token = String
    ml_refresh_token = String
    ml_user_id = String
    created_at = DateTime
```

## 🛡️ Seguridad

- Tokens JWT con expiración de 30 días
- Cookies httponly para mayor seguridad
- Validación de tokens en cada request
- Manejo de tokens expirados
- Refresh automático de tokens ML

## 🔧 Para Producción

1. Cambiar `SECRET_KEY` por una clave segura
2. Usar una base de datos más robusta (PostgreSQL)
3. Implementar hash de contraseñas (bcrypt)
4. Configurar HTTPS
5. Usar variables de entorno reales
6. Configurar CORS si es necesario

## 📝 Próximos Pasos

- [ ] Frontend React/Vue para la interfaz
- [ ] Hash de contraseñas con bcrypt
- [ ] Middleware CORS
- [ ] Logging y monitoreo
- [ ] Tests unitarios
- [ ] Documentación con Swagger
