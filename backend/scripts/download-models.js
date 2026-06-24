#!/usr/bin/env node
/**
 * Downloads face-api.js model weights into backend/models/
 * Run: node scripts/download-models.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '..', 'models');
const BASE_URL =
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const FILES = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          download(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

async function main() {
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }

  for (const file of FILES) {
    const url = `${BASE_URL}/${file}`;
    const dest = path.join(MODELS_DIR, file);
    console.log(`Downloading ${file}...`);
    await download(url, dest);
  }

  console.log('Face detection models downloaded successfully.');
}

main().catch(console.error);
