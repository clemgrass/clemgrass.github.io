# clemgrass.github.io

Portfolio of games and game systems I've built. Astro static site, deployed to
GitHub Pages on every push to `main`.

## Adding a game

1. Copy `docs/game-template/` to `src/content/games/<slug>/`.
2. Fill in the frontmatter of `index.md`. Every field is documented inline.
3. Optional media:
   - Cover image: `src/content/games/<slug>/cover.png`, then set
     `media.cover: ./cover.png`.
   - Gameplay clip: `public/games/<slug>/clip.webm`, then set
     `media.clip: /games/<slug>/clip.webm`.
   - With neither, the row renders a placeholder. That is a supported state.
4. `git push`.

The schema validates the frontmatter during the build. A bad entry fails the
build instead of publishing a broken row.

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build, validates all content
npm test             # schema, ordering and link-extraction tests
npm run check:links  # verify external links resolve (run after build)
```
