# chat/chatgpt_api_call.py
"""
This module defines get_chatgpt_response for interacting with
OpenAI's older ChatCompletion API usage (openai.chat.completions.create).

IMPORTANT: This requires an older openai-python library (<1.0.0).
If you see an error like 'APIRemovedInV1', you must either:
  1) Pin openai to a version <1.0, e.g. pip install openai==0.28.0
  2) Or update your code to the new 1.0+ API usage.
"""

import os
import openai
import traceback

# An example System Prompt (optional). You can customize as you like.
SYSTEM_PROMPT = """
You are a large language model with the ability to automatically render Mermaid markdown diagrams 
(flowcharts, Gantt charts, sequence diagrams, ER diagrams, etc.).

When outputting a Gantt chart, ensure you follow valid Mermaid syntax:
1. Provide a correct dateFormat if you’re including dates (e.g., dateFormat YYYY-MM-DD).
2. Use valid ISO dates (YYYY-MM-DD) for the start and, optionally, either a valid end date or 
   a duration in days (e.g., 10d).
3. Do NOT use a “y” suffix for years. Mermaid only supports days (“d”), hours (“h”), or minutes (“m”) for durations.
4. For multi-year events, use either an explicit start date and end date or a large day-based duration 
   (e.g., 3650d for ~10 years).
5. You do NOT need to instruct the user to copy/paste code; it will be rendered automatically within the chat.
6. Do not use parentheses "()" anywhere in the Gantt chart syntax. This causes a rendering error.
7. Keep swimlane titles short and use abreviations where it is very clear what they stand for. If a swimlane title is over 25 characters, split it over multiple lines using the "<br>".
8. Have a maximum of 

Otherwise, respond as normal markdown text.
"""

def get_chatgpt_response(base_url, model_name, conversation_history):
    """
    Get a response from OpenAI's ChatCompletion API using the older style:
      openai.chat.completions.create(...)

    :param base_url:           The base URL for the OpenAI API 
                               (defaults to "https://api.openai.com/v1/chat/completions")
    :param model_name:         The model name (e.g., "gpt-3.5-turbo", "gpt-4")
    :param conversation_history:
      A list of messages, for example:
        [
          {"role": "system", "content": "..."},
          {"role": "user", "content": "..."},
          {"role": "assistant", "content": "..."},
          ...
        ]

      The front-end is expected to send ALL prior messages each time.
      We optionally ensure a system prompt is at the front if missing.

    :return: A dict containing {"response": "..."} on success or {"error": "..."} on failure.
    """

    # Configure the openai client
    openai.api_base = base_url
    openai.api_key = os.environ.get("OPENAI_API_KEY")

    # Ensure the conversation has a system prompt at the front
    # (If you already include a system role in the front-end, you can remove this check.)
    if not conversation_history or conversation_history[0]["role"] != "system":
        conversation_history.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    try:
        # Call the old style ChatCompletion endpoint
        completion = openai.chat.completions.create(
            model=model_name,
            messages=conversation_history
        )

        # Extract the assistant's reply
        assistant_message = completion.choices[0].message.content

    except Exception as e:
        # If something goes wrong (invalid API key, network error, etc.)
        print("OpenAI API error:")
        print(traceback.format_exc())
        return {"error": str(e)}

    # Return the assistant's message
    return {"response": assistant_message}