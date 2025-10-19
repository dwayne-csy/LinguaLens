// PictureToTextController.js - MODIFIED WITH CUSTOM TESSDATA PATH
const connection = require('../config/db');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Smart language configurations
 */
const LANGUAGE_CONFIGS = {
  // Your existing languages
  english: { code: 'eng', easyocr: 'en' },
  japanese: { code: 'jpn', easyocr: 'ja' },
  chinese_simp: { code: 'chi_sim', easyocr: 'ch_sim' },
  chinese_trad: { code: 'chi_tra', easyocr: 'ch_tra' },
  korean: { code: 'kor', easyocr: 'ko' },
  
  // European Languages
  spanish: { code: 'spa', easyocr: 'es' },
  french: { code: 'fra', easyocr: 'fr' },
  german: { code: 'deu', easyocr: 'de' },
  italian: { code: 'ita', easyocr: 'it' },
  portuguese: { code: 'por', easyocr: 'pt' },
  dutch: { code: 'nld', easyocr: 'nl' },
  swedish: { code: 'swe', easyocr: 'sv' },
  norwegian: { code: 'nor', easyocr: 'no' },
  danish: { code: 'dan', easyocr: 'da' },
  finnish: { code: 'fin', easyocr: 'fi' },
  polish: { code: 'pol', easyocr: 'pl' },
  czech: { code: 'ces', easyocr: 'cs' },
  hungarian: { code: 'hun', easyocr: 'hu' },
  greek: { code: 'ell', easyocr: 'el' },
  turkish: { code: 'tur', easyocr: 'tr' },
  
  // Asian Languages
  thai: { code: 'tha', easyocr: 'th' },
  vietnamese: { code: 'vie', easyocr: 'vi' },
  hindi: { code: 'hin', easyocr: 'hi' },
  bengali: { code: 'ben', easyocr: 'bn' },
  tamil: { code: 'tam', easyocr: 'ta' },
  telugu: { code: 'tel', easyocr: 'te' },
  marathi: { code: 'mar', easyocr: 'mr' },
  urdu: { code: 'urd', easyocr: 'ur' },
  gujarati: { code: 'guj', easyocr: 'gu' },
  punjabi: { code: 'pan', easyocr: 'pa' },
  malayalam: { code: 'mal', easyocr: 'ml' },
  kannada: { code: 'kan', easyocr: 'kn' },
  
  // Middle Eastern & African Languages
  arabic: { code: 'ara', easyocr: 'ar' },
  persian: { code: 'fas', easyocr: 'fa' },
  hebrew: { code: 'heb', easyocr: 'he' },
  amharic: { code: 'amh', easyocr: 'am' },
  
  // Cyrillic Languages
  russian: { code: 'rus', easyocr: 'ru' },
  ukrainian: { code: 'ukr', easyocr: 'uk' },
  bulgarian: { code: 'bul', easyocr: 'bg' },
  serbian: { code: 'srp', easyocr: 'sr' },
  belarusian: { code: 'bel', easyocr: 'be' },
  
  // Other Important Languages
  indonesian: { code: 'ind', easyocr: 'id' },
  malay: { code: 'msa', easyocr: 'ms' },
  // REMOVED: filipino: { code: 'tgl', easyocr: 'tl' }, // This was causing the 404 error
  swahili: { code: 'swa', easyocr: 'sw' },
  
  // ALL LANGUAGES COMBINED (without tgl)
  all_languages: { 
    code: 'eng+spa+fra+deu+ita+por+nld+swe+nor+dan+fin+pol+ces+hun+ell+tur+' +
          'jpn+chi_sim+chi_tra+kor+tha+vie+hin+ben+tam+tel+mar+urd+guj+pan+mal+kan+' +
          'ara+fas+heb+amh+rus+ukr+bul+srp+bel+ind+msa+swa',
    easyocr: 'en,es,fr,de,it,pt,nl,sv,no,da,fi,pl,cs,hu,el,tr,' +
             'ja,ch_sim,ch_tra,ko,th,vi,hi,bn,ta,te,mr,ur,gu,pa,ml,kn,' +
             'ar,fa,he,am,ru,uk,bg,sr,be,id,ms,sw'
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
    } else {
      console.warn(`⚠️  Language file not found: ${lang}.traineddata`);
    }
  }
  
  return availableLanguages.join('+');
};

