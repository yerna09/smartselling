# 📝 Instrucciones de Actualización VPS - SmartSelling

## 🎯 Objetivo
Realizar correcciones integrales de la API y base de datos para resolver errores de integración con Mercado Libre

## 📋 Cambios Incluidos en esta Actualización CRÍTICA
- 🔧 **Corregido endpoint principal** que devolvía HTML en lugar de JSON
- �️ **Mejorado manejo de errores** en requests API para evitar "Unexpected token '<'"
- 📊 **Agregados endpoints de métricas ML** con actualización en tiempo real
- 🗄️ **Implementado modelo de métricas diarias** (MLAccountMetrics)
- � **Corregido sistema de tokens multicuenta** con mejor manejo de expiración
- 🎨 **Mejorada interfaz AccountManager** con botones de refresh individuales y globales
- 🏥 **Agregados endpoints de salud** (/health) e inicialización (/init-db)
- 🔄 **Implementado refresh automático** de tokens ML cuando expiran
- � **Mejorados mensajes de error** específicos en el frontend
- 🗃️ **Script de migración de DB** mejorado (create_db_tables.py)

## 🚀 Comandos para Ejecutar en el VPS

### Opción 1: Script Automático
```bash
# Conectar al VPS
ssh root@77.37.126.190

# Hacer ejecutable y correr el script
chmod +x /var/www/smartselling/update_vps.sh
./var/www/smartselling/update_vps.sh
```

### Opción 2: Comandos Manuales
```bash
# 1. Conectar al VPS
ssh root@77.37.126.190

# 2. Ir al directorio del proyecto
cd /var/www/smartselling

# 3. Descargar cambios
git pull origin main

# 4. Actualizar backend
source venv/bin/activate
pip install -r requirements.txt

# 5. Actualizar frontend
cd frontend
npm install
npm run build

# 6. Reiniciar servicios
systemctl restart nginx
systemctl restart smartselling || pkill -f "python.*app.py" && nohup python app.py > /var/log/smartselling.log 2>&1 &
```

## 🔍 Verificación Post-Actualización

### URLs a Verificar:
- **Frontend:** https://test.smartselling.com.ar
- **API:** https://api-test.smartselling.com.ar
- **Cuentas ML:** https://test.smartselling.com.ar/accounts

### Funciones a Probar:
1. ✅ **Login** en el sistema
2. ✅ **Navegar a Accounts** desde el menú
3. ✅ **Verificar carga correcta** de cuentas ML (sin error de JSON)
4. ✅ **Probar botón "Actualizar Todas"** las métricas
5. ✅ **Probar botón individual de refresh** en cada cuenta
6. ✅ **Vincular nueva cuenta ML** (botón "Vincular Nueva Cuenta")
7. ✅ **Ver detalles de cuenta** en el dialog
8. ✅ **Editar cuenta existente** (alias y estado activo)
9. ✅ **Verificar métricas actualizadas** (ventas, órdenes, publicaciones)
10. ✅ **Probar manejo de errores** mejorado

## 🐛 Solución de Problemas

### Si el frontend no carga:
```bash
# Verificar estado de nginx
systemctl status nginx

# Revisar logs de nginx
tail -f /var/log/nginx/error.log

# Reconstruir frontend
cd /var/www/smartselling/frontend
npm run build
```

### Si la API no responde:
```bash
# Verificar proceso Flask
ps aux | grep python

# Revisar logs de la aplicación
tail -f /var/log/smartselling.log

# Reiniciar Flask manualmente
cd /var/www/smartselling
source venv/bin/activate
python app.py
```

### Si hay errores de Material-UI:
```bash
# Limpiar caché de npm
cd /var/www/smartselling/frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 Estado Esperado Post-Actualización

- ✅ **Frontend construido** exitosamente con Vite
- ✅ **Nginx sirviendo** el frontend desde la build
- ✅ **Flask API** corriendo en puerto 8000
- ✅ **Base de datos** PostgreSQL conectada
- ✅ **SSL certificates** funcionando
- ✅ **Interfaz AccountManager** mostrando el nuevo dashboard

## 🎉 Resultado Final

Después de la actualización, el usuario debería ver:

1. ✅ **Carga correcta de cuentas** sin errores de "Unexpected token '<'"
2. ✅ **Respuestas JSON válidas** de todos los endpoints
3. ✅ **Métricas ML actualizadas** con datos reales de la API
4. ✅ **Botones de refresh funcionales** (individual y global)
5. ✅ **Tokens ML gestionados correctamente** con renovación automática
6. ✅ **Dashboard responsivo** con tarjetas visuales mejoradas
7. ✅ **Manejo robusto de errores** con mensajes específicos
8. ✅ **Base de datos consistente** con todas las tablas necesarias
9. ✅ **Sistema multicuenta funcional** para múltiples cuentas ML por usuario
10. ✅ **API de salud disponible** en /health para monitoreo

---

**🔥 CORRECCIONES CRÍTICAS APLICADAS:**
- Endpoint principal ya NO devuelve HTML cuando se esperaba JSON
- Sistema de tokens ML mejorado con manejo de expiración
- Métricas de Mercado Libre se actualizan correctamente
- Base de datos migrada al nuevo esquema multicuenta
- Frontend con manejo de errores robusto y específico

**Commit:** `TBD` - 🔧 Correcciones integrales API/DB para resolver errores ML  
**Fecha:** Agosto 12, 2025  
**Branch:** main
