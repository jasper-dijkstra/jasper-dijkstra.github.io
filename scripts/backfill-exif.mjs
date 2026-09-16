import { readFile, writeFile } from 'node:fs/promises';

import {
  fillMissingMetadata,
  loadExifMetadata,
  parsePhotos,
  sortPhotosByDate,
  toYaml,
} from './build-photos.mjs';

const source = await readFile('photos.yml', 'utf8');
const photos = parsePhotos(source);
const exifMap = await loadExifMetadata(photos);
const filledPhotos = fillMissingMetadata(photos, exifMap);
const sortedPhotos = sortPhotosByDate(filledPhotos);

await writeFile('photos.yml', toYaml(sortedPhotos));
console.log(`Backfilled ${Object.keys(exifMap).length} photos and sorted ${sortedPhotos.length} entries by capture date.`);