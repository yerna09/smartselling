#!/bin/bash

# 🚀 Script de actualización para VPS SmartSelling
# Ejecutar este script en el VPS para actualizar el código

echo "🚀 Iniciando actualización de SmartSelling..."

# Ir al directorio del proyecto
cd /var/www/smartselling

echo "📥 Descargando últimos cambios..."
git pull origin main

echo "🐍 Activando entorno virtual Python..."
source venv/bin/activate

echo "📦 Instalando dependencias Python..."
pip install -r requirements.txt

echo "⚗️ Aplicando migraciones de base de datos..."
python migrate_multicuenta.py

echo "🔄 Reiniciando servicios..."

# Reiniciar Flask app (si está como servicio)
if systemctl is-active --quiet smartselling; then
    echo "🔄 Reiniciando servicio Flask..."
    systemctl restart smartselling
else
    echo "⚠️ Servicio smartselling no encontrado, iniciando Flask manualmente..."
    # Matar procesos existentes de Flask
    pkill -f "python.*app.py" || true
    # Iniciar Flask en background
    nohup python app.py > /var/log/smartselling.log 2>&1 &
fi

# Actualizar frontend
echo "🌐 Actualizando frontend..."
cd frontend

echo "📦 Instalando dependencias npm..."
npm install

echo "🏗️ Construyendo frontend..."
npm run build

echo "📋 Reiniciando Nginx..."
systemctl restart nginx

echo "✅ Actualización completada!"
echo "🌐 Frontend disponible en: https://test.smartselling.com.ar"
echo "🔗 API disponible en: https://api-test.smartselling.com.ar"
echo ""
echo "📊 Estado de servicios:"
systemctl status nginx --no-pager -l
echo ""
systemctl status smartselling --no-pager -l || echo "⚠️ Servicio smartselling no configurado"
echo ""
echo "📝 Logs recientes de la aplicación:"
tail -n 10 /var/log/smartselling.log || echo "⚠️ No se encontró archivo de log"
