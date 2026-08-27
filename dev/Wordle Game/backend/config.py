# Configuration module for Wordle Application
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'wordle-super-secret-jwt-key-2026-secure-token')
    JWT_EXPIRATION_DELTA = timedelta(days=7)
    
    # Database Configuration with seamless local SQLite fallback
    DB_URI = os.getenv('DB_URI') or os.getenv('DATABASE_URL')
    if not DB_URI or DB_URI.strip() == '':
        DB_URI = f"sqlite:///{os.path.join(BASE_DIR, 'wordle.db')}"
    elif DB_URI.startswith('postgres://'):
        DB_URI = DB_URI.replace('postgres://', 'postgresql://', 1)
        
    SQLALCHEMY_DATABASE_URI = DB_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Word list file paths
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    WORDS_5_TARGET = os.path.join(DATA_DIR, 'words_5_target.txt')
    WORDS_5_VALID = os.path.join(DATA_DIR, 'words_5_valid.txt')
    WORDS_4 = os.path.join(DATA_DIR, 'words_4.txt')
    WORDS_6 = os.path.join(DATA_DIR, 'words_6.txt')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
