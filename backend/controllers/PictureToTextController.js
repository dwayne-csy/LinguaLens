const connection = require('../config/db');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const extractText = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  // Optimized Tesseract languages: non-Latin scripts + Latin with diacritics
  const languages = 'eng+rus+bul+ell+heb+ara+hin+tam+tel+chi_sim+jpn+kor+tha';

  Tesseract.recognize(filePath, languages)
    .then(({ data: { text } }) => {
      // Save extracted text to database
      connection.query(
        'INSERT INTO extracted_texts (filename, text_content) VALUES (?, ?)',
        [fileName, text],
        (err) => { if (err) console.log('DB insert error:', err); }
      );

      fs.unlinkSync(filePath); // delete uploaded image
      res.json({ message: 'Text extracted successfully', text });
    })
    .catch(err => res.status(500).json({ error: 'OCR failed', details: err.message }));
};

module.exports = { extractText };
