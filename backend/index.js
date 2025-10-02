require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
app.use(cors());


// ✅ Connect to database
require('./config/db');

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static frontend and uploaded images
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/images', express.static(path.join(__dirname, 'images')));



const userRoutes = require('./routes/user');
const homeRoutes = require('./routes/home');
const adminRoutes = require('./routes/admin');





app.use('/api/v1', userRoutes);
app.use('/api/v1', homeRoutes);
app.use('/api/v1', adminRoutes);



// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("PORT:", PORT);
    console.log("DB_USER:", process.env.DB_USER);
    console.log(`Server is running on port ${PORT}`);
});
