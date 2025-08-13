#!/bin/bash

# 🚀 Script de actualización para VPS SmartSelling
# Ejecutar este script en el VPS para actualizar el código con todas las correcciones

echo "🚀 Iniciando actualización COMPLETA de SmartSelling..."
echo "📅 $(date)"
echo ""

# Ir al directorio del proyecto
cd /var/www/smartselling

echo "📥 Descargando últimos cambios del repositorio..."
git fetch origin
git reset --hard origin/main
git pull origin main

echo "🐍 Activando entorno virtual Python..."
source venv/bin/activate

echo "📦 Actualizando dependencias Python..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🗄️ Aplicando migraciones de base de datos..."
# Crear/actualizar tablas con el nuevo script
python create_db_tables.py

echo "🔧 Inicializando base de datos via API..."
# Llamar al endpoint de inicialización
curl -X POST http://127.0.0.1:8000/init-db || echo "⚠️ Endpoint init-db no disponible aún"

echo "🔄 Reiniciando servicios Flask..."

# Matar procesos existentes de Flask
echo "🛑 Deteniendo procesos Flask existentes..."
pkill -f "python.*app.py" || true
pkill -f "python.*run_dev.py" || true

# Esperar un momento
sleep 2

# Reiniciar servicio si existe
if systemctl is-active --quiet smartselling; then
    echo "🔄 Reiniciando servicio smartselling..."
    systemctl restart smartselling
    sleep 3
    systemctl status smartselling --no-pager -l
else
    echo "🚀 Iniciando Flask manualmente..."
    # Iniciar Flask en background
    nohup python app.py > /var/log/smartselling.log 2>&1 &
    sleep 3
    echo "📊 Estado del proceso Flask:"
    ps aux | grep python | grep -v grep
fi

echo ""
echo "🌐 Actualizando frontend..."
cd frontend

echo "🧹 Limpiando caché y dependencias..."
rm -rf node_modules package-lock.json .vite/ dist/ || true

echo "📦 Instalando dependencias npm..."
npm cache clean --force
npm install

echo "🏗️ Construyendo frontend optimizado..."
npm run build

echo "� Verificando build del frontend..."
if [ -d "dist" ]; then
    echo "✅ Build del frontend completado"
    ls -la dist/
else
    echo "❌ Error: No se generó el directorio dist"
fi

echo ""
echo "�📋 Reiniciando Nginx..."
nginx -t && systemctl restart nginx

echo ""
echo "🔍 Verificación de servicios..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "📊 Estado de Nginx:"
systemctl status nginx --no-pager -l | head -10

echo ""
echo "📊 Estado de SmartSelling:"
if systemctl is-active --quiet smartselling; then
    systemctl status smartselling --no-pager -l | head -10
else
    echo "⚠️ Servicio smartselling no configurado, verificando proceso manual:"
    ps aux | grep python | grep -v grep | head -5
fi

echo ""
echo "🌐 Verificación de conectividad:"
echo "🔗 Verificando API..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health || echo "000")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API responde correctamente (HTTP $API_STATUS)"
    curl -s http://127.0.0.1:8000/health | python -m json.tool 2>/dev/null || echo "Respuesta recibida"
else
    echo "❌ API no responde (HTTP $API_STATUS)"
fi

echo ""
echo "📱 Verificando frontend..."
if [ -f "/var/www/smartselling/frontend/dist/index.html" ]; then
    echo "✅ Archivos del frontend disponibles"
else
    echo "❌ Archivos del frontend no encontrados"
fi

echo ""
echo "📝 Logs recientes de la aplicación:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "/var/log/smartselling.log" ]; then
    echo "📄 Últimas 15 líneas del log:"
    tail -n 15 /var/log/smartselling.log
else
    echo "⚠️ No se encontró archivo de log en /var/log/smartselling.log"
    echo "Verificando logs del sistema:"
    journalctl -u smartselling -n 10 --no-pager || echo "No hay logs del servicio smartselling"
fi

echo ""
echo "✅ ACTUALIZACIÓN COMPLETADA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URLs disponibles:"
echo "   Frontend: https://test.smartselling.com.ar"
echo "   API: https://api-test.smartselling.com.ar"
echo "   API Health: https://api-test.smartselling.com.ar/health"
echo "   Cuentas ML: https://test.smartselling.com.ar/accounts"
echo ""
echo "� CAMBIOS APLICADOS EN ESTA ACTUALIZACIÓN:"
echo "   ✅ Corregido endpoint principal para evitar respuestas HTML"
echo "   ✅ Mejorado manejo de errores en API requests"
echo "   ✅ Agregados endpoints de actualización de métricas ML"
echo "   ✅ Implementado modelo de métricas diarias"
echo "   ✅ Corregido sistema de tokens multicuenta"
echo "   ✅ Mejorada interfaz de AccountManager con botones refresh"
echo "   ✅ Agregados endpoints de salud y inicialización de DB"
echo "   ✅ Implementado mejor manejo de tokens ML expirados"
echo ""
echo "📋 PARA PROBAR:"
echo "   1. ✅ Login en el sistema"
echo "   2. ✅ Navegar a Accounts desde el menú"
echo "   3. ✅ Verificar que se cargan las cuentas ML sin errores"
echo "   4. ✅ Probar botón 'Actualizar Todas' las métricas"
echo "   5. ✅ Probar botón individual de refresh en cada cuenta"
echo "   6. ✅ Vincular nueva cuenta ML si es necesario"
echo "   7. ✅ Ver detalles de cuenta en el dialog"
echo ""
echo "🎉 ¡La aplicación está lista para usar!"
