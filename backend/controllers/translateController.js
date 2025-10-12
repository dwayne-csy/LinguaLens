const translatte = require('translatte');

exports.translateText = async (req, res) => {
    const { text, to } = req.body;

    if (!text || !to) {
        return res.status(400).json({ error: 'Text and target language are required.' });
    }

    try {
        // Translatte will automatically detect the input language if 'from' is not provided
        const result = await translatte(text, { to });
        res.json({
            translated: result.text,
            detected: result.from.language.iso // detected language code
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Translation failed.' });
    }
};
