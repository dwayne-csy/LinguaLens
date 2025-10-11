document.addEventListener("DOMContentLoaded", () => {
    const speakBtn = document.getElementById("speakBtn");
    const textInput = document.getElementById("textInput");
    const engineSelect = document.getElementById("engineSelect");
    const loadingMessage = document.getElementById("loadingMessage");

    speakBtn.addEventListener("click", () => {
        const text = textInput.value.trim();
        const engine = engineSelect.value; // ✅ get selected engine

        if (!text) {
            alert("Please enter text to speak.");
            return;
        }

        // ✅ Show loading
        loadingMessage.style.display = "block";
        loadingMessage.textContent = "Loading...";

        // ✅ Pass engine to txt2speech
        puter.ai.txt2speech(text, { engine })
            .then((audio) => {
                audio.play();

                // ✅ Clear input
                textInput.value = "";

                // ✅ Hide loading
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
