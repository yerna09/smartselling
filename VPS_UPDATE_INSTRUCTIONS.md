# 📝 Instrucciones de Actualización VPS - SmartSelling

## 🎯 Objetivo
Actualizar el código en el VPS con los nuevos cambios del dashboard de AccountManager.jsx

## 📋 Cambios Incluidos en esta Actualización
- ✨ **Interfaz completamente rediseñada** del AccountManager con Material-UI profesional
- 🗂️ **Sistema de tabs** con 5 secciones: Personal, Comercial, Reputación, Estado, Integración
- 📊 **Dashboard visual** con métricas y tarjetas informativas
- 🔧 **Corrección de imports** de iconos Material-UI (@mui/icons-material)
- 📱 **Interfaz responsiva** con grid layout
- 🔍 **Dialog detallado** para visualización completa de datos ML
- 📁 **Actualización de .gitignore** para excluir node_modules

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
3. ✅ **Visualizar el nuevo dashboard** de AccountManager
4. ✅ **Hacer clic en "Ver Detalles"** de una cuenta ML
5. ✅ **Probar las 5 tabs** del dialog (Personal, Comercial, Reputación, Estado, Integración)
6. ✅ **Vincular nueva cuenta ML** (botón "Vincular Nueva Cuenta")
7. ✅ **Editar cuenta existente** (botón de edición)
8. ✅ **Actualizar métricas** (botón de refresh)

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

1. **Dashboard moderno** en la sección de cuentas ML
2. **Cards visuales** con información de cada cuenta
3. **Métricas coloridas** (ventas, órdenes, publicaciones)
4. **Dialog completo** con 5 tabs al hacer clic en "Ver Detalles"
5. **Interfaz responsiva** que se adapta a diferentes tamaños de pantalla
6. **Iconos Material-UI** funcionando correctamente

---

**Commit:** `adf4e65a` - ✨ Mejorar interfaz de AccountManager con dashboard completo  
**Fecha:** Agosto 12, 2025  
**Branch:** main
