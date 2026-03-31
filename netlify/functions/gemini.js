// ================== NETLIFY FUNCTION ==================
export async function handler(event) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;

        // Check API key
        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "API key missing"
                })
            };
        }

        // Parse request body
        const { prompt } = JSON.parse(event.body || "{}");

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Prompt is required"
                })
            };
        }

        // ================== GEMINI REQUEST ==================
        const requestBody = {
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
        };

        console.log("📡 Sending request to Gemini...");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            }
        );

        console.log("📥 Gemini status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Gemini API Error:", errorText);

            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: "Gemini API error",
                    details: errorText
                })
            };
        }

        const data = await response.json();
        console.log("📦 Gemini RAW:", JSON.stringify(data));

        // ================== EXTRACT RESPONSE ==================
        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response generated";

        // ================== RESPONSE ==================
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ reply }) // frontend expects this
        };

    } catch (error) {
        console.error("❌ Function Error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Internal server error",
                details: error.message
            })
        };
    }
}