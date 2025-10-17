// LinguaLens/frontend/User/js/txttospeechwt.js
document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const targetLang = document.getElementById('targetLang');
  const engineSelect = document.getElementById('engineSelect');
  const speakBtn = document.getElementById('speakBtn');
  const loading = document.getElementById('loading');
  const info = document.getElementById('info');
  const charCount = document.getElementById('charCount');

  // Character counter
  inputText.addEventListener('input', () => {
    charCount.textContent = `${inputText.value.length}/5000`;
  });

  // Helper functions
  function setLoading(on) {
    loading.style.display = on ? 'block' : 'none';
    speakBtn.disabled = on;
    if (!on) speakBtn.textContent = '🔊 Speak (translate → speak)';
    else speakBtn.textContent = '⏳ Processing...';
  }

  function showInfo(msg) {
    info.textContent = msg;
  }

  // Main click handler
  speakBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    const to = targetLang.value;
    const engine = engineSelect.value;

    if (!text) {
      alert('Please enter text to speak.');
      return;
    }

    setLoading(true);
    showInfo('Translating...');

    try {
      // 1) Call translate API (same as translator.js uses)
      const resp = await fetch('http://localhost:3000/translator/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, to })
      });

      const data = await resp.json();

      if (!resp.ok) {
        showInfo('Translation failed: ' + (data.error || resp.statusText));
        setLoading(false);
        return;
      }

      const translated = data.translated || '';
      const detected = data.detected || null;

      showInfo(`Detected: ${detected || 'unknown'}. Speaking in ${to}.`);

      // 2) Use Puter to convert the translated text to speech
      // NOTE: If Puter supports passing language explicitly, include it in options,
      // e.g. { engine, lang: to } — update if your Puter account/sdk expects a different key.
      // Current usage mirrors your txttospeech.js: puter.ai.txt2speech(text, { engine })
      try {
        const audio = await puter.ai.txt2speech(translated, { engine /* , lang: to */ });
        // play the returned audio object (your existing code does this)
        audio.play();

        // small info update
        showInfo(`Playing translated text (${to}). Detected original: ${detected || 'unknown'}.`);
      } catch (ttsErr) {
        console.error('TTS error:', ttsErr);
        showInfo('Text-to-speech failed.');
      }

      // Optionally: clear input if you want
      // inputText.value = '';
      // charCount.textContent = `${inputText.value.length}/5000`;

    } catch (err) {
      console.error('Error in translate->speak flow:', err);
      showInfo('Failed to connect to translation service.');
    } finally {
      // hide loading after a short delay so user sees the status
      setTimeout(() => setLoading(false), 500);
    }
  });
});
