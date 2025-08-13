#!/usr/bin/env python3
"""
Script de desarrollo para SmartSelling
Configura y ejecuta la aplicación Flask en modo desarrollo
"""

import os
import sys
from dotenv import load_dotenv

def main():
    # Cargar variables de entorno para desarrollo
    load_dotenv('.env.development')
    
    print("🚀 Iniciando SmartSelling en modo DESARROLLO")
    print("=" * 50)
    
    # Configurar variables de entorno
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = 'True'
    
    # Mostrar configuración
    print(f"🔧 Entorno: {os.getenv('FLASK_ENV')}")
    print(f"🌐 Frontend URL: {os.getenv('FRONTEND_URL')}")
    print(f"🔗 API URL: {os.getenv('API_URL')}")
    print(f"🗄️  Base de datos: {os.getenv('DB_NAME')} en {os.getenv('DB_HOST')}")
    print(f"📡 Puerto: {os.getenv('SERVER_PORT', 5000)}")
    print("=" * 50)
    
    # Importar y ejecutar la aplicación
    try:
        from app import app
        app.run(
            debug=True,
            host='127.0.0.1',
            port=int(os.getenv('SERVER_PORT', 5000))
        )
    except ImportError as e:
        print(f"❌ Error importando app.py: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error ejecutando la aplicación: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
