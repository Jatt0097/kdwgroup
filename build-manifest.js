// Scans this folder for image files and writes manifest.json listing all of them.
// Runs automatically on every Cloudflare Pages build (see the "Build command"
// setting in your Cloudflare Pages project — it should be: node build-manifest.js
//
// To add new photos to the site: just drop the image files in this same folder
// and commit. No other file needs to be edited — this script regenerates the
// list on the next deploy.

const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Filenames (without extension) to leave out of the random photo pool —
// e.g. logo files, favicons, or anything that isn't a project photo.
const EXCLUDE = new Set([]);

const dir = __dirname;

const files = fs
  .readdirSync(dir)
  .filter((f) => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
  .filter((f) => !EXCLUDE.has(path.basename(f, path.extname(f))))
  .sort();

fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(files, null, 2));

console.log(`manifest.json written with ${files.length} image(s).`);
