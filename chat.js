const chatBox = document.getElementById("chatBox");
const micBtn = document.getElementById("micBtn");

const userData = JSON.parse(localStorage.getItem("astroUser"));

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🎤 Speech to Text
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-IN";

micBtn.onclick = () => {
  recognition.start();
  micBtn.innerText = "Listening...";
};

recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  addMessage(userText, "user");

  micBtn.innerText = "Processing...";

  const prompt = `
You are an expert astrologer.

User Details:
Name: ${userData.name}
DOB: ${userData.dob}
Time: ${userData.time}
Place: ${userData.place}

User Question:
${userText}

Answer in a friendly, human tone.
`;

  const response = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();

  addMessage(data.reply, "bot");

  speak(data.reply);

  micBtn.innerText = "🎤 Speak";
};

// 🔊 Text to Speech
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.pitch = 1;
  speech.rate = 0.95;
  speechSynthesis.speak(speech);
}