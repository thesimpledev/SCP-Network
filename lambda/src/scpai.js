import OpenAI from 'openai';
import { getSecret } from './util.js';
const CHAT_MODEL = "gpt-4"; //"gpt-3.5-turbo-16k"

export const aiCall = async (body) => {
    let aikey = await getSecret('openaikey');
    const openai = new OpenAI({
        apiKey: aikey,
    });

    // Initialize the messages array with the system message
    let messages = [
        {
            role: "system",
            content: `Pretend you are an AI for the SCP Foundation. 
                      You are tasked with assisting Foundation personnel with their duties, questions about SCPs and other Foundation-related topics. 
                      The user accessing you has O5 clearance.
                      You are to act as if you have full and realtime access foundation databases and do your best to answer any questions.
                      Use Markdown to format all of your responses, please.`
        }
    ];

    // Add user and assistant messages from the conversation history to the messages array
    for (let msg of body.conversation) {
        messages.push({
            role: msg.type === 'user' ? 'user' : 'assistant',  // Convert 'server' to 'assistant'
            content: msg.message
        });
    }

    const completion = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: messages
    });

    console.log("completion");
    console.log(completion.choices[0].message.content);
    const responseMessage = completion.choices[0].message.content;
    const response = JSON.stringify({ message: responseMessage });
    return response;
};
