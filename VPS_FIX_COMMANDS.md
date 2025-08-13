# COMANDOS PARA ARREGLAR LA VPS - SmartSelling
# Ejecutar estos comandos en orden en la VPS

# 1. HACER BACKUP del app.py actual
cd /var/www/smartselling
cp app.py app.py.backup.before.fix

# 2. EDITAR la configuración CORS (línea ~18)
# Reemplazar esta línea:
# CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')], supports_credentials=True)
# 
# Por esta configuración:
sed -i '18c\
# Configuración CORS para permitir frontend (desarrollo y producción)\
FRONTEND_URL = os.getenv('\''FRONTEND_URL'\'', '\''http://localhost:3000'\'')\
ALLOWED_ORIGINS = [\
    '\''http://localhost:3000'\'',\
    '\''http://localhost:5173'\'',\
    '\''https://test.smartselling.com.ar'\'',\
    FRONTEND_URL\
]\
\
CORS(app, \
     origins=ALLOWED_ORIGINS,\
     supports_credentials=True,\
     allow_headers=['\''Content-Type'\'', '\''Authorization'\'', '\''x-access-token'\''],\
     methods=['\''GET'\'', '\''POST'\'', '\''PUT'\'', '\''DELETE'\'', '\''OPTIONS'\''])' /var/www/smartselling/app.py

# 3. EDITAR configuración de cookies para ser adaptativa
# Buscar líneas con set_cookie y reemplazarlas

# Para REGISTER (línea ~430)
sed -i '/resp.set_cookie.*token.*domain.*smartselling/c\
        # Configurar cookie según el entorno\
        is_production = '\''smartselling.com.ar'\'' in os.getenv('\''FRONTEND_URL'\'', '\'''\'')\
        \
        resp.set_cookie('\''token'\'', token, \
                       httponly=True, \
                       max_age=30*24*60*60,\
                       domain='\''.smartselling.com.ar'\'' if is_production else None,\
                       secure=is_production,\
                       samesite='\''None'\'' if is_production else '\''Lax'\'')' /var/www/smartselling/app.py

# Para LOGIN (línea ~470)
sed -i '/# Configurar cookie para funcionar entre subdominios/,/samesite='\''None'\'')/c\
        # Configurar cookie según el entorno\
        is_production = '\''smartselling.com.ar'\'' in os.getenv('\''FRONTEND_URL'\'', '\'''\'')\
        \
        resp.set_cookie('\''token'\'', token, \
                       httponly=True, \
                       max_age=30*24*60*60,\
                       domain='\''.smartselling.com.ar'\'' if is_production else None,\
                       secure=is_production,\
                       samesite='\''None'\'' if is_production else '\''Lax'\'')'  /var/www/smartselling/app.py

# Para LOGOUT (línea ~770)
sed -i '/# Limpiar cookie con la misma configuración de dominio/,/samesite='\''None'\'')/c\
        # Limpiar cookie según el entorno\
        is_production = '\''smartselling.com.ar'\'' in os.getenv('\''FRONTEND_URL'\'', '\'''\'')\
        \
        resp.set_cookie('\''token'\'', '\'\'\'\'', \
                       expires=0,\
                       domain='\''.smartselling.com.ar'\'' if is_production else None,\
                       secure=is_production,\
                       samesite='\''None'\'' if is_production else '\''Lax'\'')'  /var/www/smartselling/app.py

# 4. REINICIAR el servicio
systemctl restart smartselling

# 5. VERIFICAR que funciona
systemctl status smartselling
journalctl -u smartselling -n 10

# 6. PROBAR endpoints
curl -I https://api-test.smartselling.com.ar/
curl -X GET https://api-test.smartselling.com.ar/ml-accounts

echo "✅ Configuración actualizada. El login y cookies ahora deberían funcionar correctamente."
