// Turns chat text into HTML for the terminal. Angle brackets are escaped
// first so neither a visitor nor the model can inject markup; Markdown
// still renders because marked treats the entities as plain text.
(function (global) {
    const escapeTags = (text) => String(text ?? '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    global.renderUserLine = (text) =>
        `<p>scp&gt; ${marked.parse(escapeTags(text)).replace(/<p>|<\/p>/g, '')}</p>`;

    global.renderAssistant = (markdown) => marked.parse(escapeTags(markdown));
})(window);
