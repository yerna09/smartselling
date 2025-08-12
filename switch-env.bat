@echo off
REM Script para cambiar entre configuraciones de entorno en Windows
REM Uso: switch-env.bat [development|production]

set ENV=%1
if "%ENV%"=="" set ENV=development

if "%ENV%"=="development" (
    echo 🔧 Cambiando a configuración de DESARROLLO...
    copy .env.development .env >nul
    echo ✅ Configurado para desarrollo local
    echo    API: http://localhost:8000
    echo    Frontend: http://localhost:3000
    echo    ML Redirect: http://localhost:8000/loading
) else if "%ENV%"=="production" (
    echo 🚀 Cambiando a configuración de PRODUCCIÓN...
    copy .env.production .env >nul
    echo ✅ Configurado para producción VPS
    echo    API: https://api-test.smartselling.com.ar
    echo    Frontend: https://test.smartselling.com.ar
    echo    ML Redirect: https://api-test.smartselling.com.ar/loading
) else (
    echo ❌ Entorno no válido. Usa: development o production
    echo Ejemplo: switch-env.bat development
    exit /b 1
)

echo.
echo 📝 Variables configuradas:
findstr /R "^FLASK_ENV= ^API_URL= ^ML_REDIRECT_URI=" .env
echo.
echo 🔄 Reinicia el servidor para aplicar los cambios
