/**
 * convert-videos.js
 * Converts all MP4 files in /public to WebM (VP9 codec) using FFmpeg.
 * Run with: node scripts/convert-videos.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "../public");
const files = fs.readdirSync(publicDir);
const mp4Files = files.filter(f => f.toLowerCase().endsWith(".mp4"));

if (mp4Files.length === 0) {
  console.log("No MP4 files found in public/");
  process.exit(0);
}

console.log(`Found ${mp4Files.length} MP4 file(s). Converting to WebM...\n`);

let converted = 0;
let failed = 0;

for (const file of mp4Files) {
  const inputPath = path.join(publicDir, file);
  const outputName = path.basename(file, ".mp4") + ".webm";
  const outputPath = path.join(publicDir, outputName);

  if (fs.existsSync(outputPath)) {
    const outSize = fs.statSync(outputPath).size;
    console.log(`  [SKIP] ${outputName} already exists (${(outSize/1024/1024).toFixed(1)}MB)`);
    continue;
  }

  const inputSize = fs.statSync(inputPath).size;
  console.log(`  [CONV] ${file} (${(inputSize/1024/1024).toFixed(1)}MB) → ${outputName} ...`);

  try {
    // Detect custom FFmpeg installation path
    const ffmpegPath = fs.existsSync("C:\\Users\\ME\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe")
      ? '"C:\\Users\\ME\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe"'
      : "ffmpeg";

    // VP9 codec, CRF 33 (good quality/size balance), 2-pass would be better but 1-pass is faster
    execSync(
      `${ffmpegPath} -i "${inputPath}" -c:v libvpx-vp9 -crf 33 -b:v 0 -c:a libopus -b:a 96k -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outputPath}" -y`,
      { stdio: "pipe" }
    );
    const outputSize = fs.statSync(outputPath).size;
    const saving = (((inputSize - outputSize) / inputSize) * 100).toFixed(1);
    console.log(`  [OK]   → ${outputName} | ${(inputSize/1024/1024).toFixed(1)}MB → ${(outputSize/1024/1024).toFixed(1)}MB (${saving}% saved)`);
    converted++;
  } catch (err) {
    console.error(`  [ERR]  ${file}: ${err.message.slice(0, 200)}`);
    failed++;
  }
}

console.log(`\nDone! Converted: ${converted} | Failed: ${failed} | Skipped: ${mp4Files.length - converted - failed}`);
