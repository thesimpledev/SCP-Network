import { aiCall } from "./scpai.js";
import { validateConversation } from "./validate.js";

const HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://securecontainprotect.network",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "POST,GET,OPTIONS"
};

const respond = (statusCode, body) => ({ statusCode, headers: HEADERS, body });

const parseBody = (event) => {
    try {
        return JSON.parse(event.body);
    } catch {
        return null;
    }
};

const handlePost = async (event, callModel) => {
    const validation = validateConversation(parseBody(event));
    if (!validation.ok) {
        console.warn("Rejected request:", validation.reason);
        return respond(400, JSON.stringify({ message: "Bad Request" }));
    }
    const aiResponse = await callModel({ conversation: validation.conversation }, event);
    return respond(200, aiResponse);
};

export const createHandler = ({ aiCall: callModel }) => async (event) => {
    try {
        if (event.httpMethod === "OPTIONS") {
            return respond(200, JSON.stringify({ message: "You can use POST, GET or OPTIONS" }));
        }
        if (event.httpMethod === "POST") {
            return await handlePost(event, callModel);
        }
        return respond(200, JSON.stringify({ message: "Unsupported Method" }));
    } catch (error) {
        console.error("Error processing request:", error);
        return respond(500, JSON.stringify({ message: "Internal Server Error" }));
    }
};

export const handler = createHandler({ aiCall });
