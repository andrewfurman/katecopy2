# chat/chatroutes.py
from flask import Blueprint, render_template, request, jsonify, session
from chat.chatgpt_api_call import get_chatgpt_response

chat_bp = Blueprint(
    'chat_bp',
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path=''
)

@chat_bp.route('/')
def chat_index():
    """
    Serves the main chat page (chat.html) from chat/templates/.
    """
    session.pop('chat_history', None)  # Remove chat_history if it exists
    return render_template('chat.html')


@chat_bp.route('/api/chat', methods=['POST'])
def chat_api():
    """
    Receives JSON from the front-end (chat.js), which should include:
      {
        "message": "...",
        "model": "...",
        "base_url": "..."  (optional)
      }

    Calls get_chatgpt_response(base_url, model_name, user_message).
    Returns JSON: { "response": "..." } or { "response": "Error..." }
    """
    data = request.get_json()

    # Extract message, model name, and optional base_url from the POST body
    user_message = data.get('message', '')
    model_name = data.get('model', 'gpt-4')

    # Default base_url to official OpenAI endpoint unless overridden
    base_url = data.get('base_url', 'https://api.openai.com/v1/chat/completions')

    # Call our function that handles the chat logic
    result = get_chatgpt_response(base_url, model_name, user_message)
    if "error" in result:
        return jsonify({"response": f"Error from OpenAI API: {result['error']}"}), 500

    return jsonify(result)