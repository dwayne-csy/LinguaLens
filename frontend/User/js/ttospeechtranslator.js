document.addEventListener("DOMContentLoaded", () => {
    const speakBtn = document.getElementById("speakBtn");
    const textInput = document.getElementById("textInput");
    const engineSelect = document.getElementById("engineSelect");
    const loadingMessage = document.getElementById("loadingMessage");

    speakBtn.addEventListener("click", async () => {
        const text = textInput.value.trim();
        const engine = engineSelect.value;

        if (!text) {
            alert("Please enter text to speak.");
            return;
        }

        loadingMessage.style.display = "block";
        loadingMessage.textContent = "Translating and generating speech...";

        try {
            // Translate text to English using LibreTranslate
            const response = await fetch("https://libretranslate.de/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    q: text,
                    source: "auto",
                    target: "en",
                    format: "text"
                })
            });

            const data = await response.json();
            const translatedText = data.translatedText;

            // Generate speech from translated English text
            const audio = await puter.ai.txt2speech(translatedText, { engine });
            audio.play();

            textInput.value = "";

            setTimeout(() => {
                loadingMessage.style.display = "none";
            }, 500);
        } catch (err) {
            console.error("Error:", err);
            alert("Failed to translate or convert text to speech.");
            loadingMessage.style.display = "none";
        }
    });
});
