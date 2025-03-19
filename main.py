# main.py
import os
from openai import OpenAI
from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy

from chat.chatgpt_api_call import get_chatgpt_response
from models.large_language_models_model import db
from models.large_language_models_routes import models_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'YOUR_SECRET_KEY'

# Configure SQLAlchemy for your Postgres database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the Flask app
db.init_app(app)

# Initialize the new OpenAI client with your API key
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

# Register your blueprint for large language models
app.register_blueprint(models_bp)

@app.route('/')
def index():
    # Serve the main chat page
    return send_from_directory('chat', 'chat.html')

@app.route('/chat.js')
def chat_js():
    return send_from_directory('chat', 'chat.js')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.get_json()
    user_message = data.get('message', '')
    model = data.get('model', 'gpt-4o')  # default fallback

    result = get_chatgpt_response(client, user_message, model)
    if "error" in result:
        return jsonify({"response": f"Error from OpenAI API: {result['error']}"}), 500

    return jsonify(result)

if __name__ == '__main__':
    # Create tables if they don't exist yet
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)