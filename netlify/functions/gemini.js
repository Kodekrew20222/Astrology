export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    // ✅ Handle GET (for browser testing)
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Function running ✅" }),
      };
    }

    // ✅ Parse request safely
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Empty body" }),
      };
    }

    const { prompt } = JSON.parse(event.body);

    console.log("📩 PROMPT:", prompt);

    // ✅ Correct request body for Gemini
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    // ✅ Try Gemini 3 first, fallback to 1.5
    async function callModel(model) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await res.json();
      console.log(`🔍 ${model} response:`, JSON.stringify(data));
      return data;
    }

    let data = await callModel("gemini-3-flash");

    // 🔁 Fallback if Gemini 3 fails
    if (!data.candidates || data.candidates.length === 0) {
      console.log("⚠️ Gemini 3 failed → fallback to 1.5");
      data = await callModel("gemini-1.5-flash");
    }

    // ✅ Extract reply safely
    let reply = "No response generated";

    if (data.candidates?.length) {
      const parts = data.candidates[0]?.content?.parts;
      if (parts?.length) {
        reply = parts.map(p => p.text || "").join(" ");
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };

  } catch (error) {
    console.error("❌ Function Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
}