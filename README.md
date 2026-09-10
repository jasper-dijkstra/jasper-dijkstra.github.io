# jasper-dijkstra.github.io

Personal site. Plain HTML and CSS, no build step, no dependencies.

Visit the page at: https://jasper-dijkstra.github.io/

## Local preview

```bash
python3 -m http.server -d . 8000   # then open http://localhost:8000
```

## Add a project card

Copy an `<li>` inside `<ul class="cards">` in `work.html`. Drop the `<a>` when the repo is private.

## Add a photo album

1. Copy `photography/ameland.html` to `photography/slug.html`, replace the title and placeholders with
   real `<img>` tags (upload the image files to the repo first, e.g. under `photography/slug/`).
2. Add a tile to `<ul class="album-tiles">` in `photography/index.html`, and optionally to the
   photography section in `index.html`.

## Add a post

1. Copy `blog/2026-09-10-hello.html` to `blog/YYYY-MM-DD-slug.html`.
2. Replace the title, date and body.
3. Add an `<li>` at the top of `<ul class="posts">` in `blog/index.html`.

Once this gets tedious — roughly ten posts in — move to a generator such as Astro.

## Deploy

GitHub Pages serves `main` from the repo root; pushing publishes. `.nojekyll` stops Pages running Jekyll
over the files.

For Vercel: import the repo, framework preset "Other", output directory = root. No config file needed.
Both hosts can serve the repo at the same time; a custom domain has to point at one of them.
