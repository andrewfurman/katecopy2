// web_speech_api.js
// --------------------------------------------------
// This file contains all the logic needed to enable
// starting/stopping voice transcription via Web Speech API
// --------------------------------------------------

// Grab references to needed DOM elements
const userInput = document.getElementById('userInput');
const micBtn = document.getElementById('micBtn');

// We'll keep track of speech recognition globally in this file
let recognition = null;
let finalTranscript = '';

// Check if SpeechRecognition is supported
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    // --------------------------------------------------
    // Initialize speech recognition
    // --------------------------------------------------
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // --------------------------------------------------
    // Event fired when we get results from the microphone
    // --------------------------------------------------
    recognition.onresult = (event) => {
        let interimTranscript = '';

        // Loop through each speech recognition result
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptSegment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                // This chunk is "final"
                finalTranscript += transcriptSegment;
            } else {
                // Otherwise, it's an "interim" (partial) transcript
                interimTranscript += transcriptSegment;
            }
        }
        // Update the user input field with final + interim text
        userInput.value = finalTranscript + interimTranscript;
    };

    // --------------------------------------------------
    // Event fired if there's an error
    // --------------------------------------------------
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event);
    };

    // --------------------------------------------------
    // Event fired when speech recognition ends
    // (e.g. user stops talking or mic button toggled)
    // --------------------------------------------------
    recognition.onend = () => {
        console.log('Speech recognition ended.');
        // Optionally reset finalTranscript here if desired
        // finalTranscript = '';
    };
} else {
    // --------------------------------------------------
    // SpeechRecognition is not supported
    // --------------------------------------------------
    micBtn.disabled = true;
    micBtn.title = "Speech recognition not supported in this browser";
}

// --------------------------------------------------
// Function to reset the finalTranscript externally
// --------------------------------------------------
function resetTranscript() {
    finalTranscript = '';
}

// Expose the reset function to other scripts
window.resetTranscript = resetTranscript;

// --------------------------------------------------
// Toggle the microphone on/off when micBtn is clicked
// --------------------------------------------------
micBtn.addEventListener('click', () => {
    if (!recognition) return; // If no speech API support, do nothing

    // If mic is currently "on", stop recognition
    if (micBtn.classList.contains('bg-red-500')) {
        recognition.stop();
        micBtn.classList.remove('bg-red-500');
        micBtn.classList.add('bg-gray-500');
    } 
    // Otherwise, start recognition
    else {
        recognition.start();
        micBtn.classList.remove('bg-gray-500');
        micBtn.classList.add('bg-red-500');
    }
});