const SCPAI = require("./scpai");

exports.handler = async (event) => {
    console.log("--------------event-----------------");
    console.log(event);
    console.log("--------------end-----------------");
    const allowedOrigin = "https://securecontainprotect.network";
    const origin = event?.headers?.Origin || event?.headers?.origin; 

    const HEADERS = {
        "Content-Type": "application/json",
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
                "Access-Control-Allow-Credentials": true
    }

    
    try {    
        console.log("Allowed Origin:", allowedOrigin);
        console.log("Headers:", HEADERS);
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 200,
                headers:HEADERS,
                body: JSON.stringify({message: "You can use POST, GET or OPTIONS"})
            };
        } else if (event.httpMethod == "POST") {
            const aiResponse = await SCPAI.aiCall(JSON.parse(event.body));
            return {
                statusCode: 200,
                headers: HEADERS,
                body: aiResponse,
            };
        } else {
            return {
                statusCode: 200,
                headers: HEADERS,
                body: JSON.stringify({message: "Unsupported Method"})
            };
        }

        
        
        
    } catch (error) {
        console.error("Error processing request:", error);

        return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
