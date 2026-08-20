import os

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "nexttwin-super-secret-key-2024-aiml-project")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nexttwin.db")

# ML Models directory
ML_MODELS_DIR = os.path.join(os.path.dirname(__file__), "ml", "saved_models")
