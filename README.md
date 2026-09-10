# jasper-dijkstra.github.io

Personal site. Plain HTML and CSS, no build step, no dependencies.

## Local preview

```bash
python3 -m http.server -d . 8000   # then open http://localhost:8000
```

## Add a project card

Copy an `<li>` inside `<ul class="cards">` in `index.html`. Drop the `<a>` when the repo is private.

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
