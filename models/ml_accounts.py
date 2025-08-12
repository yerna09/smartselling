# models/ml_accounts.py - Nuevo modelo para múltiples cuentas ML

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Nuevo modelo para múltiples cuentas de Mercado Libre
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
    account_alias = db.Column(db.String(100), nullable=True)  # Alias personalizado
    
    # Métricas cacheadas (actualizadas periódicamente)
    total_sales = db.Column(db.Decimal(10, 2), default=0)
    total_orders = db.Column(db.Integer, default=0)
    active_listings = db.Column(db.Integer, default=0)
    last_metrics_update = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def update_metrics(self, sales=None, orders=None, listings=None):
        """Actualizar métricas de la cuenta"""
        if sales is not None:
            self.total_sales = sales
        if orders is not None:
            self.total_orders = orders
        if listings is not None:
            self.active_listings = listings
        
        self.last_metrics_update = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def __repr__(self):
        return f'<MLAccount {self.ml_nickname} ({self.ml_user_id})>'


# Modelo para métricas históricas (opcional para gráficos)
class MLMetrics(db.Model):
    __tablename__ = 'ml_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    ml_account_id = db.Column(db.Integer, db.ForeignKey('ml_accounts.id'), nullable=False)
    
    # Métricas del día
    date = db.Column(db.Date, nullable=False)
    daily_sales = db.Column(db.Decimal(10, 2), default=0)
    daily_orders = db.Column(db.Integer, default=0)
    daily_views = db.Column(db.Integer, default=0)
    daily_questions = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con MLAccount
    ml_account = db.relationship('MLAccount', backref=db.backref('metrics_history', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'daily_sales': float(self.daily_sales),
            'daily_orders': self.daily_orders,
            'daily_views': self.daily_views,
            'daily_questions': self.daily_questions
        }
    
    def __repr__(self):
        return f'<MLMetrics {self.date} - ${self.daily_sales}>'
