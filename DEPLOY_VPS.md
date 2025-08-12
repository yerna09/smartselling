# 🚀 Instrucciones de Despliegue para VPS SmartSelling

## 📋 Información del Servidor
- **IP Públicas:** 77.37.126.190, 149.50.141.123
- **Dominios configurados:** 
  - Frontend: `test.smartselling.com.ar`
  - API: `api-test.smartselling.com.ar`
- **SSL:** Let's Encrypt configurado
- **Puerto libre:** 8000 (para Flask)

## 🔧 Pasos de Despliegue

### 1. Conectar al VPS
```bash
ssh root@77.37.126.190
# o
ssh root@149.50.141.123
```

### 2. Preparar el entorno
```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar dependencias necesarias
apt install -y python3 python3-pip python3-venv git nginx postgresql postgresql-contrib

# Verificar servicios
systemctl status postgresql
systemctl status nginx
```

### 3. Configurar PostgreSQL
```bash
# Conectar como usuario postgres
sudo -u postgres psql

# Ejecutar en PostgreSQL:
CREATE DATABASE flask_db;
CREATE USER flask_user WITH PASSWORD 'clave_segura_cambiar_en_produccion';
GRANT ALL PRIVILEGES ON DATABASE flask_db TO flask_user;
ALTER USER flask_user CREATEDB;
\q
```

### 4. Clonar y configurar el proyecto
```bash
# Crear directorio
mkdir -p /var/www/smartselling
cd /var/www/smartselling

# Clonar desde GitHub (después de hacer push)
git clone https://github.com/TU_USUARIO/smartselling.git .

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configurar variables de entorno
```bash
# Editar .env con datos reales
nano .env
```

**Contenido del .env para producción:**
```env
# Aplicación
SECRET_KEY=GENERAR_CLAVE_SUPER_SEGURA_AQUI
FLASK_ENV=production
FLASK_DEBUG=False

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flask_db
DB_USER=flask_user
DB_PASS=clave_segura_cambiar_en_produccion

# URLs de producción
FRONTEND_URL=https://test.smartselling.com.ar
API_URL=https://api-test.smartselling.com.ar

# Mercado Libre OAuth2 - CAMBIAR POR VALORES REALES
ML_CLIENT_ID=TU_CLIENT_ID_REAL_DE_ML
ML_CLIENT_SECRET=TU_CLIENT_SECRET_REAL_DE_ML
ML_REDIRECT_URI=https://api-test.smartselling.com.ar/mercadolibre/callback

# Servidor
SERVER_HOST=127.0.0.1
SERVER_PORT=8000

# SSL
SSL_CERT_PATH=/etc/letsencrypt/live/api-test.smartselling.com.ar/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/api-test.smartselling.com.ar/privkey.pem
```

### 6. Inicializar base de datos
```bash
# Activar entorno virtual
source venv/bin/activate

# Crear tablas
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Tablas creadas')"
```

### 7. Configurar systemd
```bash
# Copiar archivo de servicio
cp config/smartselling.service /etc/systemd/system/

# Editar si es necesario
nano /etc/systemd/system/smartselling.service

# Habilitar y iniciar
systemctl daemon-reload
systemctl enable smartselling
systemctl start smartselling

# Verificar estado
systemctl status smartselling
```

### 8. Configurar Nginx
```bash
# Detener Nginx temporalmente
systemctl stop nginx

# Copiar configuración
cp config/nginx.conf /etc/nginx/sites-available/smartselling

# Habilitar sitio
ln -sf /etc/nginx/sites-available/smartselling /etc/nginx/sites-enabled/

# Remover sitio default si existe
rm -f /etc/nginx/sites-enabled/default

# Probar configuración
nginx -t

# Iniciar Nginx
systemctl start nginx
systemctl enable nginx
```

### 9. Configurar permisos
```bash
# Crear usuario para la app
useradd --system --shell /bin/bash --home /var/www/smartselling smartselling

# Configurar permisos
chown -R smartselling:smartselling /var/www/smartselling
chmod 600 /var/www/smartselling/.env
```

### 10. Verificar funcionamiento
```bash
# Ver logs del servicio
journalctl -u smartselling -f

# Verificar que está escuchando en puerto 8000
ss -tlnp | grep 8000

# Probar endpoints localmente
curl http://localhost:8000/
curl https://api-test.smartselling.com.ar/
curl https://test.smartselling.com.ar/
```

## 🔧 Configuración de Mercado Libre

### 1. Crear App en ML Developers
1. Ir a https://developers.mercadolibre.com.ar
2. Crear nueva aplicación
3. Configurar:
   - **Nombre:** SmartSelling Test
   - **Descripción:** Integración de prueba SmartSelling
   - **Redirect URI:** `https://api-test.smartselling.com.ar/mercadolibre/callback`
   - **Permisos:** read, write (según necesidades)

### 2. Obtener credenciales
1. Copiar **Client ID** y **Client Secret**
2. Actualizar `.env` con valores reales:
```bash
nano /var/www/smartselling/.env
# Actualizar ML_CLIENT_ID y ML_CLIENT_SECRET
```

### 3. Reiniciar servicio
```bash
systemctl restart smartselling
```

## 🚨 Solución de Problemas

### Error de conexión a PostgreSQL
```bash
# Verificar PostgreSQL
systemctl status postgresql
sudo -u postgres psql -c "\l"

# Reiniciar si es necesario
systemctl restart postgresql
```

### Error de permisos SSL
```bash
# Verificar certificados
certbot certificates
ls -la /etc/letsencrypt/live/

# Renovar si es necesario
certbot renew
```

### Puerto 8000 ocupado
```bash
# Ver qué usa el puerto
lsof -i :8000

# Cambiar puerto en .env si es necesario
nano /var/www/smartselling/.env
# SERVER_PORT=8001

# Reiniciar servicio
systemctl restart smartselling
```

### Nginx no inicia
```bash
# Verificar configuración
nginx -t

# Ver logs de error
tail -f /var/log/nginx/error.log

# Verificar que los dominios resuelven
nslookup test.smartselling.com.ar
nslookup api-test.smartselling.com.ar
```

## 📊 Comandos de Monitoreo

```bash
# Ver logs en tiempo real
journalctl -u smartselling -f

# Estado de servicios
systemctl status smartselling nginx postgresql

# Ver conexiones
ss -tlnp | grep -E "(80|443|8000|5432)"

# Espacio en disco
df -h

# Memoria y CPU
htop
```

## 🔄 Actualizaciones Futuras

```bash
# Para actualizar el código:
cd /var/www/smartselling
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
systemctl restart smartselling
```

## 🎯 URLs Finales

Después del despliegue exitoso:
- **Frontend:** https://test.smartselling.com.ar
- **API:** https://api-test.smartselling.com.ar
- **Docs API:** https://api-test.smartselling.com.ar (muestra endpoints)

## ✅ Checklist Final

- [ ] PostgreSQL configurado y corriendo
- [ ] Aplicación Flask iniciada en puerto 8000
- [ ] Nginx configurado con SSL
- [ ] Dominios resolviendo correctamente
- [ ] Credenciales ML configuradas
- [ ] Logs sin errores
- [ ] Frontend accesible
- [ ] API respondiendo
- [ ] Flujo de registro/login funcionando
- [ ] Integración ML probada
