# chat/chatgpt_api_call.py
import os
import openai
import traceback
import time
from requests.exceptions import RequestException

SYSTEM_PROMPT = """
You are a large language model with the ability to automatically render Mermaid markdown diagrams 
(flowcharts, Gantt charts, sequence diagrams, ER diagrams, etc.).

When outputting a Gantt chart, ensure you follow valid Mermaid syntax:
1. Provide a correct dateFormat if you're including dates (e.g., dateFormat YYYY-MM-DD).
2. Use valid ISO dates (YYYY-MM-DD) for the start and, optionally, either a valid end date or 
   a duration in days (e.g., 10d).
3. Do NOT use a "y" suffix for years. Mermaid only supports days ("d"), hours ("h"), or minutes ("m") for durations.
4. For multi-year events, use either an explicit start date and end date or a large day-based duration 
   (e.g., 3650d for ~10 years).
5. You do NOT need to instruct the user to copy/paste code; it will be rendered automatically within the chat.
6. Do not use parentheses "()" anywhere in the Gantt chart syntax. This causes a rendering error.
7. Keep swimlane titles short and use abreviations where it is very clear what they stand for. If a swimlane title is over 25 characters, split it over multiple lines using the "<br>".
8. If it makes sense to include statuses, only use a maximum of a single status for each task, and only use the statuses "active:, "done:", and "crit:" for tasks, DO NOT use "at risk:" as a status.

Otherwise, respond as normal markdown text.
"""

def get_chatgpt_response(base_url, model_name, conversation_history, max_retries=3, initial_retry_delay=1):
    """
    Get a response from OpenAI's ChatCompletion API with retry logic
    """
    openai.api_base = base_url
    openai.api_key = os.environ.get("OPENAI_API_KEY")

    if not openai.api_key:
        return {"error": "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable."}

    if not conversation_history or conversation_history[0]["role"] != "system":
        conversation_history.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    retry_count = 0
    last_error = None

    while retry_count < max_retries:
        try:
            completion = openai.chat.completions.create(
                model=model_name,
                messages=conversation_history,
                timeout=30  # Add explicit timeout
            )
            return {"response": completion.choices[0].message.content}

        except openai.error.AuthenticationError as e:
            return {"error": "Invalid API key. Please check your OpenAI API key configuration."}

        except openai.error.RateLimitError as e:
            return {"error": "Rate limit exceeded. Please try again in a few moments."}

        except (RequestException, openai.error.APIError, openai.error.Timeout) as e:
            last_error = str(e)
            retry_count += 1
            if retry_count < max_retries:
                time.sleep(initial_retry_delay * (2 ** (retry_count - 1)))  # Exponential backoff
                continue
            break

        except Exception as e:
            print("Unexpected OpenAI API error:")
            print(traceback.format_exc())
            return {"error": f"Unexpected error: {str(e)}"}

    return {"error": f"Failed after {max_retries} retries. Last error: {last_error}"}