# SmartSelling - Guía de Desarrollo Local

## 🚀 Configuración de Desarrollo

### Requisitos Previos
- Python 3.8+
- Node.js 18+
- PostgreSQL 12+

### 1. Backend (Flask)

```bash
# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.production .env.development
# Editar .env.development para localhost

# Ejecutar en modo desarrollo
python run_dev.py
```

### 2. Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### 3. URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Base de datos**: localhost:5432/smartselling_test

## 🔧 Configuración Automática

El sistema detecta automáticamente el entorno:

- **localhost** → Modo desarrollo (HTTP, cookies Lax)
- **smartselling.com.ar** → Modo producción (HTTPS, cookies None)

## 📁 Estructura del Proyecto

```
SmartSelling/
├── app.py                 # Backend Flask
├── run_dev.py            # Script desarrollo
├── .env.development      # Config desarrollo
├── .env.production       # Config producción
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js    # Config API centralizada
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   └── components/
│   └── .env              # Variables React
└── requirements.txt
```

## 🐛 Debug y Testing

### Backend
```bash
# Ver logs en tiempo real
python run_dev.py

# Testing específico
python test_api.py
```

### Frontend
```bash
# Consola del navegador muestra:
# 🔧 API Configuration: { Environment: 'Development', API_URL: '...' }

# Testing
npm run lint
```

## 🔄 Flujo de Desarrollo

1. **Desarrollo Local**: Hacer cambios en PC
2. **Testing**: Probar en localhost
3. **Git**: Commit y push
4. **VPS**: Actualizar en producción

## 🚨 Solución de Problemas

### Error de CORS
- Verificar que FRONTEND_URL en .env.development sea http://localhost:3000

### Error de Cookies
- En desarrollo usa SameSite=Lax
- En producción usa SameSite=None con HTTPS

### Error de Base de Datos
- Verificar conexión PostgreSQL
- Verificar credenciales en .env.development
