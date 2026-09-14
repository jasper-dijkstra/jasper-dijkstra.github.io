# jasper-dijkstra.github.io

Photo portfolio at <https://jasper-dijkstra.github.io/>. Plain static HTML served by GitHub Pages.
Only a version tag deploys the site.

## 1. How to install

Clone the repository, then install the project dependencies and enable the image-optimization hook.

### macOS and Linux

Install Node.js LTS and ImageMagick. On macOS with Homebrew:

```sh
brew install node imagemagick
```

On Linux, install the same tools with the system package manager. For example, on Ubuntu or Debian:

```sh
sudo apt install nodejs npm imagemagick
```

Then run:

```sh
npm install
npm run setup-hooks
```

### Windows

Install Node.js LTS and ImageMagick in PowerShell:

```powershell
winget install OpenJS.NodeJS.LTS
winget install ImageMagick.ImageMagick
```

Restart the terminal. Use Git Bash, or a VS Code terminal set to Git Bash, for the following
commands. Git Bash provides the `sh` runtime used by the photo importer and pre-commit hook.

```sh
npm install
npm run setup-hooks
```

The `.gitattributes` file keeps the shell scripts in LF format because Git Bash cannot run scripts
with Windows CRLF line endings.

`npm install` also enables the pre-commit hook. Before each commit, it recompresses staged JPEGs:
full images in `images/fulls/` use a maximum width of 1024 px at quality 88, and thumbnails in
`images/thumbs/` use 512 px at quality 85.

## 2. Adding photos

Keep camera originals outside the repository. Import them with:

```sh
./add-photos.sh ~/Pictures/some-shoot/*.JPG
```

On Windows in Git Bash, use a path such as:

```sh
./add-photos.sh /c/Users/your-name/Pictures/shoot/*.JPG
```

The script creates a resized and watermarked full image in `images/fulls/`, a gallery thumbnail in
`images/thumbs/`, adds its paths to `photos.yml`, and builds the browser data file.

Edit every photo's tags, description, and location in `photos.yml`:

```yaml
photos:
  - thumbnail: /images/thumbs/IMG_2618.JPG
    photo: /images/fulls/IMG_2618.JPG
    tags: [wadden, landschap]
    description: A short description of the photo.
    location: Terschelling, Netherlands
    camera: Canon EOS 250D
    objective: EF-S 18-55mm
    aperture: f/4
    shutter_speed: 1/100 s
    iso: ISO 400
```

  Tags determine the categories on `werk.html`. Current categories are `abstract`, `landschap`,
  `detail`, `urban`, and `wadden`. The `camera`, `objective`, `aperture`, `shutter_speed`, and `iso`
  fields are optional. They display below the full-size photo with its description and location.

  After editing `photos.yml`, run:

```sh
npm run build
```

Re-running on a photo that is already in `images/fulls/` regenerates it from the original, so the
watermark is never stamped twice. Remove a photo by deleting both its files and deleting its entry
from `photos.yml`.

  ## 3. Local preview / testing

  Build the gallery data and CSS first:

  ```sh
  npm run build
  ```

  On macOS or Linux, start a local server:

```sh
python3 -m http.server 4000
```

  On Windows, run this in PowerShell or Git Bash when Python is installed:

  ```powershell
  py -m http.server 4000
```

  Open <http://localhost:4000>. Do not open `index.html` directly from disk because the site uses
  root-relative asset paths.

  ## 4. Deploying a new version

  Set **Settings > Pages > Source** to **GitHub Actions** once. Regular pushes do not publish the
  site. From a clean branch, create a version commit and tag, then push it:

```sh
  npm run release -- patch
git push --follow-tags
```

  Use `patch`, `minor`, `major`, or an exact version such as `0.0.2`. The `v` tag created by `npm
  version` starts the GitHub Pages deployment. The deployment checks that the tag and `package.json`
  versions match.


## Credits
This site began with the [photography](https://github.com/rampatra/photography)
Jekyll template by Ram Patra, based on the Multiverse design by
[AJ](https://twitter.com/ajlkn). It has since been converted to a static site
  and substantially customized.
