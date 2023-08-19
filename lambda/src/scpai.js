import OpenAI from 'openai';
const {getSecret} = require('./util');

const aiCall = async (body) => {
    let aikey = await getSecret('openaikey');

    let prompt = body.command;
    const openai = new OpenAI({
        apiKey:aikey, 
      });
      


    const completion  =  await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: "You are an AI for the SCP Foundation. You are tasked with answering questions about SCPs and other Foundation-related topics. Use Markdown to formnat all of your responses. please"},
            {role: "user", content: prompt}
        ],
    });
    console.log("completion")
    console.log(completion.choices[0].message.content)
    responseMessage = completion.choices[0].message.content;
    response = JSON.stringify({message: responseMessage});
    return response;
};

module.exports = { aiCall };
