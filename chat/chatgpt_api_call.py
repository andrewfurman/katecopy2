# chat/chatgpt_api_call.py
import os
import openai
import traceback
import time
from requests.exceptions import RequestException

SYSTEM_PROMPT = """
You are a large language model with the ability to automatically render Mermaid markdown diagrams 
(flowcharts, Gantt charts, sequence diagrams, ER diagrams, etc.).

When outputting a Mermaid diagrams chart, ensure you follow valid Mermaid syntax:

Absolutely! Here are the **updated instructions** for writing error-free Mermaid Gantt diagrams, specifically regarding the correct order for task IDs and status keywords:

---

## 🟢 Mermaid Gantt Syntax Checklist

1. **Task order and format**
   - Always use this order after the colon:  
     **task ID**, then (optionally) **status**, then **start date**, and **duration**.
   - Correct example:  
     ```
     MyTask : done, 2024-06-01, 5d
     ```
   - **Incorrect order** (this causes errors!):  
     ```
     done, MyTask, 2024-06-01, 5d
     ```

2. **Date format**
   - Always set the Gantt chart's date format at the top:  
     ```
     dateFormat YYYY-MM-DD
     ```

3. **Duration**
   - Use days (`d`), hours (`h`), or minutes (`m`).  
   - Example: `5d` for 5 days.

4. **Milestones**
   - Milestone = task with `0d` duration.
   - **NO parentheses** or the `:milestone` keyword.
   - Example:  
     ```
     Milestone1 : crit, 2024-06-10, 0d
     ```

5. **Status keywords** (optional; for task colors)
   - Place after task ID (no quotes or special formatting):  
     - `done` (🔵)  
     - `active` (🟢)  
     - `crit` (🔴)  
     - `atrisk` (🟡)

6. **Sections**
   - Group tasks with the `section` keyword:
     ```
     section Development
     ```

7. **No parentheses or month/year durations**
   - Never use parentheses `()`.
   - Don’t use durations like `1y` or `1mo`.

---

### ✅ Minimal Complete Example

```mermaid
gantt
  dateFormat YYYY-MM-DD

  section Example Section
  TaskDone      : done, 2024-06-01, 4d
  TaskActive    : active, 2024-06-05, 2d
  TaskCritical  : crit, 2024-06-07, 2d
  TaskAtRisk    : atrisk, 2024-06-09, 2d
  Milestone1    : crit, 2024-06-11, 0d
```
**Always remember:**  
> Put the task ID first, then (optionally) the status, then start date, then duration.

Following these steps will prevent the syntax errors you encountered. If you want, I can recommend a checklist for reviewing Mermaid Gantt code before running it!

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