from flask import Flask, request, jsonify, make_response, redirect, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import datetime
import jwt
import requests
from functools import wraps
import os
from dotenv import load_dotenv
import bcrypt

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configuración CORS para permitir frontend (desarrollo y producción)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://test.smartselling.com.ar',
    FRONTEND_URL
]

CORS(app, 
     origins=ALLOWED_ORIGINS,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'x-access-token'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tu_clave_secreta_aqui_cambiar_en_produccion')

# Configuración de cookies para desarrollo y producción
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') != 'development'
app.config['SESSION_COOKIE_SAMESITE'] = 'None' if os.getenv('FLASK_ENV') != 'development' else 'Lax'
app.config['SESSION_COOKIE_DOMAIN'] = '.smartselling.com.ar' if 'smartselling.com.ar' in os.getenv('FRONTEND_URL', '') else None

# Configuración de base de datos PostgreSQL
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'smartselling_test')
DB_USER = os.getenv('DB_USER', 'smartselling')
DB_PASS = os.getenv('DB_PASS', 'df5g42645381a2')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Configuración de Mercado Libre
CLIENT_ID = os.getenv('ML_CLIENT_ID', '2582847439583264')
CLIENT_SECRET = os.getenv('ML_CLIENT_SECRET', '0lVKgECCnZh0QGjhM8xpGHKCxsVbdoLi')
REDIRECT_URI = os.getenv('ML_REDIRECT_URI', 'http://localhost:8000/loading')  # Usar localhost en desarrollo
API_URL = os.getenv('API_URL', 'http://localhost:8000')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Modelo de Usuario
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)  # Hash bcrypt
    token = db.Column(db.String(500), nullable=True)  # Token JWT
    ml_access_token = db.Column(db.String(500), nullable=True)
    ml_refresh_token = db.Column(db.String(500), nullable=True)
    ml_user_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def set_password(self, password):
        """Hash y guarda la contraseña"""
        password_bytes = password.encode('utf-8')
        self.password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Verifica la contraseña"""
        password_bytes = password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, self.password_hash.encode('utf-8'))

    def __repr__(self):
        return f'<User {self.username}>'

# ============= NUEVOS MODELOS MULTICUENTA =============

# Modelo para múltiples cuentas de Mercado Libre
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
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relación con User
    user = db.relationship('User', backref=db.backref('ml_accounts', lazy=True))
    
    def to_dict(self):
        """Convertir a diccionario para JSON"""
        return {
            'id': self.id,
            'ml_user_id': self.ml_user_id,
            'ml_nickname': self.ml_nickname,
            'ml_first_name': self.ml_first_name,
            'ml_last_name': self.ml_last_name,
            'ml_email': self.ml_email,
            'ml_country_id': self.ml_country_id,
            'ml_site_id': self.ml_site_id,
            'is_active': self.is_active,
            'account_alias': self.account_alias,
            'total_sales': float(self.total_sales) if self.total_sales else 0,
            'total_orders': self.total_orders,
            'active_listings': self.active_listings,
            'last_metrics_update': self.last_metrics_update.isoformat() if self.last_metrics_update else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'token_expires_at': self.token_expires_at.isoformat() if self.token_expires_at else None
        }
    
    def __repr__(self):
        return f'<MLAccount {self.ml_nickname} ({self.ml_user_id})>'

# Modelo para métricas diarias de cuentas ML
class MLAccountMetrics(db.Model):
    __tablename__ = 'ml_account_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    ml_account_id = db.Column(db.Integer, db.ForeignKey('ml_accounts.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    
    # Métricas diarias
    daily_sales = db.Column(db.Numeric(10, 2), default=0)
    daily_orders = db.Column(db.Integer, default=0)
    daily_views = db.Column(db.Integer, default=0)
    daily_questions = db.Column(db.Integer, default=0)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relación con MLAccount
    ml_account = db.relationship('MLAccount', backref=db.backref('metrics', lazy=True))
    
    # Índice único para evitar duplicados por día
    __table_args__ = (db.UniqueConstraint('ml_account_id', 'date', name='_ml_account_date_uc'),)
    
    def to_dict(self):
        """Convertir a diccionario para JSON"""
        return {
            'id': self.id,
            'ml_account_id': self.ml_account_id,
            'date': self.date.isoformat() if self.date else None,
            'daily_sales': float(self.daily_sales) if self.daily_sales else 0,
            'daily_orders': self.daily_orders,
            'daily_views': self.daily_views,
            'daily_questions': self.daily_questions,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<MLAccountMetrics {self.ml_account_id} - {self.date}>'

# Decorador para validar JWT en rutas protegidas
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Buscar token en headers
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # Buscar token en cookies
        elif request.cookies.get('token'):
            token = request.cookies.get('token')

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Decodificar token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id'], token=token).first()
            
            if not current_user:
                return jsonify({'message': 'Token is invalid or expired!'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired, please login again!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ============= NUEVOS ENDPOINTS MULTICUENTA =============

# Obtener todas las cuentas ML del usuario
@app.route('/ml-accounts')
@token_required
def get_ml_accounts(current_user):
    try:
        accounts = MLAccount.query.filter_by(user_id=current_user.id).all()
        
        return jsonify({
            'accounts': [account.to_dict() for account in accounts],
            'total': len(accounts)
        })
    except Exception as e:
        return jsonify({'message': f'Error getting ML accounts: {str(e)}'}), 500

# Actualizar una cuenta ML específica
@app.route('/ml-accounts/<int:account_id>', methods=['PUT'])
@token_required
def update_ml_account(current_user, account_id):
    try:
        account = MLAccount.query.filter_by(id=account_id, user_id=current_user.id).first()
        
        if not account:
            return jsonify({'message': 'ML account not found'}), 404
        
        data = request.get_json()
        
        # Actualizar campos permitidos
        if 'account_alias' in data:
            account.account_alias = data['account_alias']
        if 'is_active' in data:
            account.is_active = data['is_active']
        
        account.updated_at = datetime.datetime.utcnow()
        db.session.commit()
        
        return jsonify(account.to_dict())
    except Exception as e:
        return jsonify({'message': f'Error updating ML account: {str(e)}'}), 500

# Eliminar una cuenta ML
@app.route('/ml-accounts/<int:account_id>', methods=['DELETE'])
@token_required
def delete_ml_account(current_user, account_id):
    try:
        account = MLAccount.query.filter_by(id=account_id, user_id=current_user.id).first()
        
        if not account:
            return jsonify({'message': 'ML account not found'}), 404
        
        db.session.delete(account)
        db.session.commit()
        
        return jsonify({'message': 'ML account removed successfully'})
    except Exception as e:
        return jsonify({'message': f'Error removing ML account: {str(e)}'}), 500

# Actualizar datos de cuenta ML desde la API
@app.route('/ml-accounts/<int:account_id>/update-data', methods=['POST'])
@token_required
def update_ml_account_data(current_user, account_id):
    try:
        account = MLAccount.query.filter_by(id=account_id, user_id=current_user.id).first()
        
        if not account:
            return jsonify({'message': 'ML account not found'}), 404
        
        # Obtener datos actualizados de ML
        headers = {
            'Authorization': f'Bearer {account.access_token}',
            'User-Agent': 'SmartSelling-App/1.0'
        }
        
        try:
            user_response = requests.get(
                f'https://api.mercadolibre.com/users/{account.ml_user_id}', 
                headers=headers, 
                timeout=10
            )
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                
                # Actualizar datos de la cuenta
                account.ml_nickname = user_data.get('nickname', account.ml_nickname)
                account.ml_first_name = user_data.get('first_name', account.ml_first_name)
                account.ml_last_name = user_data.get('last_name', account.ml_last_name)
                account.ml_email = user_data.get('email', account.ml_email)
                account.ml_country_id = user_data.get('country_id', account.ml_country_id)
                account.ml_site_id = user_data.get('site_id', account.ml_site_id)
                account.updated_at = datetime.datetime.utcnow()
                
                db.session.commit()
                
                return jsonify({
                    'message': 'Account data updated successfully',
                    'account': account.to_dict()
                })
            else:
                return jsonify({'message': f'Error updating account data: ML API returned {user_response.status_code}'}), 400
                
        except requests.exceptions.RequestException as e:
            return jsonify({'message': f'Error connecting to ML API: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'message': f'Error updating ML account data: {str(e)}'}), 500

# Obtener métricas de una cuenta específica
@app.route('/ml-accounts/<int:account_id>/metrics')
@token_required
def get_account_metrics(current_user, account_id):
    try:
        account = MLAccount.query.filter_by(id=account_id, user_id=current_user.id).first()
        
        if not account:
            return jsonify({'message': 'ML account not found'}), 404
        
        # Llamar a la API de ML para obtener métricas en tiempo real
        metrics = fetch_ml_metrics(account.access_token, account.ml_user_id)
        
        return jsonify({
            'account': account.to_dict(),
            'metrics': metrics
        })
    except Exception as e:
        return jsonify({'message': f'Error getting metrics: {str(e)}'}), 500

# Refrescar métricas de una cuenta
@app.route('/ml-accounts/<int:account_id>/refresh-metrics', methods=['POST'])
@token_required
def refresh_account_metrics(current_user, account_id):
    try:
        account = MLAccount.query.filter_by(id=account_id, user_id=current_user.id).first()
        
        if not account:
            return jsonify({'message': 'ML account not found'}), 404
        
        # Obtener métricas actualizadas de ML
        metrics = fetch_ml_metrics(account.access_token, account.ml_user_id)
        
        # Verificar si hay error de token
        if metrics.get('error') == 'token_expired':
            return jsonify({'message': 'Token expired, please reconnect account'}), 401
        
        # Actualizar en la base de datos
        account.total_sales = metrics.get('total_sales', 0)
        account.total_orders = metrics.get('total_orders', 0)
        account.active_listings = metrics.get('active_listings', 0)
        account.last_metrics_update = datetime.datetime.utcnow()
        
        # Actualizar datos del usuario si están disponibles
        user_data = metrics.get('user_data', {})
        if user_data:
            account.ml_nickname = user_data.get('nickname', account.ml_nickname)
            account.ml_first_name = user_data.get('first_name', account.ml_first_name)
            account.ml_last_name = user_data.get('last_name', account.ml_last_name)
            account.ml_email = user_data.get('email', account.ml_email)
        
        db.session.commit()
        
        # Guardar métricas diarias
        today = datetime.date.today()
        daily_metrics = MLAccountMetrics.query.filter_by(
            ml_account_id=account.id, 
            date=today
        ).first()
        
        if not daily_metrics:
            daily_metrics = MLAccountMetrics(
                ml_account_id=account.id,
                date=today,
                daily_sales=metrics.get('total_sales', 0),
                daily_orders=metrics.get('total_orders', 0),
                daily_views=0,  # Por ahora 0, agregar endpoint específico después
                daily_questions=0
            )
            db.session.add(daily_metrics)
        else:
            daily_metrics.daily_sales = metrics.get('total_sales', 0)
            daily_metrics.daily_orders = metrics.get('total_orders', 0)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Metrics updated successfully',
            'account': account.to_dict(),
            'daily_metrics': daily_metrics.to_dict()
        })
    except Exception as e:
        return jsonify({'message': f'Error refreshing metrics: {str(e)}'}), 500

# Obtener métricas diarias de una cuenta
@app.route('/ml-accounts/<int:account_id>/daily-metrics')
@token_required
def get_daily_metrics(current_user, account_id):
    try:
        account = MLAccount.query.filter_by(id=account_id, user_id=current_user.id).first()
        
        if not account:
            return jsonify({'message': 'ML account not found'}), 404
        
        # Obtener métricas de los últimos 30 días
        thirty_days_ago = datetime.date.today() - datetime.timedelta(days=30)
        daily_metrics = MLAccountMetrics.query.filter_by(ml_account_id=account.id).filter(
            MLAccountMetrics.date >= thirty_days_ago
        ).order_by(MLAccountMetrics.date.desc()).all()
        
        return jsonify({
            'account_id': account_id,
            'metrics': [metric.to_dict() for metric in daily_metrics],
            'total_records': len(daily_metrics)
        })
    except Exception as e:
        return jsonify({'message': f'Error getting daily metrics: {str(e)}'}), 500

# Refrescar métricas de todas las cuentas
@app.route('/ml-accounts/refresh-all-metrics', methods=['POST'])
@token_required
def refresh_all_metrics(current_user):
    try:
        accounts = MLAccount.query.filter_by(user_id=current_user.id, is_active=True).all()
        updated_count = 0
        
        for account in accounts:
            try:
                metrics = fetch_ml_metrics(account.access_token, account.ml_user_id)
                
                account.total_sales = metrics.get('total_sales', 0)
                account.total_orders = metrics.get('total_orders', 0)
                account.active_listings = metrics.get('active_listings', 0)
                account.last_metrics_update = datetime.datetime.utcnow()
                
                updated_count += 1
            except Exception as e:
                print(f"Error updating metrics for account {account.id}: {e}")
                continue
        
        db.session.commit()
        
        return jsonify({
            'message': f'Updated metrics for {updated_count} accounts',
            'updated_count': updated_count,
            'total_accounts': len(accounts)
        })
    except Exception as e:
        return jsonify({'message': f'Error refreshing all metrics: {str(e)}'}), 500

def fetch_ml_metrics(access_token, ml_user_id):
    """Función auxiliar para obtener métricas de ML API"""
    try:
        headers = {
            'Authorization': f'Bearer {access_token}',
            'User-Agent': 'SmartSelling-App/1.0'
        }
        
        # Obtener información del usuario ML
        try:
            user_response = requests.get(
                f'https://api.mercadolibre.com/users/{ml_user_id}', 
                headers=headers, 
                timeout=10
            )
            user_data = user_response.json() if user_response.status_code == 200 else {}
            
            if user_response.status_code == 401:
                print(f"Token expired for user {ml_user_id}")
                return {'error': 'token_expired', 'user_data': {}}
                
        except requests.exceptions.RequestException as e:
            print(f"Error fetching user data for {ml_user_id}: {e}")
            user_data = {}
        
        # Obtener publicaciones activas
        try:
            items_response = requests.get(
                f'https://api.mercadolibre.com/users/{ml_user_id}/items/search?status=active&limit=1', 
                headers=headers, 
                timeout=10
            )
            items_data = items_response.json() if items_response.status_code == 200 else {}
            active_listings = items_data.get('paging', {}).get('total', 0)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching items for {ml_user_id}: {e}")
            active_listings = 0
        
        # Para órdenes, usar endpoint más simple por ahora
        try:
            # Solo obtener el conteo básico, no todas las órdenes
            orders_response = requests.get(
                f'https://api.mercadolibre.com/users/{ml_user_id}', 
                headers=headers, 
                timeout=10
            )
            orders_data = orders_response.json() if orders_response.status_code == 200 else {}
            # Por ahora usar datos del perfil como aproximación
            total_orders = orders_data.get('seller_reputation', {}).get('transactions', {}).get('completed', 0)
            total_sales = 0  # Calcular desde órdenes reales requiere más endpoints
        except requests.exceptions.RequestException as e:
            print(f"Error fetching order data for {ml_user_id}: {e}")
            total_orders = 0
            total_sales = 0
        
        return {
            'total_sales': float(total_sales),
            'total_orders': int(total_orders),
            'active_listings': int(active_listings),
            'user_data': user_data
        }
    except Exception as e:
        print(f"Error fetching ML metrics: {e}")
        return {
            'total_sales': 0.0,
            'total_orders': 0,
            'active_listings': 0,
            'user_data': {}
        }

# Ruta de inicio
@app.route('/')
def home():
    # Detectar si la petición viene del frontend de producción o desarrollo
    host = request.headers.get('Host', '')
    user_agent = request.headers.get('User-Agent', '')
    
    # Solo mostrar HTML si es explícitamente un navegador web navegando directamente
    # y NO una petición AJAX/fetch
    is_browser_navigation = (
        'text/html' in request.headers.get('Accept', '') and
        'Mozilla' in user_agent and
        'fetch' not in request.headers.get('Sec-Fetch-Mode', '') and
        request.headers.get('X-Requested-With') != 'XMLHttpRequest'
    )
    
    if is_browser_navigation:
        # Si viene del dominio de frontend, usar el template moderno
        if 'test.smartselling.com.ar' in host:
            return render_template('frontend.html')
        else:
            # Para localhost o desarrollo, usar index.html
            return render_template('index.html')
    
    # Si es una petición de API o AJAX, SIEMPRE devolver JSON
    return jsonify({
        'message': 'SmartSelling API - Mercado Libre Integration',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'register': 'POST /register',
            'login': 'POST /login',
            'profile': 'GET /profile (requiere token)',
            'ml_accounts': 'GET /ml-accounts (requiere token)',
            'ml_auth': 'GET /mercadolibre/auth (requiere token)',
            'ml_callback': 'GET /mercadolibre/callback (requiere token)',
            'ml_loading': 'GET /loading (callback ML)',
            'ml_data': 'GET /mercadolibre/data (requiere token)',
            'ml_refresh': 'POST /mercadolibre/refresh (requiere token)',
            'logout': 'POST /logout (requiere token)'
        },
        'config': {
            'ml_client_id': CLIENT_ID,
            'redirect_uri': REDIRECT_URI,
            'frontend_url': FRONTEND_URL,
            'api_url': API_URL
        }
    })

# Registro de usuario con token JWT de 30 días
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Username and password are required!'}), 400
            
        username = data['username']
        password = data['password']

        # Verificar si el usuario ya existe
        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'User already exists!'}), 400

        # Crear nuevo usuario
        new_user = User(username=username)
        new_user.set_password(password)  # Hash la contraseña
        db.session.add(new_user)
        db.session.commit()

        # Generar token JWT con expiración de 30 días
        token = jwt.encode({
            'user_id': new_user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        # Guardar token en la base de datos
        new_user.token = token
        db.session.commit()

        # Crear respuesta con cookie
        resp = make_response(jsonify({
            'message': 'User registered successfully',
            'user_id': new_user.id,
            'username': new_user.username
        }), 201)
        
        # Configurar cookie según el entorno
        is_production = 'smartselling.com.ar' in os.getenv('FRONTEND_URL', '')
        
        resp.set_cookie('token', token, 
                       httponly=True, 
                       max_age=30*24*60*60,
                       domain='.smartselling.com.ar' if is_production else None,
                       secure=is_production,
                       samesite='None' if is_production else 'Lax')
        
        return resp

    except Exception as e:
        return jsonify({'message': f'Error during registration: {str(e)}'}), 500

# Login con actualización del token JWT
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Username and password are required!'}), 400
            
        user = User.query.filter_by(username=data['username']).first()

        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401

        # Generar nuevo token JWT
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        # Actualizar token en la base de datos
        user.token = token
        db.session.commit()

        # Crear respuesta
        resp = make_response(jsonify({
            'message': 'Logged in successfully',
            'user_id': user.id,
            'username': user.username,
            'ml_linked': bool(user.ml_access_token)
        }))
        
        # Configurar cookie según el entorno
        is_production = 'smartselling.com.ar' in os.getenv('FRONTEND_URL', '')
        
        resp.set_cookie('token', token, 
                       httponly=True, 
                       max_age=30*24*60*60,
                       domain='.smartselling.com.ar' if is_production else None,
                       secure=is_production,
                       samesite='None' if is_production else 'Lax')
        
        return resp

    except Exception as e:
        return jsonify({'message': f'Error during login: {str(e)}'}), 500

# Perfil del usuario (ruta protegida)
@app.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        'user_id': current_user.id,
        'username': current_user.username,
        'ml_linked': bool(current_user.ml_access_token),
        'ml_user_id': current_user.ml_user_id,
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None
    })

# Iniciar proceso de autorización con Mercado Libre
@app.route('/mercadolibre/auth')
@token_required
def ml_auth(current_user):
    auth_url = f"https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}"
    return jsonify({
        'auth_url': auth_url,
        'message': 'Redirect user to this URL to authorize Mercado Libre access'
    })

# Endpoint para recibir el código OAuth de Mercado Libre y obtener tokens (ACTUALIZADO MULTICUENTA)
@app.route('/mercadolibre/callback')
@token_required
def ml_callback(current_user):
    try:
        code = request.args.get('code')
        
        if not code:
            return jsonify({'message': 'No authorization code provided'}), 400

        # Intercambiar código por tokens
        url = 'https://api.mercadolibre.com/oauth/token'
        payload = {
            'grant_type': 'authorization_code',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': code,
            'redirect_uri': REDIRECT_URI
        }

        response = requests.post(url, data=payload)
        
        if response.status_code != 200:
            return jsonify({
                'message': 'Failed to get token from Mercado Libre',
                'error': response.text
            }), 400

        data = response.json()
        ml_user_id = str(data['user_id'])

        # Verificar si ya existe esta cuenta ML
        existing_account = MLAccount.query.filter_by(ml_user_id=ml_user_id).first()
        
        if existing_account:
            if existing_account.user_id != current_user.id:
                return jsonify({
                    'message': 'Esta cuenta de Mercado Libre ya está vinculada a otro usuario'
                }), 400
            
            # Actualizar tokens de cuenta existente
            existing_account.access_token = data['access_token']
            existing_account.refresh_token = data['refresh_token']
            existing_account.is_active = True
            existing_account.updated_at = datetime.datetime.utcnow()
            
            db.session.commit()
            
            return jsonify({
                'message': 'Cuenta de Mercado Libre actualizada exitosamente!',
                'account': existing_account.to_dict()
            })
        
        # Obtener información del usuario de ML
        headers = {'Authorization': f'Bearer {data["access_token"]}'}
        user_response = requests.get(f'https://api.mercadolibre.com/users/{ml_user_id}', headers=headers)
        
        user_info = {}
        if user_response.status_code == 200:
            user_info = user_response.json()

        # Crear nueva cuenta ML
        new_account = MLAccount(
            user_id=current_user.id,
            ml_user_id=ml_user_id,
            ml_nickname=user_info.get('nickname', f'ml_{ml_user_id}'),
            ml_first_name=user_info.get('first_name'),
            ml_last_name=user_info.get('last_name'),
            ml_email=user_info.get('email'),
            ml_country_id=user_info.get('country_id'),
            ml_site_id=user_info.get('site_id'),
            access_token=data['access_token'],
            refresh_token=data['refresh_token'],
            is_active=True,
            account_alias=f"Cuenta ML - {user_info.get('nickname', ml_user_id)}"
        )
        
        db.session.add(new_account)
        
        # También actualizar el usuario principal (compatibilidad con versión anterior)
        if not current_user.ml_access_token:
            current_user.ml_access_token = data['access_token']
            current_user.ml_refresh_token = data['refresh_token']
            current_user.ml_user_id = ml_user_id
        
        db.session.commit()

        return jsonify({
            'message': 'Nueva cuenta de Mercado Libre vinculada exitosamente!',
            'account': new_account.to_dict()
        })

    except Exception as e:
        return jsonify({'message': f'Error during ML callback: {str(e)}'}), 500

# Nuevo endpoint /loading para manejar el callback de ML
@app.route('/loading')
def ml_loading():
    """
    Endpoint para manejar el callback de Mercado Libre.
    Recibe el código de autorización y procesa los tokens.
    """
    try:
        code = request.args.get('code')
        error = request.args.get('error')
        
        if error:
            return render_template('loading.html', 
                                 error=f"Error de autorización: {error}")
        
        if not code:
            return render_template('loading.html', 
                                 error="No se recibió código de autorización")

        # Intercambiar código por tokens
        url = 'https://api.mercadolibre.com/oauth/token'
        payload = {
            'grant_type': 'authorization_code',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': code,
            'redirect_uri': REDIRECT_URI
        }

        response = requests.post(url, data=payload)
        
        if response.status_code != 200:
            return render_template('loading.html', 
                                 error=f"Error obteniendo tokens: {response.text}")

        data = response.json()
        
        # Los tokens se procesarán en el frontend via JavaScript
        return render_template('loading.html', 
                             success=True,
                             access_token=data.get('access_token'),
                             refresh_token=data.get('refresh_token'),
                             user_id=data.get('user_id'),
                             frontend_url=FRONTEND_URL)

    except Exception as e:
        return render_template('loading.html', 
                             error=f"Error procesando callback: {str(e)}")

# Endpoint para guardar tokens desde el frontend
@app.route('/mercadolibre/save-tokens', methods=['POST'])
@token_required
def save_ml_tokens(current_user):
    """
    Guarda los tokens de ML que vienen del frontend después del callback
    Actualizado para sistema multicuenta
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('access_token'):
            return jsonify({'message': 'Access token required'}), 400
        
        access_token = data['access_token']
        refresh_token = data.get('refresh_token')
        ml_user_id = str(data.get('user_id', ''))
        
        if not ml_user_id:
            return jsonify({'message': 'ML User ID required'}), 400
        
        # Verificar si ya existe una cuenta ML con este user_id
        existing_account = MLAccount.query.filter_by(ml_user_id=ml_user_id).first()
        
        if existing_account:
            if existing_account.user_id != current_user.id:
                return jsonify({'message': 'This ML account is already linked to another user'}), 400
            
            # Actualizar tokens existentes
            existing_account.access_token = access_token
            existing_account.refresh_token = refresh_token
            existing_account.token_expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=6)
            existing_account.is_active = True
            existing_account.updated_at = datetime.datetime.utcnow()
            
            account = existing_account
        else:
            # Obtener datos del usuario ML
            headers = {'Authorization': f'Bearer {access_token}'}
            try:
                user_response = requests.get(f'https://api.mercadolibre.com/users/{ml_user_id}', headers=headers)
                user_data = user_response.json() if user_response.status_code == 200 else {}
            except:
                user_data = {}
            
            # Crear nueva cuenta ML
            account = MLAccount(
                user_id=current_user.id,
                ml_user_id=ml_user_id,
                ml_nickname=user_data.get('nickname', f'Cuenta ML {ml_user_id}'),
                ml_first_name=user_data.get('first_name'),
                ml_last_name=user_data.get('last_name'),
                ml_email=user_data.get('email'),
                ml_country_id=user_data.get('country_id'),
                ml_site_id=user_data.get('site_id'),
                access_token=access_token,
                refresh_token=refresh_token,
                token_expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=6),
                is_active=True,
                account_alias=f'Cuenta Principal - {current_user.username}'
            )
            db.session.add(account)
        
        # También actualizar los tokens en el modelo User para compatibilidad (usando la cuenta principal)
        if not current_user.ml_access_token:  # Solo si no tiene tokens aún
            current_user.ml_access_token = access_token
            current_user.ml_refresh_token = refresh_token
            current_user.ml_user_id = ml_user_id
        
        db.session.commit()
        
        return jsonify({
            'message': 'ML account linked successfully',
            'account': account.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error saving ML account: {str(e)}'}), 500

# Ruta protegida que usa el token de Mercado Libre para consultar datos
@app.route('/mercadolibre/data')
@token_required
def ml_data(current_user):
    try:
        if not current_user.ml_access_token:
            return jsonify({'message': 'Mercado Libre not linked'}), 400

        headers = {
            'Authorization': f'Bearer {current_user.ml_access_token}'
        }

        # Obtener datos del perfil de ML
        ml_response = requests.get('https://api.mercadolibre.com/users/me', headers=headers)

        if ml_response.status_code == 401:
            return jsonify({
                'message': 'Mercado Libre token expired, please refresh',
                'refresh_needed': True
            }), 401
        elif ml_response.status_code != 200:
            return jsonify({
                'message': 'Error fetching Mercado Libre data',
                'status_code': ml_response.status_code
            }), 400

        return jsonify({
            'message': 'Data retrieved successfully',
            'data': ml_response.json()
        })

    except Exception as e:
        return jsonify({'message': f'Error fetching ML data: {str(e)}'}), 500

# Refrescar token de Mercado Libre
@app.route('/mercadolibre/refresh', methods=['POST'])
@token_required
def ml_refresh_token(current_user):
    try:
        if not current_user.ml_refresh_token:
            return jsonify({'message': 'No refresh token available'}), 400

        url = 'https://api.mercadolibre.com/oauth/token'
        payload = {
            'grant_type': 'refresh_token',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'refresh_token': current_user.ml_refresh_token
        }

        response = requests.post(url, data=payload)
        
        if response.status_code != 200:
            return jsonify({
                'message': 'Failed to refresh Mercado Libre token',
                'error': response.text
            }), 400

        data = response.json()

        # Actualizar tokens
        current_user.ml_access_token = data['access_token']
        current_user.ml_refresh_token = data['refresh_token']
        db.session.commit()

        return jsonify({'message': 'Token refreshed successfully'})

    except Exception as e:
        return jsonify({'message': f'Error refreshing token: {str(e)}'}), 500

# Logout
@app.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    try:
        # Invalidar token en la base de datos
        current_user.token = None
        db.session.commit()

        resp = make_response(jsonify({'message': 'Logged out successfully'}))
        # Limpiar cookie según el entorno
        is_production = 'smartselling.com.ar' in os.getenv('FRONTEND_URL', '')
        
        resp.set_cookie('token', '', 
                       expires=0,
                       domain='.smartselling.com.ar' if is_production else None,
                       secure=is_production,
                       samesite='None' if is_production else 'Lax')
        
        return resp

    except Exception as e:
        return jsonify({'message': f'Error during logout: {str(e)}'}), 500

# Manejo de errores
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

# Endpoint para inicializar/migrar la base de datos
@app.route('/init-db', methods=['POST'])
def init_database():
    """
    Endpoint para crear todas las tablas de la base de datos
    """
    try:
        with app.app_context():
            # Crear todas las tablas
            db.create_all()
            
            # Verificar tablas creadas
            from sqlalchemy import text
            tables = db.session.execute(text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            )).fetchall()
            
            table_names = [table[0] for table in tables]
            
            return jsonify({
                'message': 'Database initialized successfully',
                'tables_created': table_names,
                'database_url': f'postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}'
            })
    except Exception as e:
        return jsonify({
            'message': f'Error initializing database: {str(e)}'
        }), 500

# Endpoint de salud de la API
@app.route('/health', methods=['GET'])
def health_check():
    """
    Endpoint para verificar el estado de la API y servicios
    """
    try:
        # Verificar conexión a base de datos
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'
    
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'database': db_status,
        'environment': os.getenv('FLASK_ENV', 'production'),
        'ml_client_configured': bool(CLIENT_ID and CLIENT_SECRET),
        'frontend_url': FRONTEND_URL,
        'api_url': API_URL,
        'timestamp': datetime.datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully!")
            print(f"Database: postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")
            print(f"ML Client ID: {CLIENT_ID}")
            print(f"ML Redirect URI: {REDIRECT_URI}")
            print(f"Frontend URL: {FRONTEND_URL}")
            print(f"API URL: {API_URL}")
        except Exception as e:
            print(f"Error creating database tables: {e}")
    
    # Configuración del servidor
    host = os.getenv('SERVER_HOST', '0.0.0.0')
    port = int(os.getenv('SERVER_PORT', 8000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"Starting server on {host}:{port}")
    app.run(debug=debug, host=host, port=port)
