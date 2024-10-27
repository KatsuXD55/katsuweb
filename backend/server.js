const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

// Koneksi ke database MongoDB
mongoose.connect('mongodb://localhost:27017/photoDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Set penyimpanan untuk multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Fungsi untuk memvalidasi file
const fileFilter = (req, file, cb) => {
    const validTypes = /jpeg|jpg|png|gif/; // Daftar ekstensi yang diizinkan
    const isValid = validTypes.test(file.mimetype); // Memeriksa MIME type
    if (isValid) {
        cb(null, true); // Jika valid, lanjutkan
    } else {
        cb(new Error('Hanya file gambar yang diizinkan!'), false); // Jika tidak valid, beri error
    }
};

// Konfigurasi multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});

// Model foto
const Photo = mongoose.model('Photo', new mongoose.Schema({
    url: String
}));

// Endpoint untuk mengunggah foto
app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Tidak ada file yang diunggah atau format file tidak valid.' });
    }

    const newPhoto = new Photo({ url: req.file.path });
    newPhoto.save().then(() => res.json({ url: req.file.path }))
        .catch(err => res.status(500).send({ message: 'Terjadi kesalahan saat menyimpan foto.' }));
});

// Mengizinkan CORS untuk frontend
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});