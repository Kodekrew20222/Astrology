// ================== GLOBAL ==================
let userProfile = {};

// Load saved user
window.onload = () => {
  const saved = localStorage.getItem("astroUser");
  if (saved) {
    userProfile = JSON.parse(saved);
    console.log("Loaded user:", userProfile);
  }
};

// Save user
function saveProfile() {
  userProfile = {
    name: document.getElementById("name").value,
    dob: document.getElementById("dob").value,
    time: document.getElementById("time").value,
    location: document.getElementById("location").value
  };

  localStorage.setItem("astroUser", JSON.stringify(userProfile));
  alert("Profile Saved ✅");
}

// ================== SPEECH ==================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech Recognition not supported in this browser");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";

// Click mic
function startListening() {
  console.log("🎤 Mic clicked");

  document.getElementById("status").innerText = "Listening...";
  
  try {
    recognition.start();
  } catch (err) {
    console.warn("Already started:", err.message);
  }
}

// When speech is captured
recognition.onresult = function(event) {
  const question = event.results[0][0].transcript;

  console.log("🗣 User said:", question);

  document.getElementById("status").innerText = "Processing...";

  askGemini(question);
};

// Mic error
recognition.onerror = function(event) {
  console.error("❌ Mic error:", event.error);
  document.getElementById("status").innerText = "Mic Error: " + event.error;
};

// ================== GEMINI ==================
async function askGemini(question) {
  try {
    const prompt = `
User Details:
Name: ${userProfile.name || "N/A"}
DOB: ${userProfile.dob || "N/A"}
Time: ${userProfile.time || "N/A"}
Location: ${userProfile.location || "N/A"}

Question: ${question}
Give astrology answer in a professional tone like an experienced male astrologer.
`;

    console.log("📡 Sending to API...");

    const res = await fetch("./.netlify/functions/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    console.log("📥 Response status:", res.status);

    if (!res.ok) {
      throw new Error("Server error: " + res.status);
    }

    const data = await res.json();
    console.log("📦 API Data:", data);

    const reply = data.reply || "No response from AI";

    document.getElementById("responseText").innerText = reply;
    document.getElementById("status").innerText = "Done ✅";

    // 🔊 SPEAK RESPONSE (ADDED)
    speak(reply);

  } catch (err) {
    console.error("❌ API Error:", err);
    document.getElementById("status").innerText = "Error: " + err.message;
  }
}

// ================== TEXT TO SPEECH ==================
let voices = [];

// Load voices properly
speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
};

function speak(text) {
  if (!text) return;

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 0.9;
  speech.pitch = 0.8;

  if (!voices.length) {
    voices = speechSynthesis.getVoices();
  }

  speech.voice =
    voices.find(v => v.name.toLowerCase().includes("male")) ||
    voices.find(v => v.name.toLowerCase().includes("david")) ||
    voices.find(v => v.name.toLowerCase().includes("google uk english male")) ||
    voices.find(v => v.lang === "en-GB") ||
    voices[0];

  speechSynthesis.speak(speech);
}