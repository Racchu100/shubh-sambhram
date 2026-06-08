/**
 * convert-images.js
 * Converts all JPG/JPEG/PNG in /public to WebP using sharp.
 * Run with: node scripts/convert-images.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "../public");
const exts = [".jpg", ".jpeg", ".png"];

async function convertAll() {
  const files = fs.readdirSync(publicDir);
  let converted = 0;
  let skipped = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!exts.includes(ext)) { skipped++; continue; }

    const inputPath = path.join(publicDir, file);
    const outputName = path.basename(file, ext) + ".webp";
    const outputPath = path.join(publicDir, outputName);

    // Skip if webp already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  [SKIP] ${outputName} already exists`);
      skipped++;
      continue;
    }

    try {
      const inputSize = fs.statSync(inputPath).size;
      await sharp(inputPath)
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);
      const outputSize = fs.statSync(outputPath).size;
      const saving = (((inputSize - outputSize) / inputSize) * 100).toFixed(1);
      console.log(`  [OK] ${file} → ${outputName} | ${(inputSize/1024).toFixed(0)}KB → ${(outputSize/1024).toFixed(0)}KB (${saving}% saved)`);
      converted++;
    } catch (err) {
      console.error(`  [ERR] ${file}: ${err.message}`);
    }
  }

  console.log(`\nDone! Converted: ${converted} | Skipped: ${skipped}`);
}

convertAll();
