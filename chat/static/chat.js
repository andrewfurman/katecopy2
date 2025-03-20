// chat.js
// --------------------------------------------------
// This file contains the main chat functionality:
// - Capturing user input
// - Sending messages to the server
// - Appending chat responses
// - Handling "Enter" key to send
// --------------------------------------------------

// --------------------------------------------------
// Grab references to DOM elements we need
// --------------------------------------------------
const chatOutput = document.getElementById('chatOutput');
const userInputField = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modelSelect = document.getElementById('model');

// --------------------------------------------------
// Send message to the server and handle response
// --------------------------------------------------
async function sendMessage() {
    const message = userInputField.value.trim();
    if (!message) return; // Ignore empty input

    // Reset the Web Speech API transcript (if the function is available)
    if (typeof resetTranscript === 'function') {
        resetTranscript();
    }

    // Append your own (user) message to the chat
    appendMessage('user', message);

    // Clear the user input
    userInputField.value = '';

    try {
        // Send to the Flask endpoint
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, model: modelSelect.value })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        // Get JSON data
        const data = await response.json();
        // Append the assistant's reply
        appendMessage('assistant', data.response);

    } catch (error) {
        console.error('Error sending message:', error);
        appendMessage('assistant', 'Error communicating with the server.');
    }
}

// --------------------------------------------------
// Event listener for the "Send" button click
// --------------------------------------------------
sendBtn.addEventListener('click', () => {
    sendMessage();
});

// --------------------------------------------------
// Event listener for "Enter" key in user input
// --------------------------------------------------
userInputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

// --------------------------------------------------
// Append a message to the chatOutput
// --------------------------------------------------
function appendMessage(role, text) {
    const messageEl = document.createElement('div');
    // Use 'relative' to position copy button absolutely if needed
    messageEl.classList.add('mb-2', 'p-2', 'rounded', 'relative');

    // Add background color and additional classes based on role
    if (role === 'user') {
        messageEl.classList.add('bg-blue-50');
    } else {
        // For the assistant
        messageEl.classList.add('bg-green-50', 'assistant-message');
    }

    // Build a small "label" for the speaker
    const senderLabel = `<span class="font-bold">${role === 'user' ? 'You' : 'ChatGPT'}:</span> `;

    // Insert the label, then convert the text from Markdown -> HTML
    messageEl.innerHTML = senderLabel;

    // Create a container to hold the rendered markdown
    const contentContainer = document.createElement('div');
    messageEl.appendChild(contentContainer);

    // Render the markdown (and mermaid) in contentContainer
    renderMermaidMarkdown(text, contentContainer);

    // Only add a copy button for messages from the assistant
    if (role === 'assistant') {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋'; // Clipboard emoji
        copyBtn.classList.add(
            'copy-button',
            'absolute',
            'top-1',
            'right-1',
            'bg-gray-300',
            'rounded',
            'text-sm',
            'px-2',
            'py-1'
        );

        // Copy raw text to clipboard on click
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent parent click events
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

    // Add the entire message element to the chat output
    chatOutput.appendChild(messageEl);

    // Keep chat scrolled to the bottom
    chatOutput.scrollTop = chatOutput.scrollHeight;
}