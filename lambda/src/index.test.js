import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from './index.js';

const validBody = { conversation: [{ type: 'user', message: 'hello' }] };

const stubAiCall = () => {
    const calls = [];
    const aiCall = async (body, event) => {
        calls.push({ body, event });
        return JSON.stringify({ message: 'reply' });
    };
    return { aiCall, calls };
};

const post = (body) => ({ httpMethod: 'POST', body });

test('OPTIONS returns 200 with CORS headers and never calls the model', async () => {
    const { aiCall, calls } = stubAiCall();
    const response = await createHandler({ aiCall })({ httpMethod: 'OPTIONS' });
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['Access-Control-Allow-Origin'], 'https://securecontainprotect.network');
    assert.equal(calls.length, 0);
});

test('response headers do not allow credentials', async () => {
    const { aiCall } = stubAiCall();
    const response = await createHandler({ aiCall })({ httpMethod: 'OPTIONS' });
    assert.equal('Access-Control-Allow-Credentials' in response.headers, false);
});

test('POST with a valid body passes the validated conversation to the model', async () => {
    const { aiCall, calls } = stubAiCall();
    const event = post(JSON.stringify(validBody));
    const response = await createHandler({ aiCall })(event);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { message: 'reply' });
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].body, validBody);
    assert.equal(calls[0].event, event);
});

test('POST with an invalid conversation returns 400 and never calls the model', async () => {
    const { aiCall, calls } = stubAiCall();
    const tooMany = { conversation: Array(25).fill({ type: 'user', message: 'x' }) };
    const response = await createHandler({ aiCall })(post(JSON.stringify(tooMany)));
    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), { message: 'Bad Request' });
    assert.equal(calls.length, 0);
});

test('POST with a body that is not JSON returns 400', async () => {
    const { aiCall, calls } = stubAiCall();
    const response = await createHandler({ aiCall })(post('not json'));
    assert.equal(response.statusCode, 400);
    assert.equal(calls.length, 0);
});

test('POST with no body returns 400', async () => {
    const { aiCall, calls } = stubAiCall();
    const response = await createHandler({ aiCall })({ httpMethod: 'POST' });
    assert.equal(response.statusCode, 400);
    assert.equal(calls.length, 0);
});

test('a failing model call returns 500 without leaking the error', async () => {
    const aiCall = async () => { throw new Error('upstream exploded'); };
    const response = await createHandler({ aiCall })(post(JSON.stringify(validBody)));
    assert.equal(response.statusCode, 500);
    assert.deepEqual(JSON.parse(response.body), { message: 'Internal Server Error' });
});

test('other methods return an unsupported-method message', async () => {
    const { aiCall, calls } = stubAiCall();
    const response = await createHandler({ aiCall })({ httpMethod: 'GET' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { message: 'Unsupported Method' });
    assert.equal(calls.length, 0);
});