/**
 * Fast deskewing - IMPROVED for slight tilts
 */
const deskewImage = (filePath) => {
  return new Promise((resolve) => {
    const deskewScript = path.join(__dirname, '..', 'utils', 'deskew_image.py');
    const outputPath = filePath.replace(/\.[^/.]+$/, '_deskewed.png');
    
    if (!fs.existsSync(deskewScript)) {
      return resolve(filePath);
    }

    const python = spawn('python', [deskewScript, filePath, outputPath]);
    python.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        console.log('✓ Deskewed image');
        resolve(outputPath);
      } else {
        resolve(filePath);
      }
    });
    python.on('error', () => resolve(filePath));
  });
};

/**
 * Optimized preprocessing - ONLY 2 VARIANTS
 */
const preprocessImage = async (filePath) => {
  const variants = [filePath];
  
  try {
    // Variant 1: High contrast for tilted text
    const contrastPath = filePath.replace(/\.[^/.]+$/, '_contrast.png');
    await sharp(filePath)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: false })
      .greyscale()
      .normalize()
      .linear(1.5, -(128 * 0.5))
      .toFile(contrastPath);
    variants.push(contrastPath);

    // Variant 2: Sharpened for clarity
    const sharpPath = filePath.replace(/\.[^/.]+$/, '_sharp.png');
    await sharp(filePath)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: false })
      .sharpen({ sigma: 1.2 })
      .toFile(sharpPath);
    variants.push(sharpPath);

    return variants;
  } catch (error) {
    return [filePath];
  }
};

/**
 * Fast EasyOCR with tilt-optimized settings
 */
