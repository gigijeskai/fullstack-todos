import os
class Config:
     SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///db.sqlite'
     SQLALCHEMY_TRACK_MODIFICATIONS = False
     
class DevelopmentConfig(Config):
     DEBUG = True
     CORS_RESOURCES = {r"/api/*": {"origins": "HTTP://localhost:3000"}}
     
class ProductionConfig(Config):
     DEBUG = False
     CORS_RESOURCES = {r"/api/*": {"origins": "https://your-production-url.com"}} 
     
config = {
     'development': DevelopmentConfig,
     'production': ProductionConfig,
     'default': DevelopmentConfig
}