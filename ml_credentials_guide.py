# Ejemplo de como obtener credenciales de Mercado Libre

# 1. Ve a: https://developers.mercadolibre.com.ar/
# 2. Inicia sesión con tu cuenta de Mercado Libre
# 3. Ve a "Mis aplicaciones" o "My applications"
# 4. Crea una nueva aplicación
# 5. Completa los datos:
#    - Nombre de la aplicación: "Mi App ML"
#    - Descripción: "Integración con Mercado Libre"
#    - URL de callback: http://localhost:5000/mercadolibre/callback
#    - Categoría: Selecciona la más apropiada
# 6. Una vez creada, obtendrás:
#    - CLIENT_ID (App ID)
#    - CLIENT_SECRET (Secret Key)

# Ejemplo de .env configurado:
"""
SECRET_KEY=mi_clave_super_secreta_para_jwt_cambiar_en_produccion
ML_CLIENT_ID=1234567890123456
ML_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
ML_REDIRECT_URI=http://localhost:5000/mercadolibre/callback
"""

# IMPORTANTE:
# - En desarrollo usa http://localhost:5000/mercadolibre/callback
# - En producción cambia por tu dominio real: https://tudominio.com/mercadolibre/callback
# - Asegúrate de configurar la misma URL en la aplicación de ML

print("Para obtener credenciales de Mercado Libre:")
print("1. Ve a: https://developers.mercadolibre.com.ar/")
print("2. Crea una aplicación")
print("3. Configura la URL de callback: http://localhost:5000/mercadolibre/callback")
print("4. Copia CLIENT_ID y CLIENT_SECRET al archivo .env")
