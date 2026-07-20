// Script to compress gear images to WebP format
import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync, unlinkSync, renameSync } from 'fs';
import { join, parse } from 'path';

const GEAR_DIR = join(process.cwd(), 'src', 'assets', 'gear');
const MAX_WIDTH = 600;
const QUALITY = 80;

async function optimizeImages() {
  const files = readdirSync(GEAR_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  console.log(`Found ${files.length} images to optimize in ${GEAR_DIR}`);
  
  for (const file of files) {
    const inputPath = join(GEAR_DIR, file);
    const { name } = parse(file);
    const outputPath = join(GEAR_DIR, `${name}.webp`);
    
    try {
      const info = await sharp(inputPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outputPath);
      
      console.log(`✅ ${file} → ${name}.webp (${Math.round(info.size / 1024)}KB)`);
    } catch (err) {
      console.error(`❌ Failed to convert ${file}:`, err.message);
    }
  }
  
  // Delete original JPGs after successful conversion
  for (const file of files) {
    const inputPath = join(GEAR_DIR, file);
    const { name } = parse(file);
    const webpPath = join(GEAR_DIR, `${name}.webp`);
    
    if (existsSync(webpPath)) {
      unlinkSync(inputPath);
      console.log(`🗑️  Deleted original: ${file}`);
    }
  }
  
  console.log('\nDone! All images optimized to WebP.');
}

optimizeImages();
