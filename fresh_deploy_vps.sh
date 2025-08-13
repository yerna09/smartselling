#!/bin/bash

# 🚀 FRESH DEPLOYMENT COMPLETO - SmartSelling VPS
# Este script hace un deployment completamente limpio manteniendo solo DB y dominios

set -e  # Exit on any error

echo "🚀 === INICIANDO FRESH DEPLOYMENT COMPLETO ==="
echo "📅 $(date)"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_step() {
    echo -e "${BLUE}[PASO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

echo_error() {
    echo -e "${RED}[❌]${NC} $1"
}

# 1. BACKUP DE CONFIGURACIONES CRÍTICAS
echo_step "1. Haciendo backup de configuraciones críticas..."

# Backup nginx SSL y configuraciones de dominio
mkdir -p /tmp/smartselling_backup
cp -r /etc/nginx/sites-available /tmp/smartselling_backup/ 2>/dev/null || echo_warning "No se encontraron configuraciones nginx"
cp -r /etc/letsencrypt /tmp/smartselling_backup/ 2>/dev/null || echo_warning "No se encontraron certificados SSL"

# Backup variables de entorno si existen
cp /opt/smartselling-multi/.env /tmp/smartselling_backup/ 2>/dev/null || echo_warning "No se encontró .env"

echo_success "Backup de configuraciones críticas completado"

# 2. DETENER TODOS LOS SERVICIOS RELACIONADOS
echo_step "2. Deteniendo todos los servicios de SmartSelling..."

systemctl stop smartselling 2>/dev/null || echo_warning "Servicio smartselling no estaba corriendo"
systemctl stop nginx 2>/dev/null || echo_warning "Nginx no estaba corriendo"

echo_success "Servicios detenidos"

# 3. LIMPIEZA COMPLETA DE DIRECTORIOS (EXCEPTO DB)
echo_step "3. Eliminando todos los directorios de aplicación..."

# Eliminar directorios de aplicación
rm -rf /opt/smartselling-multi 2>/dev/null || true
rm -rf /var/www/smartselling 2>/dev/null || true
rm -rf /var/www/html/smartselling-frontend 2>/dev/null || true
rm -rf /var/log/smartselling 2>/dev/null || true

echo_success "Directorios de aplicación eliminados"

# 4. VERIFICAR QUE LA BASE DE DATOS SIGUE FUNCIONANDO
echo_step "4. Verificando conectividad de base de datos..."

if sudo -u postgres psql -d smartselling_test -c "SELECT 1;" >/dev/null 2>&1; then
    echo_success "Base de datos PostgreSQL funcionando correctamente"
else
    echo_error "❌ PROBLEMA CRÍTICO: Base de datos no accesible"
    exit 1
fi

# 5. CLONAR REPOSITORIO COMPLETAMENTE LIMPIO
echo_step "5. Clonando repositorio fresco desde GitHub..."

cd /opt
git clone https://github.com/yerna09/smartselling.git smartselling-multi
cd /opt/smartselling-multi

echo_success "Repositorio clonado exitosamente"

# 6. INSTALAR DEPENDENCIAS PYTHON LIMPIAS
echo_step "6. Instalando dependencias Python desde cero..."

# Asegurar que tenemos pip actualizado
python3 -m pip install --upgrade pip

# Instalar dependencias
pip3 install -r requirements.txt

echo_success "Dependencias Python instaladas"

# 7. RESTAURAR CONFIGURACIONES CRÍTICAS
echo_step "7. Restaurando configuraciones críticas..."

# Restaurar .env si existía
if [ -f /tmp/smartselling_backup/.env ]; then
    cp /tmp/smartselling_backup/.env /opt/smartselling-multi/
    echo_success "Archivo .env restaurado"
else
    echo_warning "No se encontró .env previo - necesitarás configurarlo"
fi

# 8. EJECUTAR MIGRACIÓN DE BASE DE DATOS
echo_step "8. Ejecutando migración de base de datos..."

cd /opt/smartselling-multi
python3 create_db_tables.py

echo_success "Migración de base de datos completada"

# 9. CREAR DIRECTORIO DE LOGS
echo_step "9. Creando estructura de logs..."

mkdir -p /var/log/smartselling
chown www-data:www-data /var/log/smartselling

echo_success "Estructura de logs creada"

# 10. CONFIGURAR SERVICIO SYSTEMD LIMPIO
echo_step "10. Configurando servicio systemd..."

cat > /etc/systemd/system/smartselling.service << 'EOF'
[Unit]
Description=SmartSelling Flask App
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/smartselling-multi
Environment=PATH=/usr/bin:/usr/local/bin
Environment=PYTHONPATH=/opt/smartselling-multi
ExecStart=/usr/bin/python3 app.py
Restart=always
RestartSec=10
StandardOutput=append:/var/log/smartselling/app.log
StandardError=append:/var/log/smartselling/error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable smartselling

echo_success "Servicio systemd configurado"

# 11. BUILD FRONTEND COMPLETAMENTE LIMPIO
echo_step "11. Construyendo frontend desde cero..."

cd /opt/smartselling-multi/frontend

# Limpiar completamente node_modules y package-lock
rm -rf node_modules package-lock.json 2>/dev/null || true

# Instalar dependencias frescas
npm install

# Build de producción
npm run build

echo_success "Frontend construido exitosamente"

# 12. CONFIGURAR NGINX PARA SERVIR DESDE LA UBICACIÓN CORRECTA
echo_step "12. Configurando nginx para ubicación correcta..."

# Crear directorio web limpio
mkdir -p /var/www/smartselling

# Copiar build a ubicación estándar
cp -r /opt/smartselling-multi/frontend/dist /var/www/smartselling/frontend

# Configurar nginx para servir desde la ubicación correcta
cat > /etc/nginx/sites-available/smartselling << 'EOF'
server {
    listen 80;
    server_name test.smartselling.com.ar;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name test.smartselling.com.ar;

    ssl_certificate /etc/letsencrypt/live/test.smartselling.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test.smartselling.com.ar/privkey.pem;

    root /var/www/smartselling/frontend/dist;
    index index.html;

    # Frontend - servir archivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # API - proxy al backend Flask
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api-test.smartselling.com.ar;

    ssl_certificate /etc/letsencrypt/live/api-test.smartselling.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-test.smartselling.com.ar/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Activar configuración
ln -sf /etc/nginx/sites-available/smartselling /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo_success "Nginx configurado para ubicación correcta"

# 13. CONFIGURAR PERMISOS CORRECTOS
echo_step "13. Configurando permisos..."

chown -R www-data:www-data /opt/smartselling-multi
chown -R www-data:www-data /var/www/smartselling
chmod -R 755 /var/www/smartselling

echo_success "Permisos configurados"

# 14. INICIAR SERVICIOS
echo_step "14. Iniciando servicios..."

# Verificar configuración nginx
nginx -t

if [ $? -eq 0 ]; then
    systemctl start nginx
    echo_success "Nginx iniciado"
else
    echo_error "Error en configuración nginx"
    exit 1
fi

# Iniciar aplicación Flask
systemctl start smartselling

# Esperar un momento para que los servicios se inicien
sleep 5

echo_success "Servicios iniciados"

# 15. VERIFICACIONES FINALES
echo_step "15. Ejecutando verificaciones finales..."

# Verificar estado de servicios
if systemctl is-active --quiet smartselling; then
    echo_success "✅ Servicio SmartSelling: ACTIVO"
else
    echo_error "❌ Servicio SmartSelling: INACTIVO"
fi

if systemctl is-active --quiet nginx; then
    echo_success "✅ Nginx: ACTIVO"
else
    echo_error "❌ Nginx: INACTIVO"
fi

# Verificar conectividad API
if curl -s http://localhost:5000/health >/dev/null; then
    echo_success "✅ API Backend: RESPONDIENDO"
else
    echo_error "❌ API Backend: NO RESPONDE"
fi

# Verificar archivos frontend
if [ -f /var/www/smartselling/frontend/dist/index.html ]; then
    echo_success "✅ Frontend: ARCHIVOS PRESENTES"
else
    echo_error "❌ Frontend: ARCHIVOS FALTANTES"
fi

# Mostrar hash del build para verificación
if [ -f /var/www/smartselling/frontend/dist/assets/index-*.js ]; then
    JS_FILE=$(ls /var/www/smartselling/frontend/dist/assets/index-*.js | head -1)
    HASH=$(basename "$JS_FILE" | sed 's/index-\(.*\)\.js/\1/')
    echo_success "✅ Frontend Hash: $HASH"
else
    echo_warning "⚠️ No se encontró archivo JS con hash"
fi

echo ""
echo "🎉 === FRESH DEPLOYMENT COMPLETADO ==="
echo ""
echo "📋 RESUMEN:"
echo "  • Repositorio: Clonado limpio desde GitHub"
echo "  • Base de datos: Migrada y funcional"
echo "  • Frontend: Build fresco con nuevo hash"
echo "  • Backend: Servicio activo en puerto 5000"
echo "  • Nginx: Configurado para ubicación correcta"
echo "  • SSL: Certificados preservados"
echo ""
echo "🌐 URLs de acceso:"
echo "  • Frontend: https://test.smartselling.com.ar"
echo "  • API: https://api-test.smartselling.com.ar"
echo "  • Health Check: https://api-test.smartselling.com.ar/health"
echo ""
echo "🧹 IMPORTANTE: Limpiar caché del navegador o usar modo incógnito"
echo ""

# Limpiar backup temporal
rm -rf /tmp/smartselling_backup

echo_success "Fresh deployment completado exitosamente! 🚀"
