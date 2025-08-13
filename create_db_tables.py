#!/usr/bin/env python3
"""
Script para crear/migrar tablas de base de datos para SmartSelling
Incluye todas las tablas necesarias para el sistema multicuenta
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('.env.development')  # Usar desarrollo por defecto

# Configurar path para importar
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_tables():
    """Crear todas las tablas de la base de datos"""
    try:
        from app import app, db, User, MLAccount, MLAccountMetrics
        
        print("🚀 SmartSelling - Migración de Base de Datos")
        print("=" * 50)
        
        with app.app_context():
            print("📊 Configuración de base de datos:")
            print(f"   Host: {os.getenv('DB_HOST')}")
            print(f"   Puerto: {os.getenv('DB_PORT')}")
            print(f"   Base de datos: {os.getenv('DB_NAME')}")
            print(f"   Usuario: {os.getenv('DB_USER')}")
            print("")
            
            # Verificar conexión
            print("🔌 Verificando conexión a la base de datos...")
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            print("✅ Conexión exitosa")
            print("")
            
            # Crear todas las tablas
            print("📋 Creando tablas...")
            db.create_all()
            print("✅ Tablas creadas exitosamente")
            print("")
            
            # Verificar tablas creadas
            print("📝 Verificando tablas creadas:")
            tables = db.session.execute(text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            )).fetchall()
            
            for table in tables:
                table_name = table[0]
                count_result = db.session.execute(text(f'SELECT COUNT(*) FROM "{table_name}"')).fetchone()
                record_count = count_result[0] if count_result else 0
                print(f"   ✅ {table_name} ({record_count} registros)")
            
            print("")
            print("🎉 ¡Migración completada exitosamente!")
            print("=" * 50)
            
            return True
            
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        import traceback
        traceback.print_exc()
        return False

def migrate_existing_data():
    """Migrar datos existentes del modelo anterior al nuevo"""
    try:
        from app import app, db, User, MLAccount
        
        with app.app_context():
            print("🔄 Migrando datos existentes...")
            
            # Buscar usuarios con tokens ML pero sin cuentas ML
            users_with_ml = User.query.filter(
                User.ml_access_token.isnot(None),
                User.ml_user_id.isnot(None)
            ).all()
            
            migrated_count = 0
            
            for user in users_with_ml:
                # Verificar si ya existe una cuenta ML para este usuario
                existing_account = MLAccount.query.filter_by(
                    user_id=user.id,
                    ml_user_id=user.ml_user_id
                ).first()
                
                if not existing_account:
                    # Crear nueva cuenta ML
                    ml_account = MLAccount(
                        user_id=user.id,
                        ml_user_id=user.ml_user_id,
                        ml_nickname=f'Cuenta ML {user.ml_user_id}',
                        access_token=user.ml_access_token,
                        refresh_token=user.ml_refresh_token,
                        is_active=True,
                        account_alias=f'Cuenta Principal - {user.username}',
                        token_expires_at=datetime.utcnow().replace(hour=23, minute=59, second=59)
                    )
                    
                    db.session.add(ml_account)
                    migrated_count += 1
                    print(f"   ✅ Migrada cuenta ML para usuario {user.username} (ID: {user.ml_user_id})")
            
            if migrated_count > 0:
                db.session.commit()
                print(f"🎉 Migradas {migrated_count} cuentas ML existentes")
            else:
                print("ℹ️  No hay datos para migrar")
            
            return True
            
    except Exception as e:
        print(f"❌ Error migrando datos: {e}")
        db.session.rollback()
        return False

def main():
    """Función principal"""
    print("🛠️  Iniciando proceso de migración...")
    print("")
    
    # Crear tablas
    if not create_tables():
        sys.exit(1)
    
    # Migrar datos existentes
    if not migrate_existing_data():
        print("⚠️  Error migrando datos, pero las tablas se crearon correctamente")
    
    print("")
    print("✅ Proceso completado. El sistema está listo para usar.")
    print("🚀 Puedes iniciar el servidor con: python run_dev.py")

if __name__ == '__main__':
    main()
