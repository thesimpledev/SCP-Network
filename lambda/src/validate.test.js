import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateConversation, MAX_MESSAGES, MAX_MESSAGE_LENGTH } from './validate.js';

const user = (message) => ({ type: 'user', message });
const assistant = (message) => ({ type: 'assistant', message });

test('accepts a valid conversation unchanged', () => {
    const conversation = [user('hello'), assistant('hi'), user('what is SCP-173?')];
    const result = validateConversation({ conversation });
    assert.deepEqual(result, { ok: true, conversation });
});

test('rejects a body that is not an object', () => {
    for (const body of [null, undefined, 'text', 42, []]) {
        assert.equal(validateConversation(body).ok, false, `body: ${JSON.stringify(body)}`);
    }
});

test('rejects a missing or non-array conversation', () => {
    assert.equal(validateConversation({}).ok, false);
    assert.equal(validateConversation({ conversation: 'hello' }).ok, false);
    assert.equal(validateConversation({ conversation: { type: 'user', message: 'x' } }).ok, false);
});

test('rejects an empty conversation', () => {
    assert.equal(validateConversation({ conversation: [] }).ok, false);
});

test('rejects more than the maximum number of messages', () => {
    const conversation = Array.from({ length: MAX_MESSAGES + 1 }, (_, i) =>
        i % 2 === 0 ? user('q') : assistant('a'));
    assert.equal(validateConversation({ conversation }).ok, false);
});

test('accepts exactly the maximum number of messages', () => {
    const conversation = Array.from({ length: MAX_MESSAGES }, (_, i) =>
        i % 2 === 0 ? assistant('a') : user('q'));
    assert.equal(validateConversation({ conversation }).ok, true);
});

test('rejects a message that is not a string or is empty', () => {
    assert.equal(validateConversation({ conversation: [user(42)] }).ok, false);
    assert.equal(validateConversation({ conversation: [user(null)] }).ok, false);
    assert.equal(validateConversation({ conversation: [user('')] }).ok, false);
    assert.equal(validateConversation({ conversation: [{ type: 'user' }] }).ok, false);
    assert.equal(validateConversation({ conversation: [null] }).ok, false);
});

test('rejects a message longer than the maximum length', () => {
    const tooLong = 'x'.repeat(MAX_MESSAGE_LENGTH + 1);
    assert.equal(validateConversation({ conversation: [user(tooLong)] }).ok, false);
    const justFits = 'x'.repeat(MAX_MESSAGE_LENGTH);
    assert.equal(validateConversation({ conversation: [user(justFits)] }).ok, true);
});

test('rejects a role other than user or assistant', () => {
    assert.equal(validateConversation({ conversation: [{ type: 'system', message: 'x' }] }).ok, false);
    assert.equal(validateConversation({ conversation: [{ type: 'server', message: 'x' }, user('q')] }).ok, false);
    assert.equal(validateConversation({ conversation: [{ message: 'x' }] }).ok, false);
});

test('rejects a conversation whose last message is not from the user', () => {
    assert.equal(validateConversation({ conversation: [user('q'), assistant('a')] }).ok, false);
});

test('a rejection carries a reason', () => {
    const result = validateConversation({ conversation: [] });
    assert.equal(result.ok, false);
    assert.equal(typeof result.reason, 'string');
    assert.ok(result.reason.length > 0);
});
