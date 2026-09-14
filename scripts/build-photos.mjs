import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';

const source = await readFile('photos.yml', 'utf8');
const data = parse(source);

if (!Array.isArray(data?.photos)) {
  throw new Error('photos.yml must contain a photos list.');
}

for (const [index, photo] of data.photos.entries()) {
  if (typeof photo.thumbnail !== 'string' || typeof photo.photo !== 'string') {
    throw new Error(`Photo ${index + 1} needs thumbnail and photo paths.`);
  }
  if (!Array.isArray(photo.tags) || !photo.tags.every((tag) => typeof tag === 'string')) {
    throw new Error(`Photo ${index + 1} needs tags as a YAML list.`);
  }
}

await writeFile(
  'assets/js/photos.js',
  `window.PHOTOS = ${JSON.stringify(data.photos)};\n`,
);
