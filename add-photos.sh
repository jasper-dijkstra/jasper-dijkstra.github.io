#!/bin/sh
# Add photos to the gallery: resize, thumbnail, watermark, and update index.html.
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

for src in "$@"; do
    name=$(basename "$src")
    magick "$src" -resize 1024x -quality 88 "images/fulls/$name"
    magick "images/fulls/$name" -resize 512x -quality 85 "images/thumbs/$name"
    magick mogrify -font "$FONT" -gravity southeast \
        -pointsize 22 -fill '#00000080' -annotate +19+13 "$WATERMARK" \
        -pointsize 22 -fill '#ffffffd0' -annotate +18+14 "$WATERMARK" \
        "images/fulls/$name"
    echo "added $name"
done

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

for f in images/fulls/*; do
    n=$(basename "$f")
    printf '        <article class="thumb">\n'
    printf '            <a href="/images/fulls/%s" class="image"><img src="/images/thumbs/%s" alt="Photograph by Jasper Dijkstra" data-name="%s" /></a>\n' "$n" "$n" "$n"
    printf '        </article>\n'
done > "$tmp/tiles"

awk -v tilesfile="$tmp/tiles" '
    /tiles:start/ { print; while ((getline line < tilesfile) > 0) print line; skip = 1; next }
    /tiles:end/   { skip = 0 }
    !skip
' index.html > "$tmp/index.html" && mv "$tmp/index.html" index.html

fail=0
for f in images/fulls/*; do
    n=$(basename "$f")
    [ -f "images/thumbs/$n" ] || { echo "no thumbnail for $n" >&2; fail=1; }
    grep -q "data-name=\"$n\"" index.html || { echo "$n missing from index.html" >&2; fail=1; }
done
[ "$fail" -eq 0 ] || exit 1
echo "ok: $(ls images/fulls | wc -l | tr -d ' ') photos, thumbnails and tiles all match"
