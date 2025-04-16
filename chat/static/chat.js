// chat.js
// --------------------------------------------------
// This file controls the client-side chat functionality:
//   1) Maintains an in-memory conversationHistory array.
//   2) Sends the entire conversation to the server each time.
//   3) Displays user and assistant messages in the UI.
// --------------------------------------------------

// --------------------------------------------------
// Select DOM elements
// --------------------------------------------------
const chatOutput = document.getElementById('chatOutput');
const userInputField = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modelSelect = document.getElementById('model');

// The conversation array, stored client-side
// Each entry: { role: "user"|"assistant"|"system", content: "..." }
let conversationHistory = [];

// Optional: If you want a default system prompt, you can push it here
// Or you can rely on the server to insert a system prompt if missing.
// conversationHistory.push({
//   role: "system",
//   content: "You are a large language model with ability to render Mermaid."
// });

// --------------------------------------------------
// Send message logic
// --------------------------------------------------
async function sendMessage() {
    const message = userInputField.value.trim();
    if (!message) return; // don't send empty lines

    // Add the user's new message to local conversation
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Append user message to the UI
    appendMessage('user', message);

    // Clear the input field
    userInputField.value = '';

    // Show loading animation
    showLoadingMessage();

    try {
        // POST to /api/chat with the entire conversation
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: conversationHistory,
                model: modelSelect.value
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        // JSON structure: { "response": "...assistant text...", "error": "...?" }
        const data = await response.json();

        // If there's an error, handle it
        if (data.response && data.response.startsWith("Error")) {
            throw new Error(data.response);
        }

        // The assistant's latest reply
        const assistantReply = data.response || "(No response)";

        // Add assistant reply to local conversation
        conversationHistory.push({
            role: 'assistant',
            content: assistantReply
        });

        // Remove loading animation and display the response
        removeLoadingMessage();
        appendMessage('assistant', assistantReply);

    } catch (error) {
        console.error('Error sending message:', error);
        let errorMessage = 'An error occurred while communicating with ChatGPT. ';
        
        // Add specific error details
        if (error.message) {
            errorMessage += `\n\nError details: ${error.message}`;
        }
        
        // Add common troubleshooting tips
        errorMessage += `\n\nPossible causes:
• The API key may be invalid or expired
• The server may be experiencing high load
• The connection may have timed out
• The model may be temporarily unavailable

Try sending your message again in a few moments.`;
        
        removeLoadingMessage();
        appendMessage('assistant', errorMessage);
    }
}

// --------------------------------------------------
// Send button click event
// --------------------------------------------------
sendBtn.addEventListener('click', () => {
    sendMessage();
});

// --------------------------------------------------
// "Enter" key event in user input
// --------------------------------------------------
userInputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

// --------------------------------------------------
// Function to append a message to chatOutput
// --------------------------------------------------
function appendMessage(role, text) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('mb-2', 'p-2', 'rounded', 'relative');
    
    // Add error styling if the message contains error information
    if (text.includes('Error details:')) {
        messageEl.classList.add('error-message');
    }

    if (role === 'user') {
        messageEl.classList.add('bg-blue-50');
    } else {
        // For assistant
        messageEl.classList.add('bg-green-50', 'assistant-message');
    }

    // Label: user or ChatGPT
    const senderLabel = `<span class="font-bold">${role === 'user' ? 'You' : 'ChatGPT'}:</span> `;
    messageEl.innerHTML = senderLabel;

    // Add a container for the content
    const contentContainer = document.createElement('div');
    messageEl.appendChild(contentContainer);

    // Convert from Markdown to HTML, plus handle Mermaid
    renderMermaidMarkdown(text, contentContainer);

    // Optionally add a copy button for assistant messages
    if (role === 'assistant') {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copy';
        copyBtn.classList.add(
            'copy-button',
            'absolute',
            'top-2',
            'right-2',
            'bg-gray-300',
            'rounded',
            'text-sm',
            'px-3',
            'py-1',
            'cursor-pointer'
        );

        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text)
                .then(() => {
                    console.log('Text copied to clipboard:', text);
                })
                .catch(err => {
                    console.error('Error copying text:', err);
                });
        });

        messageEl.appendChild(copyBtn);
    }

    chatOutput.appendChild(messageEl);
    // scroll to bottom
    chatOutput.scrollTop = chatOutput.scrollHeight;
}