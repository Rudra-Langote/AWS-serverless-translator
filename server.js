const recordBtn = document.getElementById("recordBtn");
const translateBtn = document.getElementById("translateBtn");
const spinner = document.getElementById("spinner");
const audioPlayer = document.getElementById("audioPlayer");
const translatedAudio = document.getElementById("translatedAudio");
const responseText = document.getElementById("responseText");

let mediaRecorder;
let audioBlob;

// 🎙️ Start / Stop Recording
recordBtn.addEventListener("click", async () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "🔴 Record";
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  const chunks = [];

  mediaRecorder.ondataavailable = e => chunks.push(e.data);

  mediaRecorder.onstop = () => {
    audioBlob = new Blob(chunks, { type: "audio/webm" });
    const url = URL.createObjectURL(audioBlob);
    audioPlayer.src = url;
  };

  mediaRecorder.start();
  recordBtn.textContent = "⏹️ Stop";
});

// 🌐 Translate Audio
translateBtn.addEventListener("click", async () => {
  if (!audioBlob) {
    alert("Please record audio first.");
    return;
  }

  const fromLang = document.getElementById("fromLanguage").value;
  const toLang = document.getElementById("toLanguage").value;

  const formData = new FormData();
  formData.append('from', fromLang);
  formData.append('to', toLang);
  formData.append('file', audioBlob, "voice.webm");

  // 🔄 Show loading animation
  translateBtn.classList.add("loading");
  spinner.style.display = "inline-block";

  try {
    const response = await fetch("https://ftm8q72fha.execute-api.us-east-1.amazonaws.com/prod/my-translator-function", {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    console.log("Response from API:", result);

    // 🎧 Show translated audio if exists
    if (result.audio_url) {
      translatedAudio.src = result.audio_url;
    }

    // 📝 Show translated text
    if (result.text_url) {
      const textResponse = await fetch(result.text_url);
      const text = await textResponse.text();
      responseText.textContent = `📝 Translated Text:\n${text}`;
    } else {
      responseText.textContent = "❌ No translated text file found.";
    }
  } catch (error) {
    console.error("Translation error:", error);
    responseText.textContent = "⚠️ API Error: " + error.message;
  } finally {
    // ✅ Hide spinner & restore button
    translateBtn.classList.remove("loading");
    spinner.style.display = "none";
  }
});
