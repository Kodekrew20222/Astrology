export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key missing" }),
      };
    }

    const { prompt } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No prompt provided" }),
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ error: errText }),
      };
    }

    const data = await response.json();
    console.log("Gemini FULL:", JSON.stringify(data));

    let reply = "No response generated";

    try {
      if (data.candidates && data.candidates.length > 0) {
        const parts = data.candidates[0].content.parts;
        if (parts) {
          reply = parts.map(p => p.text || "").join(" ").trim();
        }
      }

      if (!reply) {
        reply = "No meaningful response";
      }
    } catch (e) {
      reply = "Error reading response";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };

  } catch (error) {
    if (error.name === "AbortError") {
      return {
        statusCode: 408,
        body: JSON.stringify({ error: "Request timeout" }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
}