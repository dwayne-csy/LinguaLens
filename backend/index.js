require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');



// ✅ Enable CORS
app.use(cors());

// ✅ Connect to database
require('./config/db');

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ensure uploads folder exists (for multer)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ✅ Serve static frontend and images
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(uploadsDir)); // serve uploaded images if needed

// ✅ Routes
const userRoutes = require('./routes/user');
const homeRoutes = require('./routes/home');
const pictureToTextRoutes = require('./routes/picturetotext');
const pictureToTextHistoryRoutes = require('./routes/picturetotexthistory');
const profileRoutes = require('./routes/profile');
const translateRoutes = require('./routes/translatewsRoutes');
const translatorRoutes = require('./routes/translatorRoutes');
const txtToSpeechRoutes = require('./routes/txttospeech'); // ✅ adjust path if needed











app.use('/api/v1', userRoutes);
app.use('/api/v1', homeRoutes);
app.use('/api/picturetotext', pictureToTextRoutes);
app.use('/api/picturetotexthistory', pictureToTextHistoryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', translateRoutes);
app.use('/translator', translatorRoutes);
app.use('/api', txtToSpeechRoutes);







// ✅ Start server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("PORT:", PORT);
    console.log("DB_USER:", process.env.DB_USER);
    console.log(`Server is running on port ${PORT}`);
});
