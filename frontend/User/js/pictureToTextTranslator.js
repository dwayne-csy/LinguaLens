// js/pictureToTextTranslator.js

// Supported languages for translation
const supportedLanguages = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German", 
    "it": "Italian", "pt": "Portuguese", "nl": "Dutch", "ja": "Japanese",
    "zh-cn": "Chinese (Simplified)", "zh-tw": "Chinese (Traditional)", 
    "ko": "Korean", "ru": "Russian", "ar": "Arabic", "hi": "Hindi"
};

// DOM Elements
let langSelect, extractedResult, translatedResult;
let processingTime, languageInfo, confidenceInfo, submitBtn;
let arrow, imageInput;

// Initialize the application
function init() {
    initializeDOMElements();
    populateLanguageDropdown();
    setupEventListeners();
    console.log('Picture to Text Translator initialized!');
}

// Initialize DOM elements
function initializeDOMElements() {
    langSelect = document.getElementById('languageSelect');
    extractedResult = document.getElementById('extractedResult');
    translatedResult = document.getElementById('translatedResult');
    processingTime = document.getElementById('processingTime');
    languageInfo = document.getElementById('languageInfo');
    confidenceInfo = document.getElementById('confidenceInfo');
    submitBtn = document.getElementById('submitBtn');
    
    // Arrow and file input - FIXED: Properly get these elements
    arrow = document.getElementById('arrow');
    imageInput = document.getElementById('imageInput');

    console.log('DOM Elements:', {
        arrow: !!arrow,
        imageInput: !!imageInput,
        langSelect: !!langSelect,
        submitBtn: !!submitBtn
    });
}

// Populate language dropdown - FIXED: Remove "Select target language" placeholder
function populateLanguageDropdown() {
    if (!langSelect) return;
    
    langSelect.innerHTML = ''; // Clear any existing options
    
    Object.entries(supportedLanguages).forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        langSelect.appendChild(option);
    });
    
    // Set default to English
    langSelect.value = 'en';
}

// Setup event listeners - FIXED: Add arrow click listener
function setupEventListeners() {
    const form = document.getElementById('uploadForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // FIXED: Add arrow click event listener
    if (arrow && imageInput) {
        arrow.addEventListener('click', () => {
            console.log('Arrow clicked - triggering file input');
            imageInput.click();
        });

        // Detect if a file is selected
        imageInput.addEventListener('change', () => {
            console.log('File selected:', imageInput.files[0]?.name);
            if (imageInput.files.length > 0) {
                arrow.classList.add('selected');
            } else {
                arrow.classList.remove('selected');
            }
        });
    }

    // Add change listener to language select
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            console.log('Language changed to:', langSelect.value);
        });
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const fileInput = document.getElementById('imageInput');
    if (!fileInput.files.length) {
        alert('Please select an image.');
        return;
    }

    if (!langSelect.value) {
        alert('Please select a target language.');
        return;
    }

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('targetLanguage', langSelect.value);

    // Show loading state
    setLoadingState(true);
    const startTime = Date.now();

    try {
        console.log('Sending request to server...');
        const response = await fetch('http://localhost:3000/api/picturetotexttranslator/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('Server response:', data);

        if (data.error) {
            showError(data.error);
        } else if (!data.extractedText) {
            showNoTextResult(data, elapsed);
        } else {
            displayResults(data, elapsed);
        }
    } catch (err) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.error('Request failed:', err);
        showRequestError(err, elapsed);
    } finally {
        setLoadingState(false);
    }
}

// Display successful results
function displayResults(data, elapsed) {
    // Display extracted text
    extractedResult.textContent = data.extractedText || 'No text extracted';
    
    // Display translated text
    translatedResult.textContent = data.translatedText || 'Translation not available';
    
    // Display processing info
    processingTime.textContent = `Processing time: ${data.processingTime || elapsed}s`;
    
    if (data.detectedLanguage && data.detectedLanguage !== 'unknown') {
        const detectedLangName = supportedLanguages[data.detectedLanguage] || data.detectedLanguage;
        languageInfo.textContent = `Detected language: ${detectedLangName} → ${supportedLanguages[data.targetLanguage]}`;
    } else {
        languageInfo.textContent = `Target language: ${supportedLanguages[data.targetLanguage]}`;
    }
    
    if (data.confidence) {
        confidenceInfo.textContent = `OCR Confidence: ${Math.round(data.confidence)}%`;
    } else {
        confidenceInfo.textContent = '';
    }
}

// Show error state
function showError(message) {
    extractedResult.textContent = `Error: ${message}`;
    translatedResult.textContent = 'Translation failed';
    clearInfoSection();
}

// Show no text result
function showNoTextResult(data, elapsed) {
    extractedResult.textContent = 'No text could be extracted from this image.';
    translatedResult.textContent = 'No text to translate.';
    processingTime.textContent = `Processing time: ${elapsed}s`;
    languageInfo.textContent = '';
    confidenceInfo.textContent = '';
}

// Show request error
function showRequestError(err, elapsed) {
    extractedResult.textContent = `Request failed after ${elapsed}s\n\nError: ${err.message}`;
    translatedResult.textContent = 'Translation unavailable';
    clearInfoSection();
}

// Clear info section
function clearInfoSection() {
    processingTime.textContent = '';
    languageInfo.textContent = '';
    confidenceInfo.textContent = '';
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span>Processing...';
        
        extractedResult.innerHTML = '<span class="spinner"></span>Extracting text from image...\n\nThis may take 15-30 seconds';
        translatedResult.textContent = 'Waiting for text extraction...';
        
        processingTime.textContent = 'Processing...';
        languageInfo.textContent = '';
        confidenceInfo.textContent = '';
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload, Extract & Translate';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
