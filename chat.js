const chatBox = document.getElementById("chatBox");
const micBtn = document.getElementById("micBtn");

const userData = JSON.parse(localStorage.getItem("astroUser"));
console.log("Loaded User Data:", userData);

// Add message
function addMessage(text, type) {
  console.log(`Adding message (${type}):`, text);

  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.innerText = text;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-IN";

// Mic Click
micBtn.onclick = () => {
  console.log("Mic clicked");
  recognition.start();
  micBtn.innerText = "Listening...";
};

// On Result
recognition.onresult = async (event) => {
  try {
    const userText = event.results[0][0].transcript;

    console.log("User said:", userText);

    addMessage(userText, "user");

    micBtn.innerText = "Processing...";

    const prompt = `
You are an expert astrologer.

User Details:
Name: ${userData?.name}
DOB: ${userData?.dob}
Time: ${userData?.time}
Place: ${userData?.place}

User Question:
${userText}

Answer in a friendly, professional tone.
`;

    console.log("Sending Prompt:", prompt);

    const response = await fetch("/.netlify/functions/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    console.log("Response Status:", response.status);

    const data = await response.json();

    console.log("Gemini Response:", data);

    if (!data.reply) {
      throw new Error("No reply from AI");
    }

    addMessage(data.reply, "bot");

    speak(data.reply);

    micBtn.innerText = "🎤 Speak";

  } catch (error) {
    console.error("Error occurred:", error);

    addMessage("⚠️ Error getting response. Check console.", "bot");

    micBtn.innerText = "🎤 Speak";
  }
};

// Speech Error
recognition.onerror = (event) => {
  console.error("Speech Error:", event.error);
  micBtn.innerText = "🎤 Speak";
};

// Text to Speech
function speak(text) {
  console.log("Speaking:", text);

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-IN";
  speech.pitch = 1;
  speech.rate = 0.95;

  speechSynthesis.speak(speech);
}