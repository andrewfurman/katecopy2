# main.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from models.large_language_models_model import db
from models.large_language_models_routes import models_bp

# Import the chat blueprint
from chat.chatroutes import chat_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'YOUR_SECRET_KEY'

# Configure SQLAlchemy for your Postgres database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
app.debug = True

# Register your blueprint for large language models
app.register_blueprint(models_bp)

# Register the chat blueprint
app.register_blueprint(chat_bp)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)