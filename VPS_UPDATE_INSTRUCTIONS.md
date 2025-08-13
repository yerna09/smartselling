# 📝 Instrucciones de Actualización VPS - SmartSelling

## 🎯 Objetivo
Actualizar el código en el VPS con los nuevos cambios del dashboard de AccountManager.jsx

## 📋 Cambios Incluidos en esta Actualización
- ✨ **Sistema completo de navegación** con Material-UI tabs profesional
- 🏠 **MainDashboard.jsx**: Dashboard principal con estadísticas, métricas y acciones rápidas
- 📊 **AnalyticsPage.jsx**: Página completa de analytics con métricas detalladas y tablas
- ⚙️ **SettingsPage.jsx**: Configuración completa de usuario, notificaciones y API
- 🧭 **Layout.jsx**: Sistema de navegación con tabs Material-UI y menú de usuario desplegable
- � **App.jsx**: Rutas actualizadas para todas las páginas (/dashboard, /accounts, /analytics, /settings)
- 🍞 **react-hot-toast**: Agregado para notificaciones toast elegantes
- 🎨 **Material-UI**: Interfaz profesional con iconos, cards, tablas y formularios
- 📱 **Interfaz responsiva** con grid layout adaptativo

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
2. ✅ **Navegar entre páginas** usando el menú de tabs (Dashboard, Cuentas ML, Analytics, Configuración)
3. ✅ **Dashboard Principal** - Ver estadísticas generales y acciones rápidas
4. ✅ **AccountManager** - Visualizar el dashboard de cuentas ML con interface mejorada
5. ✅ **Analytics** - Ver métricas detalladas, tablas de cuentas y estadísticas
6. ✅ **Settings** - Configurar perfil, notificaciones y preferencias de API
7. ✅ **Hacer clic en "Ver Detalles"** de una cuenta ML (5 tabs: Personal, Comercial, Reputación, Estado, Integración)
8. ✅ **Vincular nueva cuenta ML** (botón "Vincular Nueva Cuenta")
9. ✅ **Menu de usuario** - Avatar con dropdown para logout
10. ✅ **Navegación responsiva** - Verificar que funciona en diferentes tamaños de pantalla

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

1. **Sistema de navegación completo** con tabs Material-UI para todas las secciones
2. **Dashboard principal** con estadísticas generales, métricas visuales y acciones rápidas
3. **AccountManager mejorado** con interface profesional y cards de cuentas ML
4. **Analytics detallado** con métricas, tabla de cuentas y estadísticas consolidadas
5. **Settings funcional** con configuración de perfil, notificaciones y API
6. **Menu de usuario** con avatar y dropdown para logout
7. **Interfaz responsiva** que se adapta a diferentes tamaños de pantalla
8. **Toast notifications** elegantes para feedback al usuario

---

**Commit:** `63c222e5` - ✨ Agregar sistema completo de navegación con Dashboard, Analytics y Settings  
**Fecha:** Agosto 12, 2025  
**Branch:** main
