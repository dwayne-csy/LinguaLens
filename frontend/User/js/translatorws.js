// ✅ List of all supported languages by Translatte
const supportedLanguages = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German", "it": "Italian",
    "pt": "Portuguese", "ru": "Russian", "ja": "Japanese", "ko": "Korean",
    "ar": "Arabic", "hi": "Hindi", "nl": "Dutch", "pl": "Polish", "tr": "Turkish",
    "tl": "Filipino"
};

// ✅ Language code mapping for TTS (Puter.js uses different codes)
const languageToTTSCode = {
    "en": "en-US", "es": "es-ES", "fr": "fr-FR", "de": "de-DE", "it": "it-IT",
    "pt": "pt-PT", "ru": "ru-RU", "ja": "ja-JP", "ko": "ko-KR",
    "ar": "ar-SA", "hi": "hi-IN", "nl": "nl-NL", "pl": "pl-PL", "tr": "tr-TR"
};

// ✅ DOM Elements
let langSelect, textInput, resultDiv, charCount, detectedLanguageDiv, detectedLangText, autoDetectBadge;
let speakInputBtn, speakOutputBtn;

// ✅ Translation state
let translationTimeout = null;
const TRANSLATION_DELAY = 500; // Delay in ms before auto-translating
let currentDetectedInputLang = null; // Auto-detected input language
let currentDetectedOutputLang = null; // Auto-detected output language
let currentOutputText = '';

// ✅ Bookmark functionality
let bookmarkedLanguages = new Set();

// ✅ Initialize the application
function init() {
    console.log('Initializing translator...');
    
    if (initializeDOMElements()) {
        loadBookmarkedLanguages();
        createCustomDropdown();
        setupEventListeners();
        updateCharCount(); // Initialize character count
        console.log('Translator initialized successfully!');
    } else {
        console.error('Failed to initialize translator - DOM elements missing');
    }
}

// ✅ Initialize DOM elements safely
function initializeDOMElements() {
    langSelect = document.getElementById('languageSelect');
    textInput = document.getElementById('textInput');
    resultDiv = document.getElementById('result');
    charCount = document.getElementById('charCount');
    detectedLanguageDiv = document.getElementById('detectedLanguage');
    detectedLangText = document.getElementById('detectedLangText');
    autoDetectBadge = document.getElementById('autoDetectBadge');
    speakInputBtn = document.getElementById('speakInput');
    speakOutputBtn = document.getElementById('speakOutput');
    
    console.log('DOM Elements found:', {
        langSelect: !!langSelect,
        textInput: !!textInput,
        resultDiv: !!resultDiv,
        charCount: !!charCount,
        detectedLanguageDiv: !!detectedLanguageDiv,
        detectedLangText: !!detectedLangText,
        autoDetectBadge: !!autoDetectBadge,
        speakInputBtn: !!speakInputBtn,
        speakOutputBtn: !!speakOutputBtn
    });
    
    // Check if all required elements exist
    const elementsExist = langSelect && textInput && resultDiv && charCount && 
                         detectedLanguageDiv && detectedLangText && autoDetectBadge &&
                         speakInputBtn && speakOutputBtn;
    
    if (!elementsExist) {
        console.error('Some DOM elements are missing. Please check your HTML structure.');
        return false;
    }
    
    return true;
}

// ✅ Load bookmarked languages from localStorage
function loadBookmarkedLanguages() {
    const saved = localStorage.getItem('bookmarkedLanguages');
    if (saved) {
        try {
            const bookmarks = JSON.parse(saved);
            bookmarkedLanguages = new Set(bookmarks);
            console.log('Loaded bookmarked languages:', Array.from(bookmarkedLanguages));
        } catch (e) {
            console.error('Error loading bookmarks:', e);
            bookmarkedLanguages = new Set();
        }
    }
}

// ✅ Save bookmarked languages to localStorage
function saveBookmarkedLanguages() {
    localStorage.setItem('bookmarkedLanguages', JSON.stringify(Array.from(bookmarkedLanguages)));
}

// ✅ Toggle bookmark for a language
function toggleBookmark(langCode, starElement) {
    const wasBookmarked = bookmarkedLanguages.has(langCode);
    
    if (wasBookmarked) {
        bookmarkedLanguages.delete(langCode);
        starElement.innerHTML = '☆';
        starElement.style.color = '#a0aec0';
        console.log('Unbookmarked:', langCode);
    } else {
        bookmarkedLanguages.add(langCode);
        starElement.innerHTML = '⭐';
        starElement.style.color = '#ffd700';
        console.log('Bookmarked:', langCode);
    }
    
    saveBookmarkedLanguages();
    createCustomDropdown(); // Refresh dropdown to show new order
    
    // Show visual feedback
    showBookmarkFeedback(langCode, !wasBookmarked);
}

