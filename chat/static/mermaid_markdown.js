// mermaid_markdown.js
// --------------------------------------------------
// This file provides helpers to convert a text string
// (possibly containing Markdown and Mermaid code blocks)
// into HTML, and then initialize Mermaid diagrams.
// --------------------------------------------------

// Convert raw markdown text into HTML using Marked.js
// and then return the HTML string
function convertMarkdownToHtml(text) {
    // Use the 'marked' library loaded in chat.html via CDN
    return marked.parse(text);
}

// Initialize/Render Mermaid diagrams inside the given container
function renderMermaidDiagrams(container) {
    const mermaidBlocks = container.querySelectorAll('.language-mermaid');
    mermaidBlocks.forEach((block) => {
        try {
            // Try to parse the diagram first to catch syntax errors
            const diagram = block.textContent;
            const result = mermaid.parse(diagram);
            mermaid.init(undefined, block);
        } catch (error) {
            // Get detailed parse error info if available
            const parseError = mermaid.parseError;
            const errorDetails = parseError ? {
                message: parseError.message,
                hash: parseError.hash,
                line: parseError.hash?.line,
                expected: parseError.hash?.expected?.join(', '),
                token: parseError.hash?.token
            } : null;

            // Create error message element with detailed error info
            const errorDiv = document.createElement('div');
            errorDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-2 mb-2';
            
            // Split diagram into lines to highlight the error
            const lines = diagram.split('\n');
            const errorLine = errorDetails?.line || 0;
            
            errorDiv.innerHTML = `
                <p class="font-bold">Mermaid Syntax Error</p>
                <p class="text-sm">Error details: ${error.message}</p>
                ${errorDetails ? `
                    <p class="text-sm">Line number: ${errorDetails.line}</p>
                    ${errorDetails.expected ? `<p class="text-sm">Expected: ${errorDetails.expected}</p>` : ''}
                    ${errorDetails.token ? `<p class="text-sm">Found: ${errorDetails.token}</p>` : ''}
                ` : ''}
                <p class="text-sm font-bold mt-2">Diagram code:</p>
                <pre class="text-xs mt-2 overflow-x-auto bg-gray-100 p-2">${lines.map((line, i) => 
                    `<div class="${i + 1 === errorLine ? 'bg-red-200' : ''}">${i + 1}: ${line}</div>`
                ).join('\n')}</pre>
            `;
            // Insert error message after the mermaid block
            block.parentNode.insertBefore(errorDiv, block.nextSibling);
        }
    });
}

// A convenience function that returns HTML for markdown
// and then triggers mermaid rendering once the HTML is placed.
function renderMermaidMarkdown(text, container) {
    // Convert markdown to HTML
    const html = convertMarkdownToHtml(text);

    // Place HTML into container (caller can do it too, up to you)
    container.innerHTML = html;

    // Now find Mermaid blocks and render them
    renderMermaidDiagrams(container);
}

// Expose these functions to other scripts
window.convertMarkdownToHtml = convertMarkdownToHtml;
window.renderMermaidDiagrams = renderMermaidDiagrams;
window.renderMermaidMarkdown = renderMermaidMarkdown;