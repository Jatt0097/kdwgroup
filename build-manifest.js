// Recursively scans the repo for image files sitting inside project folders
// (e.g. "Burlington Ontario/photo-1.jpg", "waterfall-island-kitchen/photo-1.jpg")
// and writes manifest.json listing every one found, as its path relative to
// the repo root. Runs automatically on every Cloudflare Pages build (see the
// "Build command" setting in your Cloudflare Pages project — it should be:
// node build-manifest.js
//
// To add new photos to the site: drop the image file into its project's
// folder (or create a new one) at the repo root, then commit. No other file
// needs to be edited — this script regenerates the list on the next deploy,
// and each photo's display name is generated automatically from its
// immediate parent folder's name.

const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Folders to skip entirely when scanning — repo plumbing and non-photo
// folders, not project folders. Add a project folder name here too if you
// want to keep it out of the site temporarily without deleting it.
const EXCLUDE = new Set(['.git', '.github', '.wrangler', 'node_modules']);

const dir = __dirname;

function collectImages(baseDir, relativeDir) {
  var results = [];
  if (!fs.existsSync(baseDir)) return results;

  var entries = fs.readdirSync(baseDir, { withFileTypes: true });
  entries.forEach(function (entry) {
    if (EXCLUDE.has(entry.name)) return;

    var full = path.join(baseDir, entry.name);
    var rel = relativeDir ? relativeDir + '/' + entry.name : entry.name;

    if (entry.isDirectory()) {
      results = results.concat(collectImages(full, rel));
    } else if (IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(rel);
    }
  });

  return results;
}

const files = collectImages(dir, '').sort();

fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(files, null, 2));

console.log(`manifest.json written with ${files.length} image(s) found across the repo.`);
