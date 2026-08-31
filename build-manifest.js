// Recursively scans the /images folder (any depth — a project folder can
// live directly under /images, or nested inside a category folder like
// /images/kitchens/ or /images/millwork/) and writes manifest.json listing
// every photo found, as its path relative to the repo root. Runs
// automatically on every Cloudflare Pages build (see the "Build command"
// setting in your Cloudflare Pages project — it should be: node build-manifest.js
//
// To add new photos to the site: drop the image file into its project's
// folder inside /images (nested under a category folder or not — both work),
// then commit. No other file needs to be edited — this script regenerates
// the list on the next deploy, and each photo's display name is generated
// automatically from its immediate parent folder's name.

const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Folder names (anywhere in the /images tree) to skip entirely — e.g. a
// project folder you're still filling in and don't want live yet.
const EXCLUDE = new Set([]);

const dir = __dirname;
const imagesDir = path.join(dir, 'images');

function collectImages(baseDir, relativeDir) {
  var results = [];
  if (!fs.existsSync(baseDir)) return results;

  var entries = fs.readdirSync(baseDir, { withFileTypes: true });
  entries.forEach(function (entry) {
    var full = path.join(baseDir, entry.name);
    var rel = relativeDir ? relativeDir + '/' + entry.name : entry.name;

    if (entry.isDirectory()) {
      if (EXCLUDE.has(entry.name)) return;
      results = results.concat(collectImages(full, rel));
    } else if (IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push('images/' + rel);
    }
  });

  return results;
}

const files = collectImages(imagesDir, '').sort();

fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(files, null, 2));

console.log(`manifest.json written with ${files.length} image(s) across the /images tree.`);