// ✅ Show bookmark feedback
function showBookmarkFeedback(langCode, wasBookmarked) {
    const langName = supportedLanguages[langCode];
    const message = wasBookmarked ? `⭐ ${langName} bookmarked!` : `❌ ${langName} unbookmarked!`;
    
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${wasBookmarked ? '#48bb78' : '#e53e3e'};
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 2 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 2000);
}

// ✅ Create custom dropdown with star icons
function createCustomDropdown() {
    if (!langSelect) return;
    
    // Store current selection
    const currentSelection = langSelect.value;
    
    // Clear existing options
    langSelect.innerHTML = '';
    
    // Create bookmarked and normal language arrays
    const bookmarkedLangs = [];
    const normalLangs = [];
    
    Object.entries(supportedLanguages).forEach(([code, name]) => {
        if (bookmarkedLanguages.has(code)) {
            bookmarkedLangs.push({ code, name });
        } else {
            normalLangs.push({ code, name });
        }
    });
    
    // Add bookmarked languages first
    bookmarkedLangs.forEach(({ code, name }) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `⭐ ${name}`;
        option.setAttribute('data-bookmarked', 'true');
        langSelect.appendChild(option);
    });
    
    // Add separator if there are bookmarks and normal languages
    if (bookmarkedLangs.length > 0 && normalLangs.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '────────────';
        langSelect.appendChild(separator);
    }
    
    // Add normal languages
    normalLangs.forEach(({ code, name }) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        option.setAttribute('data-bookmarked', 'false');
        langSelect.appendChild(option);
    });
    
    // Restore selection or set to first bookmark, or English
    if (langSelect.querySelector(`option[value="${currentSelection}"]`)) {
        langSelect.value = currentSelection;
    } else if (bookmarkedLangs.length > 0) {
        langSelect.value = bookmarkedLangs[0].code;
    } else {
        langSelect.value = 'en';
    }
}

// ✅ Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Check if elements exist before adding event listeners
    if (!textInput) {
        console.error('textInput element not found!');
        return;
    }
    
    if (!langSelect) {
        console.error('langSelect element not found!');
        return;
    }
    
    // Character count update and auto-translate
    textInput.addEventListener('input', handleTextInput);
    console.log('Added input event listener to textInput');
    
    // Auto-translate when target language changes
    langSelect.addEventListener('change', () => {
        console.log('Language changed to:', langSelect.value);
        if (textInput.value.trim()) {
            translateText();
        }
    });
    
    // Text-to-speech buttons
    speakInputBtn.addEventListener('click', () => speakText('input'));
    speakOutputBtn.addEventListener('click', () => speakText('output'));
    console.log('Added TTS event listeners');
    
    // Right-click context menu for bookmarking
    langSelect.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const selectedLang = langSelect.value;
        if (selectedLang) {
            // Simulate star click for right-click
            const isBookmarked = bookmarkedLanguages.has(selectedLang);
            const fakeStar = {
                innerHTML: isBookmarked ? '☆' : '⭐',
                style: { color: isBookmarked ? '#a0aec0' : '#ffd700' }
            };
            toggleBookmark(selectedLang, fakeStar);
        }
    });
    
    console.log('Event listeners setup complete');
}

// ✅ Handle text input with auto-translate
function handleTextInput() {
    updateCharCount();
    
    const text = textInput.value.trim();
    
    // Clear previous timeout
    if (translationTimeout) {
        clearTimeout(translationTimeout);
    }
    
    // Reset to auto-detect mode if input is empty
    if (!text) {
        resetToAutoDetectMode();
        return;
    }
    
    // Set timeout for auto-translation
    translationTimeout = setTimeout(() => {
        translateText();
    }, TRANSLATION_DELAY);
}

// ✅ Reset to auto-detect mode when input is empty
function resetToAutoDetectMode() {
    if (!autoDetectBadge || !detectedLanguageDiv || !resultDiv) return;
    
    autoDetectBadge.textContent = 'Auto Detect';
    autoDetectBadge.className = 'auto-detect-badge auto-mode';
    detectedLanguageDiv.style.display = 'none';
    resultDiv.innerHTML = '<span class="output-placeholder">Translation will appear here...</span>';
    if (speakOutputBtn) {
        resultDiv.appendChild(speakOutputBtn);
    }
    currentDetectedInputLang = null;
    currentDetectedOutputLang = null;
    currentOutputText = '';
}

// ✅ Update character count
function updateCharCount() {
    if (!charCount || !textInput) return;
    
    const count = textInput.value.length;
    charCount.textContent = `${count}/5000`;
    
    // Change color when approaching limit
    if (count > 4500) {
        charCount.style.color = '#e53e3e';
    } else if (count > 4000) {
        charCount.style.color = '#dd6b20';
    } else {
        charCount.style.color = '#a0aec0';
    }
}

