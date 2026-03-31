export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    console.log("✅ Function triggered");

    const body = JSON.parse(event.body);
    console.log("📥 Incoming Body:", JSON.stringify(body));

    // ⏱️ Extend timeout handling
    const controller = new AbortController();

    // Give max safe time (Netlify limit ~30s)
    const timeout = setTimeout(() => {
      console.log("⏳ Aborting request due to timeout...");
      controller.abort();
    }, 28000); // 28 sec safe margin

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

          // ✅ REMOVE TOKEN LIMIT
          generationConfig: {
            temperature: 0.7
          }
        })
      }
    );

    clearTimeout(timeout);

    console.log("🌐 API Status:", response.status);

    const data = await response.json();

    console.log("🧠 Full Gemini Response:", JSON.stringify(data, null, 2));

    let reply = "No response from AI";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0]?.content?.parts || [];
      reply = parts.map(p => p.text || "").join(" ").trim();
    }

    console.log("💬 Final Reply Length:", reply.length);

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error("❌ Function Error:", error);

    // 🔁 Retry once if timeout happens
    if (error.name === "AbortError") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: "The response is taking longer than expected. Please try again."
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
}