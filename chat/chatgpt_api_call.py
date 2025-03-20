# chat/chatgpt_api_call.py

import os
import openai
import traceback
from flask import session

def get_chatgpt_response(base_url, model_name, user_message):
    """
    Get a response from OpenAI's ChatCompletion API, storing
    the conversation in Flask session.

    :param base_url: The base URL for the OpenAI API
    :param model_name: The model name (e.g. "gpt-4" or "gpt-3.5-turbo")
    :param user_message: The user's message/input
    :return: A dict with either {"response": "..."} or {"error": "..."}
    """
    # Configure openai for the new API usage
    openai.api_base = base_url
    openai.api_key = os.environ.get("OPENAI_API_KEY")

    # Prepare or retrieve the chat history from session
    if 'chat_history' not in session:
        session['chat_history'] = []

    chat_history = session['chat_history']

    # Add the user's new message
    chat_history.append({"role": "user", "content": user_message})

    try:
        # Using openai.chat.completions.create(...) as per v1.0.0
        completion = openai.chat.completions.create(
            model=model_name,
            messages=chat_history
        )
        assistant_message = completion.choices[0].message.content

    except Exception as e:
        print("OpenAI API error:")
        print(traceback.format_exc())
        return {"error": str(e)}

    # Append the assistant's reply to the chat history
    chat_history.append({"role": "assistant", "content": assistant_message})
    session['chat_history'] = chat_history

    return {"response": assistant_message}