// ✅ Main translate function
async function translateText() {
    if (!textInput || !langSelect || !resultDiv) return;
    
    const text = textInput.value.trim();
    const to = langSelect.value;

    if (!text) {
        resetToAutoDetectMode();
        return;
    }

    if (text.length > 5000) {
        showError('Text exceeds 5000 character limit.');
        return;
    }

    try {
        // Show loading state
        setLoadingState(true);
        
        const response = await fetch('http://localhost:3000/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, to })
        });

        const data = await response.json();

        if (response.ok) {
            displayTranslation(data.translated, data.detected);
        } else {
            showError('Translation error: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Translation failed:', err);
        showError('Failed to connect to the translation server.');
    } finally {
        setLoadingState(false);
    }
}

// ✅ Display translation result with auto-detected input language
function displayTranslation(translatedText, detectedLang) {
    if (!resultDiv || !autoDetectBadge || !detectedLanguageDiv || !detectedLangText) return;
    
    resultDiv.innerHTML = '';
    resultDiv.textContent = translatedText;
    
    // Store for TTS
    currentOutputText = translatedText;
    currentDetectedInputLang = detectedLang;
    currentDetectedOutputLang = langSelect.value;
    
    // Re-append the speak button
    if (speakOutputBtn) {
        resultDiv.appendChild(speakOutputBtn);
    }
    
    // Update auto-detect badge with detected input language
    if (detectedLang && supportedLanguages[detectedLang]) {
        const detectedLangName = supportedLanguages[detectedLang];
        autoDetectBadge.textContent = detectedLangName;
        autoDetectBadge.className = 'auto-detect-badge detected-mode';
        
        // Show detected language info
        detectedLangText.textContent = detectedLangName;
        detectedLanguageDiv.style.display = 'block';
    } else {
        autoDetectBadge.textContent = 'Auto Detect';
        autoDetectBadge.className = 'auto-detect-badge auto-mode';
        detectedLanguageDiv.style.display = 'none';
    }
}

// ✅ Show error message
function showError(message) {
    if (!resultDiv || !detectedLanguageDiv) return;
    
    resultDiv.innerHTML = `<span style="color: #e53e3e;">${message}</span>`;
    if (speakOutputBtn) {
        resultDiv.appendChild(speakOutputBtn);
    }
    detectedLanguageDiv.style.display = 'none';
}

// ✅ Set loading state
function setLoadingState(isLoading) {
    if (!resultDiv) return;
    
    if (isLoading) {
        resultDiv.innerHTML = '<span class="loading-indicator">Translating...</span>';
        if (speakOutputBtn) {
            resultDiv.appendChild(speakOutputBtn);
        }
    }
}

// ✅ Text-to-Speech function
async function speakText(type) {
    let text, langCode, button;
    
    if (type === 'input') {
        text = textInput.value.trim();
        langCode = currentDetectedInputLang || 'en';
        button = speakInputBtn;
    } else {
        text = currentOutputText;
        langCode = currentDetectedOutputLang || langSelect.value;
        button = speakOutputBtn;
    }
    
    if (!text) {
        console.log('No text to speak');
        return;
    }
    
    if (text.length > 3000) {
        alert('Text is too long for speech. Please use text under 3000 characters.');
        return;
    }
    
    // Get the appropriate language code for TTS
    const ttsLangCode = languageToTTSCode[langCode] || 'en-US';
    
    console.log(`Speaking with language: ${ttsLangCode}`);
    
    try {
        // Add playing animation
        button.classList.add('playing');
        
        // Use Puter.js text-to-speech
        const audio = await puter.ai.txt2speech(text, {
            voice: "Joanna",
            engine: "neural",
            language: ttsLangCode
        });
        
        audio.play();
        
        // Remove animation when audio ends
        audio.addEventListener('ended', () => {
            button.classList.remove('playing');
        });
        
    } catch (error) {
        console.error('TTS Error:', error);
        button.classList.remove('playing');
        alert('Text-to-speech failed. Please try again.');
    }
}

// ✅ Get current bookmarked languages (for debugging)
function getBookmarkedLanguages() {
    return Array.from(bookmarkedLanguages).map(code => ({
        code,
        name: supportedLanguages[code]
    }));
}

// ✅ Clear all bookmarks (utility function)
function clearAllBookmarks() {
    bookmarkedLanguages.clear();
    saveBookmarkedLanguages();
    createCustomDropdown();
    console.log('All bookmarks cleared');
}

// ✅ Back button functionality - navigate to translator.html
function setupBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            console.log('Back button clicked - navigating to translator.html');
            // Navigate back to the basic translator
            window.location.href = 'translator.html';
        });
    } else {
        console.error('Back button not found!');
    }
}

// ✅ Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
    setupBackButton();
});