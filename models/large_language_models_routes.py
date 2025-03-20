# models/large_language_models_routes.py

from flask import Blueprint, request, jsonify, render_template
from models.large_language_models_model import db, LargeLanguageModel, ModelProvider
from sqlalchemy import text

models_bp = Blueprint(
    'models_bp',
    __name__,
    template_folder='templates',  # pointing to models/templates/
    static_folder='static',       # pointing to models/static/
    url_prefix='/models'
)

@models_bp.route('/api/db_test', methods=['GET'])
def db_test():
    print("[DEBUG] db_test route called. Attempting a simple SELECT 1.")
    try:
        # Use text("SELECT 1") to avoid the "Textual SQL expression should be explicitly declared" error
        result = db.session.execute(text("SELECT 1")).scalar()
        print(f"[DEBUG] db_test result: {result}")

        provider_count = db.session.query(ModelProvider).count()
        print(f"[DEBUG] db_test: provider_count = {provider_count}")

        return {
            "select_1_result": result,
            "provider_count": provider_count
        }, 200

    except Exception as e:
        print(f"[DEBUG] db_test error: {e}")
        return {"error": str(e)}, 500

@models_bp.route('/test')
def test_route():
    print("[DEBUG] In test_route for /models/test")
    return "Test route under /models is working!"

@models_bp.route('/', methods=['GET'])
def show_models_page():
    """
    Renders the HTML page that lets you view/manage large language models
    AND their providers.
    """
    return render_template('large_language_models.html')

# --------------------------------------------------------------------------
# PROVIDER ROUTES
# --------------------------------------------------------------------------

@models_bp.route('/api/providers', methods=['GET'])
def get_providers():
    """
    Returns JSON list of all ModelProviders in the database.
    """
    providers = ModelProvider.query.all()
    data = []
    for p in providers:
        data.append({
            'id': p.id,
            'name': p.name,
            'base_url': p.base_url,
            'api_key': p.api_key
        })
    return jsonify(data)

@models_bp.route('/api/providers', methods=['POST'])
def create_provider():
    """
    Create a new provider.
    Expects JSON like: 
    {
      "name": "...", 
      "base_url": "...", 
      "api_key": "..."
    }
    """
    data = request.json or {}
    print("[DEBUG] create_provider route called with data:", data)

    # If you want to check the request form instead (in case JSON is not coming in):
    # print("[DEBUG] request.form:", request.form)

    name = data.get('name')
    base_url = data.get('base_url')
    api_key = data.get('api_key')

    # Debug checks
    if not name:
        print("[DEBUG] Name is missing in the payload!")
        return jsonify({'error': 'Missing provider name'}), 400

    new_provider = ModelProvider(
        name=name,
        base_url=base_url,
        api_key=api_key
    )

    db.session.add(new_provider)
    db.session.commit()

    print("[DEBUG] New provider created with ID:", new_provider.id)

    return jsonify({'message': 'Provider created successfully', 'provider_id': new_provider.id}), 201

@models_bp.route('/api/providers/<int:provider_id>', methods=['PUT'])
def update_provider(provider_id):
    """
    Update an existing provider by ID.
    """
    provider = ModelProvider.query.get_or_404(provider_id)
    data = request.json or {}

    provider.name = data.get('name', provider.name)
    provider.base_url = data.get('base_url', provider.base_url)
    provider.api_key = data.get('api_key', provider.api_key)

    db.session.commit()
    return jsonify({'message': 'Provider updated successfully'}), 200

@models_bp.route('/api/providers/<int:provider_id>', methods=['DELETE'])
def delete_provider(provider_id):
    """
    Delete a provider by ID.
    Note: If there are LargeLanguageModel rows pointing to this 
    provider_id, you may need to handle them before or disallow this.
    """
    provider = ModelProvider.query.get_or_404(provider_id)
    db.session.delete(provider)
    db.session.commit()
    return jsonify({'message': 'Provider deleted successfully'}), 200

# --------------------------------------------------------------------------
# MODEL ROUTES
# --------------------------------------------------------------------------

@models_bp.route('/api/models', methods=['GET'])
def get_models():
    """
    Returns JSON list of all LargeLanguageModels, 
    including their provider info.
    """
    models = LargeLanguageModel.query.all()
    data = []
    for m in models:
        data.append({
            'id': m.id,
            'name': m.name,
            'provider_id': m.provider_id,
            # Include some provider info if needed
            'provider': {
                'id': m.provider.id,
                'name': m.provider.name,
                'base_url': m.provider.base_url,
                'api_key': m.provider.api_key
            }
        })
    return jsonify(data)

@models_bp.route('/api/models', methods=['POST'])
def create_model():
    """
    Create a new large language model.
    Expects JSON like: 
    {
      "name": "...",
      "provider_id": ...
    }
    """
    data = request.json or {}
    name = data.get('name')
    provider_id = data.get('provider_id')

    # You may want to check if provider exists
    provider = ModelProvider.query.get(provider_id)
    if not provider:
        return jsonify({'error': 'Provider does not exist'}), 400

    new_model = LargeLanguageModel(
        name=name,
        provider_id=provider_id
    )
    db.session.add(new_model)
    db.session.commit()
    return jsonify({'message': 'Model created successfully'}), 201

@models_bp.route('/api/models/<int:model_id>', methods=['PUT'])
def update_model(model_id):
    """
    Update an existing large language model.
    Expects JSON like: 
    {
      "name": "...",
      "provider_id": ...
    }
    """
    model = LargeLanguageModel.query.get_or_404(model_id)
    data = request.json or {}

    if 'name' in data:
        model.name = data['name']

    if 'provider_id' in data:
        provider_id = data['provider_id']
        provider = ModelProvider.query.get(provider_id)
        if not provider:
            return jsonify({'error': 'Provider does not exist'}), 400
        model.provider_id = provider_id

    db.session.commit()
    return jsonify({'message': 'Model updated successfully'}), 200

@models_bp.route('/api/models/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    """
    Delete an existing large language model by ID.
    """
    model = LargeLanguageModel.query.get_or_404(model_id)
    db.session.delete(model)
    db.session.commit()
    return jsonify({'message': 'Model deleted successfully'}), 200