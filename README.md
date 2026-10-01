# daddy-cull.turalali.com

The landing page for [Daddy, Cull!](https://github.com/tural-ali/daddy-cull), served by GitHub Pages from `main`.

It is plain HTML, CSS and JavaScript, with no build step.
Open `index.html` through any static server to try it, such as `python3 -m http.server`.

There are no screenshots: `site.js` draws every scene in the app's look, with made-up landscapes for photos and example names and numbers.
Each scene plays while it is on screen, and shows one still moment instead when the reader asks for less motion.
The icons are Material Symbols, under the Apache licence in `images/MATERIAL-SYMBOLS-LICENSE.txt`, inlined as a sprite in `index.html`.
The typeface is Google Sans Flex, under the SIL Open Font Licence in `fonts/OFL.txt`, cut down to Latin and to the weights and widths the page uses.

What's new is written from the app's history by `tools/whats_new.py`, between the `whats-new` markers in `index.html`.
Each `feat:` commit on the app's `main` is a version, numbered as the app's releases are, and the newest ten are listed.
The What's new workflow runs it every hour and commits the page when a new version has come out; it can also be run by hand from the Actions tab, or locally with `python3 tools/whats_new.py path/to/daddy-cull`.
