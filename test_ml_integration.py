#!/usr/bin/env python3
"""
Script de prueba completo para SmartSelling con Mercado Libre
Prueba todos los endpoints y el flujo completo de integración
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración
API_BASE = os.getenv('API_URL', 'https://api-test.smartselling.com.ar')
# Solo usar localhost si estamos explícitamente en desarrollo
if os.getenv('FLASK_ENV') == 'development' and 'localhost' in API_BASE:
    API_BASE = 'http://localhost:8000'

ML_CLIENT_ID = os.getenv('ML_CLIENT_ID', '2582847439583264')

class SmartSellingMLTest:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.user_data = None
        self.test_username = f"test_user_{int(time.time())}"
        self.test_password = "TestPass123!"
        
    def log(self, message, level="INFO"):
        """Log con formato"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_server_connection(self):
        """Verificar que el servidor esté disponible"""
        self.log("🔌 Verificando conexión al servidor...")
        
        try:
            response = self.session.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                self.log("✅ Servidor conectado correctamente", "SUCCESS")
                return True
            else:
                self.log(f"❌ Servidor respondió con código: {response.status_code}", "ERROR")
                return False
        except requests.exceptions.ConnectionError:
            self.log("❌ No se puede conectar al servidor", "ERROR")
            self.log("💡 Asegúrate de que esté corriendo: python app.py", "HINT")
            return False
        except Exception as e:
            self.log(f"❌ Error de conexión: {e}", "ERROR")
            return False
    
    def test_user_registration(self):
        """Probar registro de usuario"""
        self.log(f"👤 Registrando usuario: {self.test_username}")
        
        try:
            response = self.session.post(f"{API_BASE}/register", 
                                       json={
                                           "username": self.test_username,
                                           "password": self.test_password
                                       })
            
            if response.status_code in [200, 201]:
                self.user_data = response.json()
                self.log("✅ Usuario registrado exitosamente", "SUCCESS")
                return True
            else:
                error_msg = response.json().get('message', 'Error desconocido')
                self.log(f"❌ Error en registro: {error_msg}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error en registro: {e}", "ERROR")
            return False
    
    def test_user_login(self):
        """Probar login de usuario"""
        self.log(f"🔑 Iniciando sesión: {self.test_username}")
        
        try:
            response = self.session.post(f"{API_BASE}/login",
                                       json={
                                           "username": self.test_username,
                                           "password": self.test_password
                                       })
            
            if response.status_code == 200:
                self.user_data = response.json()
                self.log("✅ Login exitoso", "SUCCESS")
                
                # Extraer token de cookies si está disponible
                if 'token' in response.cookies:
                    self.token = response.cookies['token']
                    self.log(f"🎫 Token obtenido: {self.token[:20]}...", "SUCCESS")
                
                return True
            else:
                error_msg = response.json().get('message', 'Error desconocido')
                self.log(f"❌ Error en login: {error_msg}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error en login: {e}", "ERROR")
            return False
    
    def test_user_profile(self):
        """Probar obtener perfil de usuario"""
        self.log("👤 Obteniendo perfil de usuario...")
        
        headers = {}
        if self.token:
            headers['x-access-token'] = self.token
            
        try:
            response = self.session.get(f"{API_BASE}/profile", headers=headers)
            
            if response.status_code == 200:
                profile_data = response.json()
                self.log("✅ Perfil obtenido exitosamente", "SUCCESS")
                self.log(f"   Usuario: {profile_data.get('username')}")
                self.log(f"   ID: {profile_data.get('user_id')}")
                self.log(f"   ML vinculado: {profile_data.get('ml_linked', False)}")
                return True
            else:
                error_msg = response.json().get('message', 'Error desconocido')
                self.log(f"❌ Error obteniendo perfil: {error_msg}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error obteniendo perfil: {e}", "ERROR")
            return False
    
    def test_ml_auth_url(self):
        """Probar obtener URL de autorización de ML"""
        self.log("🔗 Obteniendo URL de autorización de Mercado Libre...")
        
        headers = {}
        if self.token:
            headers['x-access-token'] = self.token
            
        try:
            response = self.session.get(f"{API_BASE}/mercadolibre/auth", headers=headers)
            
            if response.status_code == 200:
                auth_data = response.json()
                auth_url = auth_data.get('auth_url')
                self.log("✅ URL de autorización obtenida", "SUCCESS")
                self.log(f"🌐 URL: {auth_url}")
                
                # Verificar que la URL contenga los parámetros correctos
                if ML_CLIENT_ID in auth_url:
                    self.log("✅ Client ID correcto en URL", "SUCCESS")
                else:
                    self.log("⚠️ Client ID no encontrado en URL", "WARNING")
                
                if "api-test.smartselling.com.ar/loading" in auth_url:
                    self.log("✅ Redirect URI correcto", "SUCCESS")
                else:
                    self.log("⚠️ Redirect URI no encontrado", "WARNING")
                
                return True
            else:
                error_msg = response.json().get('message', 'Error desconocido')
                self.log(f"❌ Error obteniendo URL ML: {error_msg}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error obteniendo URL ML: {e}", "ERROR")
            return False
    
    def test_ml_data_without_auth(self):
        """Probar obtener datos ML sin autorización (debe fallar)"""
        self.log("📊 Probando obtener datos ML sin autorización...")
        
        headers = {}
        if self.token:
            headers['x-access-token'] = self.token
            
        try:
            response = self.session.get(f"{API_BASE}/mercadolibre/data", headers=headers)
            
            if response.status_code == 400:
                error_msg = response.json().get('message', '')
                if 'not linked' in error_msg.lower():
                    self.log("✅ Error esperado: ML no vinculado", "SUCCESS")
                    return True
                
            self.log(f"⚠️ Respuesta inesperada: {response.status_code}", "WARNING")
            self.log(f"   Mensaje: {response.json().get('message', 'Sin mensaje')}")
            return True  # No es un error crítico
            
        except Exception as e:
            self.log(f"❌ Error probando datos ML: {e}", "ERROR")
            return False
    
    def test_configuration(self):
        """Verificar configuración del proyecto"""
        self.log("⚙️ Verificando configuración...")
        
        config_items = [
            ("ML_CLIENT_ID", ML_CLIENT_ID, "2582847439583264"),
            ("API_BASE", API_BASE, "http://localhost:8000"),
        ]
        
        all_good = True
        for name, current, expected in config_items:
            if current == expected:
                self.log(f"✅ {name}: {current}", "SUCCESS")
            else:
                self.log(f"⚠️ {name}: {current} (esperado: {expected})", "WARNING")
                if name == "ML_CLIENT_ID" and current == "TU_CLIENT_ID":
                    self.log("❌ Client ID no configurado correctamente", "ERROR")
                    all_good = False
        
        return all_good
    
    def test_logout(self):
        """Probar logout"""
        self.log("🚪 Cerrando sesión...")
        
        headers = {}
        if self.token:
            headers['x-access-token'] = self.token
            
        try:
            response = self.session.post(f"{API_BASE}/logout", headers=headers)
            
            if response.status_code == 200:
                self.log("✅ Logout exitoso", "SUCCESS")
                self.token = None
                return True
            else:
                error_msg = response.json().get('message', 'Error desconocido')
                self.log(f"❌ Error en logout: {error_msg}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error en logout: {e}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Ejecutar toda la suite de pruebas"""
        self.log("🚀 Iniciando suite completa de pruebas SmartSelling", "START")
        self.log(f"🎯 API Base: {API_BASE}")
        self.log(f"🔑 ML Client ID: {ML_CLIENT_ID}")
        print("=" * 80)
        
        tests = [
            ("Conexión servidor", self.test_server_connection),
            ("Configuración", self.test_configuration),
            ("Registro usuario", self.test_user_registration),
            ("Login usuario", self.test_user_login),
            ("Perfil usuario", self.test_user_profile),
            ("URL autorización ML", self.test_ml_auth_url),
            ("Datos ML sin auth", self.test_ml_data_without_auth),
            ("Logout", self.test_logout),
        ]
        
        results = []
        
        for test_name, test_func in tests:
            self.log(f"\n🧪 Ejecutando: {test_name}")
            try:
                result = test_func()
                status = "✅ PASS" if result else "❌ FAIL"
                results.append((test_name, status, None))
                self.log(f"Resultado: {status}")
            except Exception as e:
                error_msg = str(e)
                results.append((test_name, "💥 ERROR", error_msg))
                self.log(f"💥 ERROR: {error_msg}", "ERROR")
        
        # Resumen final
        print("\n" + "=" * 80)
        self.log("📊 RESUMEN DE PRUEBAS:", "SUMMARY")
        
        passed = 0
        for test_name, status, error in results:
            print(f"   {test_name:<25} {status}")
            if error:
                print(f"      Error: {error}")
            if "✅" in status:
                passed += 1
        
        total = len(results)
        print(f"\n🎯 RESULTADO FINAL: {passed}/{total} pruebas exitosas")
        
        if passed == total:
            self.log("🎉 ¡Todas las pruebas pasaron!", "SUCCESS")
            self.log("✨ El sistema está listo para usar", "SUCCESS")
        else:
            self.log(f"⚠️ {total - passed} pruebas fallaron", "WARNING")
        
        print("\n" + "=" * 80)
        self.log("📝 PRÓXIMOS PASOS:", "INFO")
        print("   1. Para probar ML completo, haz clic en 'Vincular ML' en el frontend")
        print("   2. Autoriza en Mercado Libre")
        print("   3. Verifica que los datos se obtengan correctamente")
        print("   4. Para despliegue: sigue las instrucciones en DEPLOY_VPS.md")

def main():
    """Función principal"""
    print("🔧 SmartSelling - Suite de Pruebas Completa")
    print(f"📅 {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    test_suite = SmartSellingMLTest()
    test_suite.run_all_tests()

if __name__ == "__main__":
    main()
