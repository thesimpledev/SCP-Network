import OpenAI from 'openai';
const {getSecret} = require('./util');

const aiCall = async (body) => {
    let aikey = await getSecret('openaikey');
    const openai = new OpenAI({
        apiKey: aikey,
    });

    // Initialize the messages array with the system message
    let messages = [
        {
            role: "system",
            content: `You are an AI for the SCP Foundation. 
                      You are tasked with assisting Foundation personnel with their duties,
                      questions about SCPs and other Foundation-related topics. 
                      The user has O5 clearance.
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
        model: "gpt-3.5-turbo-16k",
        messages: messages
    });

    console.log("completion");
    console.log(completion.choices[0].message.content);
    const responseMessage = completion.choices[0].message.content;
    const response = JSON.stringify({ message: responseMessage });
    return response;
};



module.exports = { aiCall };
