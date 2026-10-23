export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_LENGTH = 2000;

const ROLES = new Set(['user', 'assistant']);

const reject = (reason) => ({ ok: false, reason });

const messageProblem = (msg, index) => {
    if (msg === null || typeof msg !== 'object') {
        return `message ${index} is not an object`;
    }
    if (!ROLES.has(msg.type)) {
        return `message ${index} has an unknown type`;
    }
    if (typeof msg.message !== 'string' || msg.message.length === 0) {
        return `message ${index} is empty or not a string`;
    }
    if (msg.message.length > MAX_MESSAGE_LENGTH) {
        return `message ${index} exceeds ${MAX_MESSAGE_LENGTH} characters`;
    }
    return null;
};

export const validateConversation = (body) => {
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
        return reject('body is not an object');
    }
    const { conversation } = body;
    if (!Array.isArray(conversation)) {
        return reject('conversation is not an array');
    }
    if (conversation.length === 0) {
        return reject('conversation is empty');
    }
    if (conversation.length > MAX_MESSAGES) {
        return reject(`conversation exceeds ${MAX_MESSAGES} messages`);
    }
    for (let i = 0; i < conversation.length; i++) {
        const problem = messageProblem(conversation[i], i);
        if (problem) {
            return reject(problem);
        }
    }
    if (conversation[conversation.length - 1].type !== 'user') {
        return reject('last message is not from the user');
    }
    return { ok: true, conversation };
};
