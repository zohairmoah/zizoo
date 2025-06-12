const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages() {
    const imageDir = path.join(__dirname, '../images');
    const files = await fs.readdir(imageDir);
    
    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const filePath = path.join(imageDir, file);
            const optimizedPath = path.join(imageDir, `optimized-${file}`);
            
            await sharp(filePath)
                .resize(1200, 800, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80, progressive: true })
                .toFile(optimizedPath);
            
            // Replace original with optimized
            await fs.unlink(filePath);
            await fs.rename(optimizedPath, filePath);
            
            // Create thumbnail
            const thumbnailPath = path.join(imageDir, `thumb-${file}`);
            await sharp(filePath)
                .resize(300, 200, {
                    fit: 'cover'
                })
                .jpeg({ quality: 70 })
                .toFile(thumbnailPath);
        }
    }
}

optimizeImages().catch(console.error);
