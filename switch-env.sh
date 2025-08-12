#!/bin/bash

# Script para cambiar entre configuraciones de entorno
# Uso: ./switch-env.sh [development|production]

ENV=${1:-development}

if [ "$ENV" = "development" ]; then
    echo "🔧 Cambiando a configuración de DESARROLLO..."
    cp .env.development .env
    echo "✅ Configurado para desarrollo local"
    echo "   API: http://localhost:8000"
    echo "   Frontend: http://localhost:3000"
    echo "   ML Redirect: http://localhost:8000/loading"
    
elif [ "$ENV" = "production" ]; then
    echo "🚀 Cambiando a configuración de PRODUCCIÓN..."
    cp .env.production .env
    echo "✅ Configurado para producción VPS"
    echo "   API: https://api-test.smartselling.com.ar"
    echo "   Frontend: https://test.smartselling.com.ar"
    echo "   ML Redirect: https://api-test.smartselling.com.ar/loading"
    
else
    echo "❌ Entorno no válido. Usa: development o production"
    echo "Ejemplo: ./switch-env.sh development"
    exit 1
fi

echo ""
echo "📝 Variables configuradas:"
grep -E "^(FLASK_ENV|API_URL|ML_REDIRECT_URI)" .env
echo ""
echo "🔄 Reinicia el servidor para aplicar los cambios"
