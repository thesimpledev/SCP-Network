import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./render.js', import.meta.url), 'utf8');

// Loads render.js the way a browser would: a plain script that attaches
// its functions to window and finds marked as a global.
const load = () => {
    const parsed = [];
    const window = {};
    const marked = { parse: (md) => { parsed.push(md); return `<p>${md}</p>`; } };
    vm.runInNewContext(source, { window, marked });
    return { ...window, parsed };
};

test('renderUserLine shows HTML tags as text', () => {
    const { renderUserLine } = load();
    const html = renderUserLine('<img src=x onerror=alert(1)>');
    assert.equal(html.includes('<img'), false);
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('renderUserLine wraps the line in the scp prompt', () => {
    const { renderUserLine } = load();
    assert.equal(renderUserLine('hello'), '<p>scp&gt; hello</p>');
});

test('renderUserLine keeps Markdown', () => {
    const { renderUserLine, parsed } = load();
    renderUserLine('**bold** text');
    assert.deepEqual(parsed, ['**bold** text']);
});

test('renderAssistant shows HTML tags as text', () => {
    const { renderAssistant } = load();
    const html = renderAssistant('Sure. <script>steal()</script>');
    assert.equal(html.includes('<script>'), false);
    assert.ok(html.includes('&lt;script&gt;steal()&lt;/script&gt;'));
});

test('renderAssistant keeps Markdown', () => {
    const { renderAssistant, parsed } = load();
    const html = renderAssistant('# Title\n\n**bold**');
    assert.deepEqual(parsed, ['# Title\n\n**bold**']);
    assert.equal(html, '<p># Title\n\n**bold**</p>');
});

test('renderAssistant accepts a non-string reply without throwing', () => {
    const { renderAssistant } = load();
    assert.equal(typeof renderAssistant(undefined), 'string');
    assert.equal(typeof renderAssistant(null), 'string');
});
