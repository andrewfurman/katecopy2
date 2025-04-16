
// loading_animation.js

function showLoadingMessage() {
    const messageEl = document.createElement('div');
    messageEl.classList.add('loading-message');
    messageEl.innerHTML = `
        <span class="font-bold">ChatGPT<span class="loading-dots"></span></span>
        <div class="mt-2 h-4 bg-gray-200 rounded"></div>
        <div class="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
    `;
    messageEl.id = 'loading-message';
    document.getElementById('chatOutput').appendChild(messageEl);
    document.getElementById('chatOutput').scrollTop = document.getElementById('chatOutput').scrollHeight;
}

function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

window.showLoadingMessage = showLoadingMessage;
window.removeLoadingMessage = removeLoadingMessage;
