export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    // Safety check
    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key missing" }),
      };
    }

    const { prompt } = JSON.parse(event.body);

    // Gemini request format
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 sec

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    const data = await response.json();
    console.log("Gemini RAW:", JSON.stringify(data));

    // Extract response text
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("Function Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
}
