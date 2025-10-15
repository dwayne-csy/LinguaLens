document.addEventListener("DOMContentLoaded", () => {
    const speakBtn = document.getElementById("speakBtn");
    const textInput = document.getElementById("textInput");
    const engineSelect = document.getElementById("engineSelect");
    const loadingMessage = document.getElementById("loadingMessage");

    speakBtn.addEventListener("click", () => {
        const text = textInput.value.trim();
        const engine = engineSelect.value;
        const userId = localStorage.getItem("userId"); // ✅ Correct key

        if (!text) {
            alert("Please enter text to speak.");
            return;
        }

        if (!userId) {
            alert("User ID not found. Cannot save history.");
            return;
        }

        // ✅ Show loading
        loadingMessage.style.display = "block";
        loadingMessage.textContent = "Loading...";

        // ✅ Convert to speech using Puter.js
        puter.ai.txt2speech(text, { engine })
            .then((audio) => {
                audio.play();

                // ✅ Save history to backend with correct keys
            fetch("http://localhost:3000/api/tts-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    text_content: text,
                    engine_used: engine
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log("Saved to history:", data);
            })
            .catch(err => {
                console.error("Failed to save TTS history:", err);
            });

                // ✅ Clear text input
                textInput.value = "";

                // ✅ Hide loading after short delay
                setTimeout(() => {
                    loadingMessage.style.display = "none";
                }, 500);
            })
            .catch((err) => {
                console.error("Text-to-speech error:", err);
                alert("Failed to convert text to speech.");
                loadingMessage.style.display = "none";
            });
    });
});