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

# Configuración CORS para permitir frontend
CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')], supports_credentials=True)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tu_clave_secreta_aqui_cambiar_en_produccion')

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
REDIRECT_URI = os.getenv('ML_REDIRECT_URI', 'https://api-test.smartselling.com.ar/loading')
API_URL = os.getenv('API_URL', 'https://api-test.smartselling.com.ar')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://test.smartselling.com.ar')

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

# Ruta de inicio
@app.route('/')
def home():
    # Detectar si la petición viene del frontend de producción o desarrollo
    host = request.headers.get('Host', '')
    
    # Si es una petición de navegador, mostrar la página web
    if 'text/html' in request.headers.get('Accept', ''):
        # Si viene del dominio de frontend, usar el template moderno
        if 'test.smartselling.com.ar' in host:
            return render_template('frontend.html')
        else:
            # Para localhost o desarrollo, usar index.html
            return render_template('index.html')
    
    # Si es una petición de API, devolver JSON
    return jsonify({
        'message': 'SmartSelling API - Mercado Libre Integration',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'register': 'POST /register',
            'login': 'POST /login',
            'profile': 'GET /profile (requiere token)',
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
        
        # Configurar cookie para funcionar entre subdominios
        resp.set_cookie('token', token, 
                       httponly=True, 
                       max_age=30*24*60*60,
                       domain='.smartselling.com.ar',
                       secure=True,
                       samesite='None')
        
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
        
        # Configurar cookie para funcionar entre subdominios
        resp.set_cookie('token', token, 
                       httponly=True, 
                       max_age=30*24*60*60,
                       domain='.smartselling.com.ar',
                       secure=True,
                       samesite='None')
        
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

# Endpoint para recibir el código OAuth de Mercado Libre y obtener tokens
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

        # Guardar tokens de Mercado Libre
        current_user.ml_access_token = data['access_token']
        current_user.ml_refresh_token = data['refresh_token']
        current_user.ml_user_id = str(data['user_id'])
        db.session.commit()

        return jsonify({
            'message': 'Mercado Libre linked successfully!',
            'ml_user_id': current_user.ml_user_id
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
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('access_token'):
            return jsonify({'message': 'Access token required'}), 400
        
        # Guardar tokens
        current_user.ml_access_token = data['access_token']
        current_user.ml_refresh_token = data.get('refresh_token')
        current_user.ml_user_id = str(data.get('user_id', ''))
        db.session.commit()
        
        return jsonify({
            'message': 'Tokens saved successfully',
            'ml_user_id': current_user.ml_user_id
        })
        
    except Exception as e:
        return jsonify({'message': f'Error saving tokens: {str(e)}'}), 500

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
        # Limpiar cookie con la misma configuración de dominio
        resp.set_cookie('token', '', 
                       expires=0,
                       domain='.smartselling.com.ar',
                       secure=True,
                       samesite='None')
        
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
