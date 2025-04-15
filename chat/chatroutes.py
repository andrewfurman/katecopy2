# chat/chatroutes.py

"""
Routes for rendering the chat page and handling the /api/chat requests.
We now rely on the front-end to send the *entire* conversation each time.
"""

from flask import Blueprint, render_template, request, jsonify
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
    Renders the main chat page. 
    No session logic— each tab's conversation is handled on the front-end.
    """
    return render_template('chat.html')

@chat_bp.route('/api/chat', methods=['POST'])
def chat_api():
    """
    Receives JSON from the front-end (chat.js), which should include:
    {
      "messages": [
        {"role": "system"|"user"|"assistant", "content": "..."},
        ...
      ],
      "model": "gpt-4" (etc),
      "base_url": "..." (optional)
    }

    Calls get_chatgpt_response() with the entire conversation from the front-end.
    Returns JSON: { "response": "..." } on success or { "response": "Error..." } on error.
    """
    data = request.get_json()

    # Extract the full conversation array from the request
    conversation_history = data.get('messages', [])
    model_name = data.get('model', 'gpt-4')
    base_url = data.get('base_url', 'https://api.openai.com/v1/chat/completions')

    # Call our function that handles the chat logic
    result = get_chatgpt_response(base_url, model_name, conversation_history)
    if "error" in result:
        return jsonify({"response": f"Error from OpenAI API: {result['error']}"}), 500

    # Return the assistant's latest message
    return jsonify(result)