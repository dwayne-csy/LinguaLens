// controllers/PictureToTextTranslatorController.js
const connection = require('../config/db');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const translatte = require('translatte');

/**
 * Smart language configurations (same as your existing)
 */
const LANGUAGE_CONFIGS = {
  // Your existing languages - keeping the same structure
  english: { code: 'eng', easyocr: 'en', translator: 'en' },
  japanese: { code: 'jpn', easyocr: 'ja', translator: 'ja' },
  chinese_simp: { code: 'chi_sim', easyocr: 'ch_sim', translator: 'zh-cn' },
  chinese_trad: { code: 'chi_tra', easyocr: 'ch_tra', translator: 'zh-tw' },
  korean: { code: 'kor', easyocr: 'ko', translator: 'ko' },
  
  // European Languages
  spanish: { code: 'spa', easyocr: 'es', translator: 'es' },
  french: { code: 'fra', easyocr: 'fr', translator: 'fr' },
  german: { code: 'deu', easyocr: 'de', translator: 'de' },
  italian: { code: 'ita', easyocr: 'it', translator: 'it' },
  portuguese: { code: 'por', easyocr: 'pt', translator: 'pt' },
  dutch: { code: 'nld', easyocr: 'nl', translator: 'nl' },
  
  // ALL LANGUAGES COMBINED
  all_languages: { 
    code: 'eng+spa+fra+deu+ita+por+nld+jpn+chi_sim+chi_tra+kor',
    easyocr: 'en,es,fr,de,it,pt,nl,ja,ch_sim,ch_tra,ko',
    translator: 'en'
  }
};

/**
 * Custom tessdata path
 */
const TESSDATA_PATH = path.join(__dirname, '..', 'tessdata');

/**
 * Check if language file exists locally
 */
const checkLanguageAvailability = (languages) => {
  const langList = languages.split('+');
  const availableLanguages = [];
  
  for (const lang of langList) {
    const trainedDataPath = path.join(TESSDATA_PATH, `${lang}.traineddata`);
    if (fs.existsSync(trainedDataPath)) {
      availableLanguages.push(lang);
    }
  }
  
  return availableLanguages.join('+');
};

/**
 * OCR Text Extraction (same as your existing optimized version)
 */
const extractTextFromImage = async (filePath, languages) => {
  let worker = null;
  let best = { text: '', confidence: 0 };
  
  try {
    const availableLanguages = checkLanguageAvailability(languages);
    if (!availableLanguages) return best;

    worker = await Tesseract.createWorker(availableLanguages, 1, {
      logger: () => {},
      datapath: TESSDATA_PATH,
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
    });

    const rotations = [0, 2, -2, 5, -5, 10, -10];
    
    for (const angle of rotations) {
      try {
        let imgPath = filePath;
        if (angle !== 0) {
          const rotPath = filePath.replace(/\.png$/, `_r${angle}.png`);
          await sharp(filePath).rotate(angle, { background: '#ffffff' }).toFile(rotPath);
          imgPath = rotPath;
        }

        await worker.setParameters({
          tessedit_pageseg_mode: '6',
          preserve_interword_spaces: '1',
          textord_min_linesize: '2.0'
        });

        const { data } = await worker.recognize(imgPath);
        
        if (angle !== 0 && fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }

        const text = data.text.trim();
        if (text.length > 0 && data.confidence > best.confidence) {
          best = { text, confidence: data.confidence };
          if (data.confidence > 80 && text.length > 5) {
            return best;
          }
        }
      } catch (err) {}
    }

    return best;
  } finally {
    if (worker) await worker.terminate();
  }
};

/**
 * Detect language of extracted text
 */
const detectLanguage = async (text) => {
  try {
    if (!text || text.trim().length < 3) return 'unknown';
    
    const result = await translatte(text, { to: 'en' });
    return result.from.language.iso;
  } catch (error) {
    console.log('Language detection failed:', error.message);
    return 'unknown';
  }
};

/**
 * Translate text to target language
 */
const translateText = async (text, targetLang) => {
  try {
    if (!text || text.trim().length === 0) {
      return { translated: '', detected: 'unknown' };
    }

    const result = await translatte(text, { to: targetLang });
    return {
      translated: result.text,
      detected: result.from.language.iso
    };
  } catch (error) {
    console.log('Translation failed:', error.message);
    throw new Error('Translation service unavailable');
  }
};

/**
 * Main Controller: Extract + Translate
 */
const extractAndTranslate = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const startTime = Date.now();
  const filePath = req.file.path;
  const { targetLanguage = 'en' } = req.body;

  try {
    console.log('🚀 Starting OCR + Translation process...');

    // Step 1: Extract text from image
    console.log('📖 Step 1: Extracting text from image...');
    const ocrResult = await extractTextFromImage(filePath, LANGUAGE_CONFIGS.all_languages.code);
    
    if (!ocrResult.text) {
      // Cleanup and return
      fs.unlinkSync(filePath);
      return res.json({
        message: 'No text detected in image',
        extractedText: '',
        translatedText: '',
        detectedLanguage: 'unknown',
        confidence: 0,
        processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
      });
    }

    console.log(`✅ Text extracted: ${ocrResult.text.length} characters`);

    // Step 2: Detect source language
    console.log('🔍 Step 2: Detecting source language...');
    const detectedLang = await detectLanguage(ocrResult.text);
    console.log(`✅ Detected language: ${detectedLang}`);

    // Step 3: Translate text
    console.log('🌐 Step 3: Translating text...');
    const translationResult = await translateText(ocrResult.text, targetLanguage);

    // Step 4: Cleanup
    fs.unlinkSync(filePath);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Translation completed in ${elapsed}s`);

    // Save to database
    connection.query(
      'INSERT INTO extracted_texts (filename, text_content, translated_text, source_language, target_language) VALUES (?, ?, ?, ?, ?)',
      [req.file.originalname, ocrResult.text, translationResult.translated, detectedLang, targetLanguage],
      (err) => { if (!err) console.log('💾 Saved to database'); }
    );

    // Return results
    res.json({
      message: 'Text extracted and translated successfully',
      extractedText: ocrResult.text,
      translatedText: translationResult.translated,
      detectedLanguage: translationResult.detected,
      targetLanguage: targetLanguage,
      confidence: ocrResult.confidence,
      processingTime: `${elapsed}s`,
      characters: {
        original: ocrResult.text.length,
        translated: translationResult.translated.length
      }
    });

  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    console.error('❌ Processing failed:', error.message);
    res.status(500).json({
      error: 'OCR and translation process failed',
      details: error.message
    });
  }
};

module.exports = { extractAndTranslate };
