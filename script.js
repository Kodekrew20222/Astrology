// ================= PROFILE =================
let userProfile = {};

window.onload = () => {
  const saved = localStorage.getItem("astroUser");
  if (saved) userProfile = JSON.parse(saved);
};

function saveProfile() {
  userProfile = {
    name: name.value,
    dob: dob.value,
    time: time.value,
    location: location.value
  };
  localStorage.setItem("astroUser", JSON.stringify(userProfile));
  alert("Saved ✅");
}

// ================= MIC =================
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-IN";

function startListening() {
  status.innerText = "Listening...";
  recognition.start();
}

recognition.onresult = (e) => {
  const question = e.results[0][0].transcript;
  askGemini(question);
};

// ================= MANUAL INPUT =================
function sendManual() {
  const question = manualInput.value;
  if (!question) return;
  askGemini(question);
}

// ================= GEMINI =================
async function askGemini(question) {
  try {
    status.innerText = "Processing...";

    const prompt = `
Name: ${userProfile.name || "N/A"}
DOB: ${userProfile.dob || "N/A"}
Time: ${userProfile.time || "N/A"}
Location: ${userProfile.location || "N/A"}

Question: ${question}
Give astrology answer in mystical tone.
`;

    const res = await fetch("/.netlify/functions/gemini", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    responseText.innerText = data.reply;

    speak(data.reply);

    status.innerText = "Done ✅";

  } catch (err) {
    console.error(err);
    status.innerText = "Error ❌";
  }
}

// ================= TTS (FREE) =================
function speak(text) {
  if (!text) return;

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 0.95;
  speech.pitch = 0.9;

  const voices = speechSynthesis.getVoices();

  // Try better voice
  speech.voice = voices.find(v => v.name.includes("Google")) || voices[0];

  speechSynthesis.speak(speech);
}