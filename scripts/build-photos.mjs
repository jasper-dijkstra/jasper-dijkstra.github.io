import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function parseValue(value = '') {
  const trimmed = String(value).trim();
  if (trimmed === '[]') return [];
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return JSON.parse(trimmed);
  return trimmed;
}

export function parsePhotos(source) {
  const photos = [];
  let photo;

  for (const line of source.split(/\r?\n/)) {
    const item = line.match(/^  - (thumbnail):\s*(.*)$/);
    const field = line.match(/^    (photo|tags|description|location|camera|objective|aperture|shutter_speed|iso|capture_date):\s*(.*)$/);

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

  for (const [index, photoEntry] of photos.entries()) {
    if (typeof photoEntry.thumbnail !== 'string' || typeof photoEntry.photo !== 'string') {
      throw new Error(`Photo ${index + 1} needs thumbnail and photo paths.`);
    }
    if (!Array.isArray(photoEntry.tags) || !photoEntry.tags.every((tag) => typeof tag === 'string')) {
      throw new Error(`Photo ${index + 1} needs tags as a YAML list.`);
    }
  }

  return photos;
}

function normaliseDate(value) {
  if (!value) return null;
  const dateString = String(value).trim();
  const match = dateString.match(/^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hours, minutes, seconds] = match;
  const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatShutterSpeed(value) {
  if (!value && value !== 0) return '';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    const text = String(value).trim();
    return text.includes('/') ? `${text} s` : text;
  }
  if (numeric >= 1) return `${Number(numeric).toFixed(Number.isInteger(numeric) ? 0 : 2).replace(/\.0$/, '')} s`;
  const denominator = Math.round(1 / numeric);
  return `1/${denominator} s`;
}

function formatAperture(value) {
  if (!value && value !== 0) return '';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    const text = String(value).trim();
    return text.toLowerCase().startsWith('f/') ? text : text ? `f/${text}` : '';
  }
  return `f/${Number(numeric).toFixed(1).replace(/\.0$/, '')}`;
}

export function fillMissingMetadata(photos, exifMap) {
  const isMissing = (value) => {
    const trimmed = value?.trim() || '';
    return trimmed === '' || trimmed === 'f/' || trimmed === '1/';
  };

  return photos.map((photo) => {
    const fileName = path.basename(photo.photo || '');
    const exif = exifMap[fileName] || {};
    const cleaned = { ...photo };

    const nextCamera = !isMissing(cleaned.camera);
    const nextObjective = !isMissing(cleaned.objective);
    const nextAperture = !isMissing(cleaned.aperture);
    const nextShutter = !isMissing(cleaned.shutter_speed);
    const nextIso = !isMissing(cleaned.iso);

    if (!nextCamera && exif.Model) cleaned.camera = exif.Model;
    if (!nextObjective && exif.LensModel) cleaned.objective = exif.LensModel;
    else if (!nextObjective && exif.FocalLength) cleaned.objective = `${exif.FocalLength.replace(/\s*mm$/i, '')}mm`;
    if (!nextAperture && exif.FNumber) cleaned.aperture = formatAperture(exif.FNumber);
    else if (!nextAperture && exif.ApertureValue) cleaned.aperture = formatAperture(exif.ApertureValue);
    if (!nextShutter && exif.ExposureTime) cleaned.shutter_speed = formatShutterSpeed(exif.ExposureTime);
    if (!nextIso && exif.ISO) cleaned.iso = `ISO ${exif.ISO}`;

    if (!cleaned.capture_date?.trim()) {
      const dateFromExif = exif.DateTimeOriginal || exif.DateTime;
      if (dateFromExif) cleaned.capture_date = String(dateFromExif).trim();
    }

    return cleaned;
  });
}

export function sortPhotosByDate(photos) {
  return [...photos].sort((left, right) => {
    const leftDate = normaliseDate(left.capture_date);
    const rightDate = normaliseDate(right.capture_date);
    if (!leftDate && !rightDate) return 0;
    if (!leftDate) return 1;
    if (!rightDate) return -1;
    return rightDate.getTime() - leftDate.getTime();
  });
}

export async function loadExifMetadata(photos) {
  const exifMap = {};

  for (const photo of photos) {
    const fileName = path.basename(photo.photo || '');
    if (!fileName) continue;
    const fullPath = path.join(process.cwd(), 'images', 'fulls', fileName);
    try {
      const { stdout } = await execFileAsync('magick', [
        'identify',
        '-format',
        '%[EXIF:DateTimeOriginal]|%[EXIF:DateTime]|%[EXIF:Model]|%[EXIF:LensModel]|%[EXIF:FNumber]|%[EXIF:ExposureTime]|%[EXIF:ISOSpeedRatings]|%[EXIF:FocalLength]',
        fullPath,
      ]);
      const [dateOriginal, date, model, lens, fNumber, exposure, iso, focalLength] = stdout.trim().split('|');
      if (![dateOriginal, date, model, lens, fNumber, exposure, iso, focalLength].some(Boolean)) continue;

      exifMap[fileName] = {
        DateTimeOriginal: dateOriginal || date || '',
        DateTime: date || dateOriginal || '',
        Model: model || '',
        LensModel: lens || '',
        FNumber: fNumber || '',
        ExposureTime: exposure || '',
        ISO: iso || '',
        FocalLength: focalLength || '',
        ApertureValue: fNumber || '',
      };
    } catch {
      // Ignore unreadable files during build; the photo still renders with YAML values if present.
    }
  }

  return exifMap;
}

export function toYaml(photos) {
  const lines = ['photos:'];
  for (const photo of photos) {
    lines.push(`  - thumbnail: ${JSON.stringify(photo.thumbnail)}`);
    lines.push(`    photo: ${JSON.stringify(photo.photo)}`);
    lines.push(`    tags: [${(photo.tags || []).map((tag) => tag.includes(' ') ? JSON.stringify(tag) : tag).join(', ')}]`);
    lines.push(`    description: ${JSON.stringify(photo.description || '')}`);
    lines.push(`    location: ${JSON.stringify(photo.location || '')}`);
    lines.push(`    camera: ${JSON.stringify(photo.camera || '')}`);
    lines.push(`    objective: ${JSON.stringify(photo.objective || '')}`);
    lines.push(`    aperture: ${JSON.stringify(photo.aperture || '')}`);
    lines.push(`    shutter_speed: ${JSON.stringify(photo.shutter_speed || '')}`);
    lines.push(`    iso: ${JSON.stringify(photo.iso || '')}`);
    lines.push(`    capture_date: ${JSON.stringify(photo.capture_date || '')}`);
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  const source = await readFile('photos.yml', 'utf8');
  const parsedPhotos = parsePhotos(source);
  const exifMap = await loadExifMetadata(parsedPhotos);
  const filledPhotos = fillMissingMetadata(parsedPhotos, exifMap);
  const sortedPhotos = sortPhotosByDate(filledPhotos);

  await writeFile(
    'assets/js/photos.js',
    `window.PHOTOS = ${JSON.stringify(sortedPhotos)};\n`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
