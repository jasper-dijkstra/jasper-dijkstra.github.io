# jasper-dijkstra.github.io

Photo portfolio at <https://jasper-dijkstra.github.io/>. Plain static HTML — GitHub Pages serves the
repository as-is, so a push is the deploy. There is no build step and no Ruby.

`photos.yml` is the gallery source of truth. Clicking a photo opens a lightbox that reads EXIF out
of the JPEG in the browser and shows camera, aperture, shutter speed, ISO, description, and
location, so never strip metadata from the files in `images/fulls/`.

## Photo metadata

Add and edit every photo only in `photos.yml`. Each item defines the thumbnail, full image, tags,
description, and location:

```yaml
photos:
	- thumbnail: /images/thumbs/IMG_2618.JPG
		photo: /images/fulls/IMG_2618.JPG
		tags: [wadden, landschap]
		description: A short description of the photo.
		location: Terschelling, Netherlands
```

Tags determine the categories on `werk.html`. Use the existing categories: `wadden`, `macro`,
`landschap`, and `abstract`.

After changing `photos.yml`, generate the browser data file:

```sh
npm install
npm run build
```

## Adding photos

```sh
./add-photos.sh ~/Pictures/some-shoot/*.JPG
```

The script resizes each photo, cuts a thumbnail, stamps the watermark, appends its paths to
`photos.yml`, and regenerates the browser data file. Originals are read-only and stay outside the repo — `.gitignore` blocks `images/*.jpg`
and friends so a stray copy can never be committed.

| | size | committed |
|---|---|---|
| Camera originals | full | no |
| `images/fulls/` | 1024 px wide, lightbox view, watermarked | yes |
| `images/thumbs/` | 512 px wide, grid tiles, clean | yes |

Run it with no arguments to regenerate the browser data file. Needs ImageMagick (`brew install imagemagick`).

Re-running on a photo that is already in `images/fulls/` regenerates it from the original, so the
watermark is never stamped twice. Remove a photo by deleting both its files and deleting its entry
from `photos.yml`.

## Local preview

```sh
python3 -m http.server 4000
```

Then open <http://localhost:4000>. Opening `index.html` straight from disk does not work — asset
paths are absolute, so they need a server at the root.

## Editing styles

`assets/css/*.min.css` is committed and served directly. It is built from `assets/sass/`, needed only
if you change the design:

```sh
npm install && npx gulp build
```

Delete `gulpfile.mjs`, `package.json` and `assets/sass/` if you never intend to touch the styling; the
site does not read them.

## Credit

Built on the [photography](https://github.com/rampatra/photography) template by Ram Patra, design by
[AJ](https://twitter.com/ajlkn). Used under GPL-3.0; this repo carries the same licence. The original
is a Jekyll theme — this copy renders the same markup as static HTML instead. Upstream is available as
the `upstream` remote.
