# jasper-dijkstra.github.io

Photo portfolio at <https://jasper-dijkstra.github.io/>. Jekyll, built and served by GitHub Pages
from `main` — push and it deploys.

The grid is driven entirely by the contents of `images/fulls/`. `index.html` loops over
`site.static_files` and emits one tile per file, pairing each with the same filename in
`images/thumbs/`. There is no photo list to maintain, but the two directories must hold identical
filenames or thumbnails 404.

Clicking a photo opens a lightbox that reads EXIF out of the JPEG in the browser and shows camera,
aperture, shutter speed and ISO. Which tags appear is set by `exif` in `_config.yml`. This only works
while the files in `images/fulls/` keep their EXIF, so never strip metadata when editing them.

## Adding photos

Three sizes exist and only two are committed. Camera originals stay out of the repo — `.gitignore`
blocks `images/*.jpg` and friends so a staged copy can never be pushed by accident.

| | size | committed |
|---|---|---|
| Camera originals | full | no |
| `images/fulls/` | 1024 px wide, lightbox view, watermarked | yes |
| `images/thumbs/` | 512 px wide, grid tiles, clean | yes |

Copy the originals into `images/`, then:

```sh
magick mogrify -path images/fulls  -resize 1024x -quality 88 images/*.JPG images/*.jpeg
magick mogrify -path images/thumbs -resize 512x  -quality 85 images/fulls/*
magick mogrify -font /System/Library/Fonts/Supplemental/Arial.ttf -gravity southeast \
  -pointsize 22 -fill '#00000080' -annotate +19+13 '© Jasper Dijkstra' \
  -pointsize 22 -fill '#ffffffd0' -annotate +18+14 '© Jasper Dijkstra' \
  images/fulls/*
rm images/*.JPG images/*.jpeg
```

Order matters. Thumbs come from `fulls` before the watermark goes on, so the grid tiles stay clean and
the mark never gets scaled down to mush. The dark offset behind the white text is what keeps it
readable on bright photos; plain white disappears on a light background.

`mogrify` edits in place, so running the watermark twice stamps it twice. To redo a photo, regenerate
it from the original.

## Editing styles

`assets/css/*.min.css` is built from `assets/sass/`. Only needed if you change the design:

```sh
npm install && npx gulp build
```

## Local preview

`bundle exec jekyll serve` needs a C toolchain that can build native gems. It does not work on this
machine — the Command Line Tools ship clang 15 with a macOS 14.4 SDK, which lacks the C23
`stdckdint.h` that current Ruby headers include, so every native gem fails to compile. Fix it with
`sudo softwareupdate -i "Command Line Tools for Xcode 26.6"`, or sidestep it with Docker:

```sh
docker run --rm -it -v "$PWD":/site -w /site -p 4000:4000 ruby:3.3 \
  bash -c "gem install jekyll -N && jekyll serve -H 0.0.0.0"
```

Otherwise push a branch and let Pages build it.

## Credit

Built on the [photography](https://github.com/rampatra/photography) Jekyll template by Ram Patra,
design by [AJ](https://twitter.com/ajlkn). Used under GPL-3.0; this repo carries the same licence.
The original is available as the `upstream` remote for pulling template fixes.
