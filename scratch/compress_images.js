const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const images = [
  'gambar_tunang1.png',
  'gambar_tunang2.png',
  'gambar_tunang3.png',
  'gambar_tunang4.png',
  'gambar_tunang5.png'
];

async function compressImages() {
  for (const img of images) {
    const inputPath = path.join(publicDir, img);
    const outputPath = path.join(publicDir, img.replace('.png', '_temp.png'));

    if (fs.existsSync(inputPath)) {
      console.log(`Compressing ${img}...`);
      try {
        await sharp(inputPath)
          .resize(1200) // Resize to max 1200px width for better balance of quality/size
          .png({ quality: 80, compressionLevel: 9 })
          .toFile(outputPath);
        
        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath, inputPath);
        console.log(`Successfully compressed ${img}`);
      } catch (err) {
        console.error(`Error compressing ${img}:`, err);
      }
    }
  }
}

compressImages();
