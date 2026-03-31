export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    console.log("✅ Function triggered");

    const body = JSON.parse(event.body);

    // ⏱️ Timeout controller (IMPORTANT)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 80000); // 25 sec max

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          ...body,

          // ⚡ Force faster response
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
          }
        })
      }
    );

    clearTimeout(timeout);

    console.log("🌐 API Status:", response.status);

    const data = await response.json();

    console.log("🧠 Gemini Response:", JSON.stringify(data));

    let reply = "No response from AI";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0]?.content?.parts || [];
      reply = parts.map(p => p.text || "").join(" ").trim();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error("❌ Function Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
}