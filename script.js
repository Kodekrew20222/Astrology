// ================== GLOBAL ==================
let userProfile = {};
let voices = [];

// Load voices properly
speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
};

// Load saved user
window.onload = () => {
  const saved = localStorage.getItem("astroUser");
  if (saved) {
    userProfile = JSON.parse(saved);
  }
};

// Save user
function saveProfile() {
  userProfile = {
    name: name.value,
    dob: dob.value,
    time: time.value,
    location: location.value
  };
  localStorage.setItem("astroUser", JSON.stringify(userProfile));
  alert("Profile Saved ✅");
}

// ================== SPEECH ==================
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-IN";

function startListening() {
  status.innerText = "Listening...";
  recognition.start();
}

recognition.onresult = (event) => {
  const question = event.results[0][0].transcript;
  status.innerText = "Processing...";
  askGemini(question);
};

recognition.onerror = (e) => {
  status.innerText = "Mic Error";
};

// ================== GEMINI ==================
async function askGemini(question, retry = true) {
  try {
    const prompt = `
User: ${userProfile.name || "N/A"}, DOB: ${userProfile.dob || "N/A"}, Time: ${userProfile.time || "N/A"}, Location: ${userProfile.location || "N/A"}.
Question: ${question}.
Answer professionally like an experienced male astrologer.
`;

    const res = await fetch("/.netlify/functions/gemini", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();

    const reply = data.reply || "No response";

    responseText.innerText = reply;
    status.innerText = "Done ✅";

    speak(reply);

  } catch (err) {
    if (retry) return askGemini(question, false);
    status.innerText = "Server busy, try again";
  }
}

// ================== TEXT TO SPEECH ==================
function speak(text) {
  if (!text) return;

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 0.9;
  speech.pitch = 0.8;

  if (!voices.length) voices = speechSynthesis.getVoices();

  speech.voice =
    voices.find(v => v.name.toLowerCase().includes("male")) ||
    voices.find(v => v.name.toLowerCase().includes("david")) ||
    voices.find(v => v.lang === "en-GB") ||
    voices[0];

  speechSynthesis.speak(speech);
}