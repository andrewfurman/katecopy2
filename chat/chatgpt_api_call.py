# API Call to chatgpt should go here
# should be a python function where you input the message and model as separate attributues

# chatgpt_api_call.py
import traceback
from flask import session

def get_chatgpt_response(client, user_message, model):
    """
    Get a response from OpenAI's Chat API, storing the conversation in Flask session.
    """
    # Prepare or retrieve chat history from session
    if 'chat_history' not in session:
        session['chat_history'] = []

    chat_history = session['chat_history']
    # Add the user's new message
    chat_history.append({"role": "user", "content": user_message})

    try:
        completion = client.chat.completions.create(
            model=model,
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