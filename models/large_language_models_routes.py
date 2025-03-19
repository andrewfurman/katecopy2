 # this python file will contain the routes to get all of the available models that are in the model database. It will also have options to delete models from the database

# models/large_language_models_routes.py

from flask import Blueprint, request, jsonify, render_template
from models.large_language_models_model import db, LargeLanguageModel

# Create a Blueprint with a URL prefix, so all routes start with `/models`
models_bp = Blueprint(
    'models_bp', 
    __name__, 
    template_folder='.',  # folder containing large_language_models.html
    static_folder='.',    # folder containing large_language_models.js
    url_prefix='/models'
)

@models_bp.route('/', methods=['GET'])
def show_models_page():
    """
    Renders the HTML page that lets you view/manage large language models.
    """
    return render_template('large_language_models.html')

@models_bp.route('/api', methods=['GET'])
def get_models():
    """
    Returns JSON list of all models in the database.
    """
    models = LargeLanguageModel.query.all()
    data = []
    for m in models:
        data.append({
            'id': m.id,
            'name': m.name,
            'base_url': m.base_url,
            'api_key': m.api_key
        })
    return jsonify(data)

@models_bp.route('/api', methods=['POST'])
def create_model():
    """
    Create a new large language model.
    Expects JSON like: { "name": "...", "base_url": "...", "api_key": "..." }
    """
    data = request.json or {}
    new_model = LargeLanguageModel(
        name=data.get('name'),
        base_url=data.get('base_url'),
        api_key=data.get('api_key')
    )
    db.session.add(new_model)
    db.session.commit()
    return jsonify({'message': 'Model created successfully'}), 201

@models_bp.route('/api/<int:model_id>', methods=['PUT'])
def update_model(model_id):
    """
    Update an existing large language model.
    """
    model = LargeLanguageModel.query.get_or_404(model_id)
    data = request.json or {}

    model.name = data.get('name', model.name)
    model.base_url = data.get('base_url', model.base_url)
    model.api_key = data.get('api_key', model.api_key)

    db.session.commit()
    return jsonify({'message': 'Model updated successfully'}), 200

@models_bp.route('/api/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    """
    Delete an existing large language model by ID.
    """
    model = LargeLanguageModel.query.get_or_404(model_id)
    db.session.delete(model)
    db.session.commit()
    return jsonify({'message': 'Model deleted successfully'}), 200