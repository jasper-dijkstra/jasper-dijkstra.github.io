import { readFile, rm, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parsePhotos, toYaml } from './build-photos.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

export function removePhotoEntry(photos, filename) {
  const matches = photos.filter((photo) => photo.photo === `/images/fulls/${filename}`);
  if (matches.length === 0) throw new Error(`No gallery photo found for ${filename}.`);
  if (matches.length > 1) throw new Error(`More than one gallery entry matches ${filename}.`);
  if (photos.length === 1) throw new Error('Cannot remove the last photo from the gallery.');

  const [match] = matches;
  if (match.thumbnail !== `/images/thumbs/${filename}`) {
    throw new Error(`Unexpected thumbnail path for ${filename}; no files were removed.`);
  }

  return photos.filter((photo) => photo !== match);
}

async function main() {
  const input = process.argv[2];
  const filename = input?.split(/[\\/]/).pop();
  if (!filename || process.argv.length !== 3 || filename === '.' || filename === '..') {
    throw new Error('Usage: npm run remove-photo -- <photo-filename>');
  }

  const yamlPath = path.join(projectRoot, 'photos.yml');
  const photos = parsePhotos(await readFile(yamlPath, 'utf8'));
  const remainingPhotos = removePhotoEntry(photos, filename);

  await writeFile(yamlPath, toYaml(remainingPhotos));
  await rm(path.join(projectRoot, 'images', 'fulls', filename), { force: true });
  await rm(path.join(projectRoot, 'images', 'thumbs', filename), { force: true });
  console.log(`Removed ${filename} from photos.yml and images/fulls and images/thumbs.`);

  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}