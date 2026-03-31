export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    console.log("✅ Function triggered");

    const body = JSON.parse(event.body);

    // ⏱️ Timeout controller (IMPORTANT)
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.log("⏳ Aborting request before Netlify timeout");
      controller.abort();
    }, 28000); // SAFE BUFFER

    let response;

    try {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            ...body,
            generationConfig: {
              maxOutputTokens: 600, // balanced
              temperature: 0.6,
            },
          }),
        }
      );
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("⚠️ Request aborted safely");

        return {
          statusCode: 200,
          body: JSON.stringify({
            reply:
              "This reading is taking longer than expected. Please try asking in a slightly shorter way.",
          }),
        };
      }
      throw err;
    }

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