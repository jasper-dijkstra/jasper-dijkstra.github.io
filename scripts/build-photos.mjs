import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile('photos.yml', 'utf8');
const photos = [];
let photo;

function parseValue(value) {
  const trimmed = value.trim();
  if (trimmed === '[]') return [];
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return JSON.parse(trimmed);
  return trimmed;
}

for (const line of source.split(/\r?\n/)) {
  const item = line.match(/^  - (thumbnail):\s*(.*)$/);
  const field = line.match(/^    (photo|tags|description|location):\s*(.*)$/);

  if (item) {
    photo = { [item[1]]: parseValue(item[2]) };
    photos.push(photo);
  } else if (field && photo) {
    photo[field[1]] = parseValue(field[2]);
  }
}

if (!source.startsWith('photos:\n') || photos.length === 0) {
  throw new Error('photos.yml must contain at least one photo under photos:.');
}

for (const [index, photo] of photos.entries()) {
  if (typeof photo.thumbnail !== 'string' || typeof photo.photo !== 'string') {
    throw new Error(`Photo ${index + 1} needs thumbnail and photo paths.`);
  }
  if (!Array.isArray(photo.tags) || !photo.tags.every((tag) => typeof tag === 'string')) {
    throw new Error(`Photo ${index + 1} needs tags as a YAML list.`);
  }
}

await writeFile(
  'assets/js/photos.js',
  `window.PHOTOS = ${JSON.stringify(photos)};\n`,
);
