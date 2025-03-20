// chat.js

const chatOutput = document.getElementById('chatOutput');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const sendBtnText = document.getElementById('sendBtnText');
const modelSelect = document.getElementById('model');

let waitingTimer = null;
let waitingCount = 0;

/**
 * Configure Mermaid. We set startOnLoad = false because we will
 * explicitly call mermaid.init() after inserting content.
 */
mermaid.initialize({
  startOnLoad: false,
  theme: 'default', // or 'dark', etc.
});

/**
 * Configure Marked so that it adds "language-..." classes to <code> blocks.
 */
marked.setOptions({
  langPrefix: 'language-',
});

/**
 * Start showing an indicator (spinner + seconds) inside the send button,
 * and begin counting seconds.
 */
function startWaitingIndicator() {
  waitingCount = 0;
  // Disable the button so user cannot click repeatedly
  sendBtn.disabled = true;
  // Immediately show spinner + "00"
  updateSendBtnText(waitingCount);

  // Every second, increment and update the displayed time
  waitingTimer = setInterval(() => {
    waitingCount += 1;
    updateSendBtnText(waitingCount);
  }, 1000);
}

/**
 * Stop the indicator and revert the button to its normal arrow.
 */
function stopWaitingIndicator() {
  sendBtn.disabled = false;
  if (waitingTimer) {
    clearInterval(waitingTimer);
    waitingTimer = null;
  }
  // Restore the button text to just an arrow
  sendBtnText.innerHTML = '&rarr;';
}

/**
 * Update the send button to show a spinner and a two-digit second count.
 * For example: "spinner 07"
 */
function updateSendBtnText(seconds) {
  const secsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
  // Example spinner with Tailwind classes (blue top border, transparent on other sides)
  sendBtnText.innerHTML = `
    <div 
      class="inline-block w-4 h-4 border-2 rounded-full mr-1
             animate-spin
             border-gray-200 
             border-t-blue-500 
             border-l-transparent border-r-transparent border-b-transparent">
    </div>
    ${secsStr}
  `;
}

/**
 * Copy HTML content to clipboard (including bold, headings, etc.).
 * Uses the ClipboardItem API if available, otherwise falls back to plain text.
 */
async function copyHTML(htmlContent) {
  if (navigator.clipboard && window.ClipboardItem) {
    try {
      // Construct items for both plain text and HTML
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([htmlContent], { type: 'text/plain' })
        })
      ]);
    } catch (err) {
      console.error('Copy failed', err);
      alert('Failed to copy.');
    }
  } else {
    // Simple fallback: copy plain text
    navigator.clipboard.writeText(htmlContent).then(() => {
      alert('Copied to clipboard (as plain text)!');
    }, err => {
      console.error('Fallback copy failed', err);
      alert('Failed to copy.');
    });
  }
}

/**
 * Append messages to the chat display.
 * role = 'user' | 'assistant'
 * text = raw string (for user) or Markdown string (for ChatGPT).
 */
function appendMessage(role, text) {
  if (role === 'user') {
    // Plain text user message
    const messageEl = document.createElement('div');
    messageEl.classList.add('mb-2', 'p-2', 'rounded', 'bg-blue-50');
    messageEl.innerHTML = `
      <span class="font-bold text-blue-600">You:</span>
      <span>${text}</span>
    `;
    chatOutput.appendChild(messageEl);

  } else {
    // Assistant message: parse with Marked for HTML
    const htmlContent = marked.parse(text);

    // Container with group-hover for copy button
    const container = document.createElement('div');
    container.classList.add('relative', 'group', 'mb-2', 'p-2', 'rounded', 'bg-green-50');

    container.innerHTML = `
      <span class="font-bold text-green-600">ChatGPT:</span>
      <div class="assistant-content">${htmlContent}</div>
      <button 
        class="hidden group-hover:block absolute top-2 right-2 bg-gray-200 text-sm px-2 py-1 rounded copyBtn"
        title="Copy HTML"
      >
        Copy
      </button>
    `;

    // Attach copy logic to the button
    const copyBtn = container.querySelector('.copyBtn');
    copyBtn.addEventListener('click', () => {
      copyHTML(htmlContent);
    });

    // Insert into DOM so we can manipulate it
    chatOutput.appendChild(container);

    // Find any <code class="language-mermaid"> blocks and transform them into Mermaid diagrams
    const mermaidCodeBlocks = container.querySelectorAll('code.language-mermaid');
    mermaidCodeBlocks.forEach((block) => {
      // Extract the mermaid source code
      const mermaidSource = block.textContent;

      // Create a div with class="mermaid" to let Mermaid process it
      const mermaidDiv = document.createElement('div');
      mermaidDiv.classList.add('mermaid');
      // Set the textContent (the raw mermaid code)
      mermaidDiv.textContent = mermaidSource;

      // Replace the entire <pre><code> with this <div>
      block.parentElement.replaceWith(mermaidDiv);
    });

    // Now that all mermaid blocks are replaced with <div class="mermaid">, run Mermaid
    mermaid.init(undefined, container.querySelectorAll('.mermaid'));
  }

  // Auto-scroll to bottom
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

/**
 * Send the message to the Flask backend (which sends it to ChatGPT).
 */
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;  // ignore empty

  // Display user message in chat
  appendMessage('user', message);
  userInput.value = ''; // clear input

  // Start "waiting" animation inside the button
  startWaitingIndicator();

  const model = modelSelect.value;

  try {
    // Make POST request to our Flask backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, model })
    });

    // Stop waiting indicator once we get *any* response
    stopWaitingIndicator();

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    appendMessage('assistant', data.response);

  } catch (error) {
    console.error('Error sending message:', error);
    appendMessage('assistant', 'Sorry, there was an error. Check console.');
  }
}

// Send on button click
sendBtn.addEventListener('click', sendMessage);

// Also allow pressing Enter
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();  // optional: prevents newline in input
    sendMessage();
  }
});