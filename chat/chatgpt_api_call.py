# chat/chatgpt_api_call.py

"""
This module defines a function `get_chatgpt_response` for interacting with
OpenAI's ChatCompletion API. The conversation history is persisted in the
Flask session, allowing continuity across multiple user messages.
"""

import os
import openai
import traceback
from flask import session

# The System Prompt to be added to the conversation
SYSTEM_PROMPT = """
You are a large language model with the ability to automatically render Mermaid markdown diagrams 
(flowcharts, Gantt charts, sequence diagrams, ER diagrams, etc.).

When outputting a Gantt chart, ensure you follow valid Mermaid syntax: 
1. Provide a correct dateFormat if you’re including dates (e.g., dateFormat YYYY-MM-DD).
2. Use valid ISO dates (YYYY-MM-DD) for the start and, optionally, either a valid end date or a duration in days (e.g., 10d).
3. Do NOT use a “y” suffix for years. Mermaid only supports days (“d”), hours (“h”), or minutes (“m”) for durations.
4. For multi-year events, use either an explicit start date and end date or a large day-based duration (e.g., 3650d for ~10 years).
5. You do NOT need to instruct the user to copy/paste code; it will be rendered automatically within the chat.

Otherwise, respond as normal markdown text.
"""

def get_chatgpt_response(base_url, model_name, user_message):
    """
    Get a response from OpenAI's ChatCompletion API, storing
    the conversation in the Flask session.

    :param base_url:    The base URL for the OpenAI API
    :param model_name:  The model name (e.g. "gpt-4" or "gpt-3.5-turbo")
    :param user_message: The user's message/input

    :return: A dict containing either {"response": "..."} on success
             or {"error": "..."} on failure.

    Overview of Steps:
    ------------------
    1. Configure openai for the new API usage (base URL + API key).
    2. Initialize or retrieve the conversation history (session['chat_history']).
    3. Ensure the system prompt is at the beginning of the conversation.
    4. Add the user's message to the history.
    5. Call OpenAI's ChatCompletion endpoint to generate a response.
    6. Add the assistant's message to the history.
    7. Return the assistant's message or an error.
    """

    # 1. Configure the openai client
    openai.api_base = base_url
    openai.api_key = os.environ.get("OPENAI_API_KEY")

    # 2. Initialize the conversation in session if not present
    if "chat_history" not in session:
        session["chat_history"] = []

    chat_history = session["chat_history"]

    # 3. Ensure the system prompt is at the start of conversation
    #    If there's no message yet or if the first message is not system role,
    #    prepend the system message.
    if not chat_history or chat_history[0]["role"] != "system":
        chat_history.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    # 4. Add the user's new message to the conversation
    chat_history.append({"role": "user", "content": user_message})

    try:
        # 5. Call OpenAI's ChatCompletion endpoint
        #    openai.chat.completions.create(...) syntax for the new API
        completion = openai.chat.completions.create(
            model=model_name,
            messages=chat_history
        )
        assistant_message = completion.choices[0].message.content

    except Exception as e:
        # Capture any exceptions (e.g. network issues, invalid API keys, etc.)
        print("OpenAI API error:")
        print(traceback.format_exc())
        return {"error": str(e)}

    # 6. Add the assistant's reply to the chat history
    chat_history.append({"role": "assistant", "content": assistant_message})
    session["chat_history"] = chat_history

    # 7. Return the response dictionary
    return {"response": assistant_message}