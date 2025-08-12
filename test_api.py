import requests
import json
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración - Usar URLs de producción por defecto
API_BASE = os.getenv('API_URL', 'https://api-test.smartselling.com.ar')
# Solo usar localhost si estamos explícitamente en desarrollo
if os.getenv('FLASK_ENV') == 'development':
    API_BASE = 'http://localhost:8000'

def test_home():
    """Test endpoint principal"""
    response = requests.get(f"{API_BASE}/")
    print("🏠 Testing home endpoint...")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)

def test_register():
    """Test registro de usuario"""
    data = {
        "username": "testuser123",
        "password": "testpass123"
    }
    
    response = requests.post(f"{API_BASE}/register", json=data)
    print("📝 Testing user registration...")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Guardar cookies para siguientes requests
    if response.status_code == 201:
        cookies = response.cookies
        return cookies
    
    print("-" * 50)
    return None

def test_login():
    """Test login de usuario"""
    data = {
        "username": "testuser123",
        "password": "testpass123"
    }
    
    response = requests.post(f"{API_BASE}/login", json=data)
    print("🔐 Testing user login...")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Guardar cookies para siguientes requests
    if response.status_code == 200:
        cookies = response.cookies
        return cookies
    
    print("-" * 50)
    return None

def test_profile(cookies):
    """Test obtener perfil (ruta protegida)"""
    if not cookies:
        print("❌ No cookies available for profile test")
        return
    
    response = requests.get(f"{API_BASE}/profile", cookies=cookies)
    print("👤 Testing profile endpoint...")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)

def test_ml_auth(cookies):
    """Test obtener URL de autorización ML"""
    if not cookies:
        print("❌ No cookies available for ML auth test")
        return
    
    response = requests.get(f"{API_BASE}/mercadolibre/auth", cookies=cookies)
    print("🔗 Testing ML auth URL...")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)

def test_ml_data_without_link(cookies):
    """Test obtener datos ML sin vincular cuenta"""
    if not cookies:
        print("❌ No cookies available for ML data test")
        return
    
    response = requests.get(f"{API_BASE}/mercadolibre/data", cookies=cookies)
    print("📊 Testing ML data endpoint (should fail - not linked)...")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)

if __name__ == "__main__":
    print("🚀 Starting API tests...\n")
    print("Make sure the Flask app is running on http://localhost:5000")
    print("=" * 60)
    
    try:
        # Test endpoints básicos
        test_home()
        
        # Test registro
        cookies = test_register()
        
        # Si el registro falló, intentar login
        if not cookies:
            cookies = test_login()
        
        # Test rutas protegidas
        if cookies:
            test_profile(cookies)
            test_ml_auth(cookies)
            test_ml_data_without_link(cookies)
        
        print("✅ Tests completed!")
        print("\n💡 Next steps:")
        print("1. Get real ML credentials and update .env file")
        print("2. Test the full ML OAuth flow")
        print("3. Build a frontend interface")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API")
        print("Make sure to run: python app.py")
    except Exception as e:
        print(f"❌ Error during tests: {e}")
