import test from 'node:test';
import assert from 'node:assert/strict';

import { parsePhotos, fillMissingMetadata, sortPhotosByDate } from './build-photos.mjs';

test('parsePhotos reads YAML metadata into typed objects', () => {
  const source = `photos:
  - thumbnail: /images/thumbs/a.jpg
    photo: /images/fulls/a.jpg
    tags: [wadden, abstract]
    description: "First"
    location: "Terschelling"
    camera: "Canon EOS 250D"
    objective: ""
    aperture: "f/4"
    shutter_speed: "1/100 s"
    iso: "ISO 100"
  - thumbnail: /images/thumbs/b.jpg
    photo: /images/fulls/b.jpg
    tags: []
    description: "Second"
    location: ""
    camera: ""
    objective: ""
    aperture: ""
    shutter_speed: ""
    iso: ""
`;

  const photos = parsePhotos(source);
  assert.equal(photos.length, 2);
  assert.deepEqual(photos[0].tags, ['wadden', 'abstract']);
  assert.equal(photos[1].description, 'Second');
  assert.equal(photos[1].camera, '');
});

test('fillMissingMetadata uses EXIF values when the YAML fields are blank', () => {
  const photos = [
    {
      thumbnail: '/images/thumbs/a.jpg',
      photo: '/images/fulls/a.jpg',
      tags: ['wadden'],
      description: 'A',
      location: '',
      camera: '',
      objective: '',
      aperture: '',
      shutter_speed: '',
      iso: '',
    },
  ];

  const metadata = {
    'a.jpg': {
      DateTimeOriginal: '2024:02:10 10:15:45',
      Model: 'Canon EOS 250D',
      LensModel: 'EF-S 18-55mm',
      ApertureValue: 'f/4',
      ExposureTime: '1/250',
      ISOSpeedRatings: 'ISO 100',
    },
  };

  const result = fillMissingMetadata(photos, metadata);
  assert.equal(result[0].location, '');
  assert.equal(result[0].camera, 'Canon EOS 250D');
  assert.equal(result[0].objective, 'EF-S 18-55mm');
  assert.equal(result[0].aperture, 'f/4');
  assert.equal(result[0].shutter_speed, '1/250 s');
  assert.equal(result[0].iso, 'ISO 100');
});

test('sortPhotosByDate places newest photos first', () => {
  const photos = [
    { photo: '/images/fulls/old.jpg', description: 'Old', capture_date: '2020:01:01 12:00:00' },
    { photo: '/images/fulls/new.jpg', description: 'New', capture_date: '2024:02:10 10:15:45' },
    { photo: '/images/fulls/middle.jpg', description: 'Middle', capture_date: '2022:06:01 09:00:00' },
  ];

  const sorted = sortPhotosByDate(photos);
  assert.deepEqual(sorted.map((photo) => photo.description), ['New', 'Middle', 'Old']);
});
