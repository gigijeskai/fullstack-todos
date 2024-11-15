import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    CORS_RESOURCES = {r"/api/*": {"origins": "http://localhost:3000"}}

class ProductionConfig(Config):
    DEBUG = False
    # Update this to your frontend domain when deployed
    CORS_RESOURCES = {r"/api/*": {"origins": ["https://your-frontend-domain.com"]}}
    # Use PostgreSQL for production (optional but recommended)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': ProductionConfig  # Changed default to Production
}