// chat.js

const chatOutput = document.getElementById('chatOutput');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const sendBtnText = document.getElementById('sendBtnText');
const modelSelect = document.getElementById('model');

let recognition;
let finalTranscript = '';  // We'll store the "confirmed" speech here

// Check for SpeechRecognition support
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        // Go through each result
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptSegment = event.results[i][0].transcript;
            // If this chunk of speech is "final," accumulate it into finalTranscript
            if (event.results[i].isFinal) {
                finalTranscript += transcriptSegment;
            } else {
                // Otherwise, we consider it "interim" (partial) transcript
                interimTranscript += transcriptSegment;
            }
        }
        // Replace the userInput value with final + interim
        userInput.value = finalTranscript + interimTranscript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
    };

    // Optional: If you want to reset finalTranscript after each stop
    recognition.onend = () => {
        console.log('Speech recognition ended.');
        // Uncomment if you want to clear finalTranscript each time speech ends:
        // finalTranscript = '';
    };

} else {
    micBtn.disabled = true;
    micBtn.title = "Speech recognition not supported";
}

micBtn.addEventListener('click', () => {
    if (recognition) {
        // Toggle the microphone on/off
        if (micBtn.classList.contains('bg-red-500')) {
            recognition.stop();
            micBtn.classList.remove('bg-red-500');
            micBtn.classList.add('bg-gray-500');
        } else {
            recognition.start();
            micBtn.classList.remove('bg-gray-500');
            micBtn.classList.add('bg-red-500');
        }
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return; // Ignore empty

    // Reset finalTranscript after "send", so the next speech starts fresh
    finalTranscript = '';

    appendMessage('user', message);
    userInput.value = ''; // Clear input

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, model: modelSelect.value })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        appendMessage('assistant', data.response);
    } catch (error) {
        console.error('Error sending message:', error);
        appendMessage('assistant', 'Error communicating with the server.');
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

function appendMessage(role, text) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('mb-2', 'p-2', 'rounded', role === 'user' ? 'bg-blue-50' : 'bg-green-50');
    messageEl.innerHTML = `<span class="font-bold">${role === 'user' ? 'You' : 'ChatGPT'}:</span> ${text}`;
    chatOutput.appendChild(messageEl);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}