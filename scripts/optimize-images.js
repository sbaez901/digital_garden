#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/images');
const MAX_FILE_SIZE = 500 * 1024; // 500KB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeImages() {
  console.log('🔍 Analyzing images in public/images...\n');
  
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  let totalSize = 0;
  let largeFiles = [];
  
  seasons.forEach(season => {
    const seasonDir = path.join(IMAGES_DIR, season);
    if (!fs.existsSync(seasonDir)) return;
    
    const files = fs.readdirSync(seasonDir);
    console.log(`📁 ${season.toUpperCase()} (${files.length} files):`);
    
    files.forEach(file => {
      const filePath = path.join(seasonDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      totalSize += size;
      
      if (size > MAX_FILE_SIZE) {
        largeFiles.push({ path: filePath, size, season, file });
      }
      
      console.log(`  ${file}: ${formatBytes(size)}`);
    });
    console.log('');
  });
  
  console.log(`📊 Total images size: ${formatBytes(totalSize)}`);
  
  if (largeFiles.length > 0) {
    console.log('\n⚠️  Large files detected (>500KB):');
    largeFiles.forEach(({ path: filePath, size, season, file }) => {
      console.log(`  ${season}/${file}: ${formatBytes(size)}`);
    });
    
    console.log('\n💡 Optimization recommendations:');
    console.log('  1. Use WebP format instead of JPG/PNG');
    console.log('  2. Compress images to under 500KB');
    console.log('  3. Consider lazy loading for large images');
    console.log('  4. Use responsive images with srcset');
  }
}

analyzeImages();
