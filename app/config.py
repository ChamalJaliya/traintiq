import os
from dotenv import load_dotenv

# Load environment variables from config.env file
load_dotenv('config.env')

class Config:
    """Base configuration class."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:lenacjnv7@localhost:3306/traintiq_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # Upload Configuration
    UPLOAD_DIR = os.getenv('UPLOAD_DIR', './uploads')
    MAX_FILE_SIZE_MB = int(os.getenv('MAX_FILE_SIZE_MB', 10))
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:4200,http://localhost:3000').split(',')
    
    # Redis Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Celery Configuration
    CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0') 