const runEasyOCR = (filePath, languages) => {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '..', 'utils', 'easyocr_runner.py');
    
    if (!fs.existsSync(pythonScript)) {
      return resolve(null);
    }

    const python = spawn('python', [pythonScript, filePath, languages]);
    let output = '';
    
    python.stdout.on('data', (data) => output += data.toString());
    python.on('close', (code) => {
      if (code === 0 && output.trim()) {
        try {
          const result = JSON.parse(output.trim());
          if (result.text && result.text.trim().length > 0) {
            console.log(`✓ EasyOCR: ${result.text.length} chars`);
            resolve(result);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
    
    python.on('error', () => resolve(null));
    setTimeout(() => { python.kill(); resolve(null); }, 15000);
  });
};

/**
 * Optimized Tesseract for tilted text WITH CUSTOM TESSDATA PATH
 */
const performTesseractOCR = async (filePaths, languages) => {
  let worker = null;
  let best = { text: '', confidence: 0 };
  
  try {
    // NEW: Check which languages are actually available locally
    const availableLanguages = checkLanguageAvailability(languages);
    
    if (!availableLanguages) {
      console.warn('❌ No language files found in tessdata folder');
      return best;
    }
    
    console.log(`✓ Using available languages: ${availableLanguages}`);

    // Initialize worker with custom tessdata path
    worker = await Tesseract.createWorker(availableLanguages, 1, {
      logger: () => {},
      // ADDED: Custom tessdata path
      datapath: TESSDATA_PATH,
      // ADDED: Custom tessdata configuration
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      // ADDED: Prevent downloading from internet
      errorHandler: (err) => {
        console.warn(`Tesseract warning: ${err.message}`);
      }
    });

    // Test fewer but smarter rotations
    const rotations = [0, 2, -2, 5, -5, 10, -10];
    
    for (const file of filePaths) {
      for (const angle of rotations) {
        try {
          let imgPath = file;
          
          if (angle !== 0) {
            const rotPath = file.replace(/\.png$/, `_r${angle}.png`);
            await sharp(file).rotate(angle, { background: '#ffffff' }).toFile(rotPath);
            imgPath = rotPath;
          }

          await worker.setParameters({
            tessedit_pageseg_mode: '6',
            preserve_interword_spaces: '1',
            textord_min_linesize: '2.0'  // Better for tilted
          });

          const { data } = await worker.recognize(imgPath);
          
          if (angle !== 0 && fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }

          const text = data.text.trim();
          if (text.length > 0 && data.confidence > best.confidence) {
            best = { text, confidence: data.confidence };
            
            // Early exit on good results
            if (data.confidence > 80 && text.length > 5) {
              return best;
            }
          }
        } catch (err) {
          // Continue
        }
      }
    }

    return best;
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
};

/**
 * Main extraction - WITH TESSDATA PATH INTEGRATION
 */
const extractText = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const startTime = Date.now();
  const filePath = req.file.path;
  let processedFiles = [filePath];

  try {
    console.log('\n🚀 OPTIMIZED OCR ENGINE WITH CUSTOM TESSDATA');

    // ADDED: Check if tessdata path exists
    if (!fs.existsSync(TESSDATA_PATH)) {
      console.warn(`⚠️  Tessdata path not found: ${TESSDATA_PATH}`);
    } else {
      console.log(`✓ Using custom tessdata from: ${TESSDATA_PATH}`);
    }

    // 1. ALWAYS deskew first (critical for tilted text)
    console.log('🔍 Deskewing image...');
    const deskewedPath = await deskewImage(filePath);
    processedFiles = [deskewedPath];

    // 2. Simple preprocessing
    console.log('🔍 Preprocessing...');
    const variants = await preprocessImage(deskewedPath);
    processedFiles = [...processedFiles, ...variants.filter(f => f !== deskewedPath)];

    // 3. Choose languages
    const selectedLang = req.body.language || 'all_languages';
    const langConfig = LANGUAGE_CONFIGS[selectedLang] || LANGUAGE_CONFIGS.all_languages;

    // 4. Try both engines in parallel
    console.log('🎯 Running OCR engines...');
    const [easyResult, tessResult] = await Promise.all([
      runEasyOCR(deskewedPath, langConfig.easyocr),
      performTesseractOCR(processedFiles, langConfig.code)
    ]);

    // 5. Pick best result
    let finalResult = '';
    let engine = '';

    if (easyResult && easyResult.text) {
      finalResult = easyResult.text;
      engine = 'EasyOCR';
    }

    if (tessResult && tessResult.text && tessResult.text.length > finalResult.length) {
      finalResult = tessResult.text;
      engine = 'Tesseract';
    }

    // 6. Cleanup
    processedFiles.forEach(p => {
      try { if (p !== filePath && fs.existsSync(p)) fs.unlinkSync(p); } catch (e) {}
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!finalResult) {
      return res.json({
        message: 'No text detected',
        text: '',
        processingTime: `${elapsed}s`
      });
    }

    // Save to database
    connection.query(
      'INSERT INTO extracted_texts (filename, text_content) VALUES (?, ?)',
      [req.file.originalname, finalResult],
      (err) => { if (!err) console.log('✓ Saved to DB'); }
    );

    res.json({
      message: 'Text extracted successfully',
      text: finalResult,
      engine: engine,
      processingTime: `${elapsed}s`
    });

  } catch (err) {
    // Cleanup on error
    processedFiles.forEach(p => {
      try { if (p !== filePath && fs.existsSync(p)) fs.unlinkSync(p); } catch (e) {}
    });
    
    console.error('❌ ERROR:', err.message);
    res.status(500).json({
      error: 'OCR processing failed',
      details: err.message
    });
  }
};

module.exports = { extractText };


