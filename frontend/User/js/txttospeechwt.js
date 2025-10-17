// LinguaLens/frontend/User/js/txttospeechwt.js
document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const targetLang = document.getElementById('targetLang');
  const engineSelect = document.getElementById('engineSelect');
  const speakBtn = document.getElementById('speakBtn');
  const loading = document.getElementById('loading');
  const info = document.getElementById('info');
  const charCount = document.getElementById('charCount');

  // Create output container for translated text
  let outputDiv = document.getElementById('translatedOutput');
  if (!outputDiv) {
    outputDiv = document.createElement('div');
    outputDiv.id = 'translatedOutput';
    outputDiv.style.marginTop = '16px';
    outputDiv.style.padding = '12px';
    outputDiv.style.border = '1px solid #e2e8f0';
    outputDiv.style.borderRadius = '8px';
    outputDiv.style.background = '#f7fafc';
    outputDiv.style.minHeight = '60px';
    outputDiv.style.whiteSpace = 'pre-wrap';
    outputDiv.style.fontSize = '15px';
    outputDiv.style.color = '#1e293b';
    speakBtn.parentElement.appendChild(outputDiv);
  }

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

  function showTranslatedText(text) {
    outputDiv.textContent = text;
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
    showTranslatedText(''); // clear previous translation

    try {
      // 1) Call translate API
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
      showTranslatedText(translated); // display translated text in outputDiv

      // 2) Use Puter to convert the translated text to speech
      try {
        const audio = await puter.ai.txt2speech(translated, { engine /* , lang: to */ });
        audio.play();

        showInfo(`Playing translated text (${to}). Detected original: ${detected || 'unknown'}.`);
      } catch (ttsErr) {
        console.error('TTS error:', ttsErr);
        showInfo('Text-to-speech failed.');
      }

    } catch (err) {
      console.error('Error in translate->speak flow:', err);
      showInfo('Failed to connect to translation service.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  });
});
