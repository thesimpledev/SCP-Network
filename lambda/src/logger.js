import { createClient } from '@libsql/client/web';

let client;

const getClient = () => {
    if (!client) {
        client = createClient({
            url: process.env.TURSO_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    }
    return client;
};

// Logs one chat exchange to Turso. Never throws — a logging failure
// must not break the chat response.
export const logChat = async ({ event, body, model, responseMessage, usage }) => {
    try {
        if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
            console.error('Turso logging skipped: TURSO_URL / TURSO_AUTH_TOKEN not set');
            return;
        }
        const db = getClient();
        const conversation = body?.conversation ?? [];
        const lastUserMessage = [...conversation].reverse().find((m) => m.type === 'user');

        await db.execute({
            sql: `INSERT INTO chat_logs
                    (source_ip, user_agent, model, turn_count, user_message,
                     ai_response, conversation_json, prompt_tokens, completion_tokens, total_tokens)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                event?.requestContext?.identity?.sourceIp ?? null,
                event?.headers?.['User-Agent'] ?? event?.headers?.['user-agent'] ?? null,
                model,
                conversation.length,
                lastUserMessage?.message ?? null,
                responseMessage,
                JSON.stringify(conversation),
                usage?.prompt_tokens ?? null,
                usage?.completion_tokens ?? null,
                usage?.total_tokens ?? null,
            ],
        });
    } catch (error) {
        console.error('Failed to log chat to Turso:', error);
    }
};
