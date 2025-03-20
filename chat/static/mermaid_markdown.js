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
    // Make sure Mermaid is loaded (via the CDN in chat.html)
    // Then initialize any Mermaid code blocks found inside `container`.
    mermaid.init(undefined, container.querySelectorAll('.language-mermaid'));
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