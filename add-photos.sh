#!/bin/sh
# Add photos to the gallery: resize, thumbnail, watermark, and update photos.yml.
#
#   ./add-photos.sh ~/Pictures/shoot/*.JPG    process and add
#   ./add-photos.sh                           verify only
#
# Originals are never modified; they stay outside the repo.
#
# Thumbnails are cut from the full before the watermark goes on, so the mark never
# scales down to mush. BSD awk cannot take a multi-line -v value, hence the getline.
set -eu
cd "$(dirname "$0")"

WATERMARK='© Jasper Dijkstra'
FONT=/System/Library/Fonts/Supplemental/Arial.ttf

command -v magick >/dev/null || { echo "ImageMagick missing: brew install imagemagick" >&2; exit 1; }
mkdir -p images/fulls images/thumbs
[ -f photos.yml ] || { echo "photos.yml is missing" >&2; exit 1; }

for src in "$@"; do
    name=$(basename "$src")
    magick "$src" -resize 1024x -quality 88 "images/fulls/$name"
    magick "images/fulls/$name" -resize 512x -quality 85 "images/thumbs/$name"
    magick mogrify -font "$FONT" -gravity southeast \
        -pointsize 22 -fill '#00000080' -annotate +19+13 "$WATERMARK" \
        -pointsize 22 -fill '#ffffffd0' -annotate +18+14 "$WATERMARK" \
        "images/fulls/$name"
    if ! grep -Fq "photo: /images/fulls/$name" photos.yml; then
        cat >> photos.yml <<EOF
  - thumbnail: /images/thumbs/$name
    photo: /images/fulls/$name
    tags: []
    description: ""
    location: ""
EOF
    fi
    echo "added $name"
done

npm run build
echo "ok: $(ls images/fulls | wc -l | tr -d ' ') photos generated from photos.yml"
