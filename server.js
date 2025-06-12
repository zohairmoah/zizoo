require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const sharp = require('sharp');
const app = express();

// تفعيل ضغط المحتوى
app.use(compression());

// إضافة HTTP caching
app.use((req, res, next) => {
    if (req.url.match(/\.(jpg|jpeg|png|gif|css|js)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // سنة واحدة
    }
    next();
});

// إضافة وسائط الأمان
app.use(helmet());

// تحديد معدل الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100 // الحد الأقصى للطلبات لكل IP
});

app.use(limiter);

// إعداد multer لمعالجة رفع الملفات
const storage = multer.diskStorage({
    destination: './',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 10 // maximum 10 files
    },
    fileFilter: (req, file, cb) => {
        // التحقق من نوع الملف
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('يسمح فقط بملفات الصور'));
        }
        cb(null, true);
    }
});

// middleware لمعالجة JSON والملفات الثابتة
app.use(express.json());
app.use(express.static('./'));

// API endpoint لحفظ المشاريع
app.post('/save-projects', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('لم يتم استلام الملف');
        }

        res.json({ success: true, message: 'تم حفظ المشاريع بنجاح' });
    } catch (error) {
        console.error('Error saving projects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API endpoint للحصول على المشاريع
app.get('/projects', async (req, res) => {
    try {
        const data = await fs.readFile('projects.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading projects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// معالجة الصور عند رفعها
async function optimizeImage(file) {
    const optimizedBuffer = await sharp(file.buffer)
        .resize(1200, 800, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();

    return optimizedBuffer;
}

// تحديث معالج رفع الملفات
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('لم يتم استلام الملف');
        }

        const optimizedImage = await optimizeImage(req.file);
        const fileName = `optimized-${Date.now()}-${req.file.originalname}`;
        await fs.writeFile(path.join(__dirname, 'images', fileName), optimizedImage);

        res.json({ 
            success: true, 
            message: 'تم رفع وتحسين الصورة بنجاح',
            path: `/images/${fileName}` 
        });
    } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
