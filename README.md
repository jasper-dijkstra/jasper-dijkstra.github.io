# jasper-dijkstra.github.io

Photo portfolio at <https://jasper-dijkstra.github.io/>. Plain static HTML served by GitHub Pages.
Only a version tag deploys the site. 

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

## Image optimization

`npm install` enables the repository pre-commit hook. The hook recompresses staged JPEG files before
each commit: full-size images in `images/fulls/` use a maximum width of 1024 px at quality 88, and
thumbnails in `images/thumbs/` use 512 px at quality 85. It stages the optimized files automatically.

Run this once if Git hooks are not active after cloning:

```sh
npm run setup-hooks
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

## Windows

Install Git for Windows, Node.js LTS, and ImageMagick. In PowerShell, run:

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install ImageMagick.ImageMagick
```

Restart the terminal after installation. Run the following commands in **Git Bash** or the VS Code
terminal set to Git Bash. Git Bash provides the `sh` runtime for the photo importer and pre-commit
hook.

```sh
npm install
npm run setup-hooks
```

Import photos with a Git Bash path:

```sh
./add-photos.sh /c/Users/your-name/Pictures/shoot/*.JPG
```

Build metadata and styles after editing `photos.yml`:

```sh
npm run build
```

Preview the site from PowerShell or Git Bash if Python is installed:

```sh
py -m http.server 4000
```

Open <http://localhost:4000>. The `.gitattributes` file keeps hook scripts in LF format because
Git Bash cannot run scripts with Windows CRLF line endings.

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

## Deployment

Set **Settings > Pages > Source** to **GitHub Actions** once. Regular pushes do not publish the
site. Create a version commit and tag from a clean branch, then push it:

```sh
npm run release -- minor
git push --follow-tags
```

Use `patch`, `minor`, `major`, or an exact version such as `1.1.0`. The `v` tag created by `npm
version` starts the GitHub Pages deployment. Use the **Actions** tab to run the workflow manually
only when needed.

## Credit

Built on the [photography](https://github.com/rampatra/photography) template by Ram Patra, design by
[AJ](https://twitter.com/ajlkn). Used under GPL-3.0; this repo carries the same licence. The original
is a Jekyll theme — this copy renders the same markup as static HTML instead. Upstream is available as
the `upstream` remote.
