export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    console.log("✅ Function triggered");

    const body = JSON.parse(event.body);
    console.log("📥 Incoming Body:", JSON.stringify(body));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    console.log("🌐 API Status:", response.status);

    const data = await response.json();

    console.log("🧠 Full Gemini Response:", JSON.stringify(data, null, 2));

    // ✅ Extract reply safely
    let reply = "No response from AI";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0]?.content?.parts || [];
      reply = parts.map(p => p.text || "").join(" ").trim();
    }

    console.log("💬 Final Reply:", reply);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reply,
        raw: data // optional for debugging
      })
    };

  } catch (error) {
    console.error("❌ Function Error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message
      })
    };
  }
}