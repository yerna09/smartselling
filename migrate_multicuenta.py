#!/usr/bin/env python3
"""
Migración de base de datos: Multicuenta ML
Convierte el sistema de 1 cuenta por usuario a múltiples cuentas por usuario
"""

import os
import sys
from datetime import datetime
from decimal import Decimal

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar variables de entorno antes de importar
from dotenv import load_dotenv
load_dotenv('.env.local')  # Cargar archivo local para desarrollo

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import datetime as dt

# Configurar aplicación Flask básica para migración
app = Flask(__name__)

# Configuración de base de datos
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'smartselling_test')
DB_USER = os.getenv('DB_USER', 'smartselling')
DB_PASS = os.getenv('DB_PASS', 'df5g42645381a2')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key')

db = SQLAlchemy(app)

# Modelos simplificados para migración
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    token = db.Column(db.String(500), nullable=True)
    ml_access_token = db.Column(db.String(500), nullable=True)
    ml_refresh_token = db.Column(db.String(500), nullable=True)
    ml_user_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow)

class MLAccount(db.Model):
    __tablename__ = 'ml_accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Datos de la cuenta ML
    ml_user_id = db.Column(db.String(100), unique=True, nullable=False)
    ml_nickname = db.Column(db.String(100), nullable=True)
    ml_first_name = db.Column(db.String(100), nullable=True)
    ml_last_name = db.Column(db.String(100), nullable=True)
    ml_email = db.Column(db.String(200), nullable=True)
    ml_country_id = db.Column(db.String(10), nullable=True)
    ml_site_id = db.Column(db.String(10), nullable=True)
    
    # Tokens OAuth
    access_token = db.Column(db.String(500), nullable=False)
    refresh_token = db.Column(db.String(500), nullable=True)
    token_expires_at = db.Column(db.DateTime, nullable=True)
    
    # Estado de la cuenta
    is_active = db.Column(db.Boolean, default=True)
    account_alias = db.Column(db.String(100), nullable=True)
    
    # Métricas cacheadas
    total_sales = db.Column(db.Numeric(10, 2), default=0)
    total_orders = db.Column(db.Integer, default=0)
    active_listings = db.Column(db.Integer, default=0)
    last_metrics_update = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=dt.datetime.utcnow)

class MLMetrics(db.Model):
    __tablename__ = 'ml_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    ml_account_id = db.Column(db.Integer, db.ForeignKey('ml_accounts.id'), nullable=False)
    
    # Métricas del día
    date = db.Column(db.Date, nullable=False)
    daily_sales = db.Column(db.Numeric(10, 2), default=0)
    daily_orders = db.Column(db.Integer, default=0)
    daily_views = db.Column(db.Integer, default=0)
    daily_questions = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow)

def migrate_to_multicount():
    """Migrar datos existentes al nuevo modelo multicuenta"""
    
    with app.app_context():
        print("🔄 Iniciando migración a sistema multicuenta...")
        
        # 1. Crear las nuevas tablas
        print("📊 Creando nuevas tablas...")
        db.create_all()
        
        # 2. Migrar datos existentes
        print("🔄 Migrando datos existentes...")
        users_migrated = 0
        
        # Obtener todos los usuarios que tienen tokens ML
        users_with_ml = User.query.filter(
            User.ml_access_token.isnot(None),
            User.ml_access_token != ''
        ).all()
        
        for user in users_with_ml:
            # Verificar si ya tiene una cuenta ML migrada
            existing_account = MLAccount.query.filter_by(
                user_id=user.id,
                ml_user_id=user.ml_user_id
            ).first()
            
            if not existing_account and user.ml_user_id:
                # Crear nueva cuenta ML
                ml_account = MLAccount(
                    user_id=user.id,
                    ml_user_id=user.ml_user_id,
                    ml_nickname=f"Cuenta ML {user.ml_user_id}",  # Placeholder
                    access_token=user.ml_access_token,
                    refresh_token=user.ml_refresh_token,
                    is_active=True,
                    account_alias=f"Cuenta Principal - {user.username}",
                    created_at=user.created_at or dt.datetime.utcnow()
                )
                
                db.session.add(ml_account)
                users_migrated += 1
                print(f"  ✅ Migrado: {user.username} -> ML ID: {user.ml_user_id}")
        
        # 3. Guardar cambios
        try:
            db.session.commit()
            print(f"✅ Migración completada: {users_migrated} cuentas migradas")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error en migración: {e}")
            return False
        
        # 4. Verificar migración
        total_ml_accounts = MLAccount.query.count()
        print(f"📊 Total de cuentas ML en sistema: {total_ml_accounts}")
        
        return True

def create_sample_data():
    """Crear datos de ejemplo para desarrollo"""
    
    with app.app_context():
        print("🎯 Creando datos de ejemplo...")
        
        # Buscar usuario de prueba
        test_user = User.query.filter_by(username='krossivera17@gmail.com').first()
        
        if test_user:
            # Crear una segunda cuenta ML de ejemplo
            sample_account = MLAccount(
                user_id=test_user.id,
                ml_user_id='123456789',  # ID ficticio
                ml_nickname='cuenta_ejemplo',
                ml_first_name='Ejemplo',
                ml_last_name='Cuenta',
                ml_email='ejemplo@gmail.com',
                ml_country_id='AR',
                ml_site_id='MLA',
                access_token='token_ejemplo_seguro',
                refresh_token='refresh_ejemplo',
                is_active=True,
                account_alias='Cuenta Secundaria - Ejemplo',
                total_sales=Decimal('50000.00'),
                total_orders=150,
                active_listings=25
            )
            
            db.session.add(sample_account)
            
            # Crear algunas métricas históricas de ejemplo
            for i in range(7):  # Últimos 7 días
                date_offset = dt.datetime.now().date()
                date_offset = date_offset.replace(day=max(1, date_offset.day - i))
                
                metric = MLMetrics(
                    ml_account_id=sample_account.id,
                    date=date_offset,
                    daily_sales=Decimal(f'{1000 + (i * 200)}.00'),
                    daily_orders=5 + i,
                    daily_views=100 + (i * 10),
                    daily_questions=2 + i
                )
                
                db.session.add(metric)
            
            try:
                db.session.commit()
                print("✅ Datos de ejemplo creados")
            except Exception as e:
                db.session.rollback()
                print(f"❌ Error creando ejemplos: {e}")

if __name__ == '__main__':
    print("🚀 SmartSelling - Migración Multicuenta")
    print("=" * 50)
    
    # Ejecutar migración
    if migrate_to_multicount():
        print("\n🎯 ¿Deseas crear datos de ejemplo? (y/n): ", end="")
        response = input().lower().strip()
        
        if response in ['y', 'yes', 's', 'si']:
            create_sample_data()
    
    print("\n✅ Proceso completado")
    print("🔄 Recuerda reiniciar la aplicación para aplicar los cambios")
