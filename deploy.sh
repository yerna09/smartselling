#!/bin/bash

# Script de despliegue para SmartSelling en VPS
# Ejecutar como root: bash deploy.sh

set -e

echo "🚀 Iniciando despliegue de SmartSelling..."

# Variables
PROJECT_DIR="/var/www/smartselling"
REPO_URL="https://github.com/TU_USUARIO/smartselling.git"  # Cambiar por tu repo
VENV_DIR="$PROJECT_DIR/venv"
SERVICE_NAME="smartselling"

# Crear usuario para la aplicación si no existe
if ! id "smartselling" &>/dev/null; then
    echo "📝 Creando usuario smartselling..."
    useradd --system --shell /bin/bash --home $PROJECT_DIR smartselling
fi

# Crear directorio del proyecto
echo "📁 Preparando directorio del proyecto..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clonar o actualizar repositorio
if [ -d ".git" ]; then
    echo "📥 Actualizando código desde Git..."
    git pull origin main
else
    echo "📥 Clonando repositorio..."
    git clone $REPO_URL .
fi

# Configurar Python virtual environment
echo "🐍 Configurando entorno virtual Python..."
python3 -m venv $VENV_DIR
source $VENV_DIR/bin/activate

# Instalar dependencias
echo "📦 Instalando dependencias Python..."
pip install --upgrade pip
pip install -r requirements.txt

# Configurar archivo .env para producción
echo "⚙️ Configurando variables de entorno..."
cat > .env << EOF
# Configuración de producción para SmartSelling
SECRET_KEY=VBNM,VBdsgS,.-NMM,.456YIODdsfghC.-kñlDFGYGdfghqaB32cvNMFH.+0{'{aardsfgcvgh{.ñ-va+-{´PK.-{-'9*/a YHGUNBMFsad-f,12.3{}´4-ñ1}2´´3-4.-,t-sad,gf-}{xc-.qeAA
AES_KEY=.KÑ{SP.D-F´320O4{sd{-.f´q2p}A´-LSÑDFG´234}xd
FLASK_ENV=production
FLASK_DEBUG=False

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartselling_test
DB_USER=smartselling
DB_PASS=df5g42645381a2

# URLs de producción
FRONTEND_URL=https://test.smartselling.com.ar
API_URL=https://api-test.smartselling.com.ar

# Mercado Libre OAuth2
ML_CLIENT_ID=2582847439583264
ML_CLIENT_SECRET=0lVKgECCnZh0QGjhM8xpGHKCxsVbdoLi
ML_REDIRECT_URI=https://api-test.smartselling.com.ar/loading

# Configuración del servidor
SERVER_HOST=127.0.0.1
SERVER_PORT=8000

# SSL Certificates
SSL_CERT_PATH=/etc/letsencrypt/live/api-test.smartselling.com.ar/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/api-test.smartselling.com.ar/privkey.pem
EOF

# Configurar permisos
echo "🔐 Configurando permisos..."
chown -R smartselling:smartselling $PROJECT_DIR
chmod 600 $PROJECT_DIR/.env

# Configurar base de datos
echo "🗄️ Configurando base de datos..."
sudo -u postgres psql << EOF
-- Crear base de datos si no existe
SELECT 'CREATE DATABASE smartselling_test' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'smartselling_test')\gexec

-- Crear usuario si no existe
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'smartselling') THEN
        CREATE USER smartselling WITH PASSWORD 'df5g42645381a2';
    END IF;
END
\$\$;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE smartselling_test TO smartselling;
ALTER USER smartselling CREATEDB;
EOF

# Inicializar tablas de la base de datos
echo "📊 Inicializando tablas de la base de datos..."
sudo -u smartselling bash -c "cd $PROJECT_DIR && source $VENV_DIR/bin/activate && python -c 'from app import app, db; app.app_context().push(); db.create_all(); print(\"Tablas creadas exitosamente\")'"

# Configurar servicio systemd
echo "⚙️ Configurando servicio systemd..."
cp config/smartselling.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable $SERVICE_NAME

# Configurar Nginx
echo "🌐 Configurando Nginx..."
cp config/nginx.conf /etc/nginx/sites-available/smartselling

# Remover configuración anterior si existe
if [ -L "/etc/nginx/sites-enabled/smartselling" ]; then
    rm /etc/nginx/sites-enabled/smartselling
fi

# Activar nueva configuración
ln -s /etc/nginx/sites-available/smartselling /etc/nginx/sites-enabled/
nginx -t

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
systemctl restart $SERVICE_NAME
systemctl restart nginx

# Mostrar estado
echo "📊 Estado de los servicios:"
systemctl status $SERVICE_NAME --no-pager -l
systemctl status nginx --no-pager -l

echo ""
echo "✅ ¡Despliegue completado exitosamente!"
echo ""
echo "🔗 URLs disponibles:"
echo "   Frontend: https://test.smartselling.com.ar"
echo "   API:      https://api-test.smartselling.com.ar"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Configurar credenciales reales de Mercado Libre en /var/www/smartselling/.env"
echo "   2. Verificar que los certificados SSL estén renovándose automáticamente"
echo "   3. Configurar backup de la base de datos PostgreSQL"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: journalctl -u $SERVICE_NAME -f"
echo "   Reiniciar: systemctl restart $SERVICE_NAME"
echo "   Estado: systemctl status $SERVICE_NAME"
echo ""
