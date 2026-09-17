# films

The project cards on `/projects` are not screenshots and not React components. Each one is a
short hand-drawn film: every frame is drawn in JavaScript on a plain Canvas 2D at 12 fps, then
rendered to a small looping mp4 with a still for the card to show at rest.

Built on the [`hand-drawn-canvas-animation`](https://github.com/superalesha/tools) skill.
`core.js` is that skill's core, copied here and never edited. `kit.js` is this site's own
vocabulary on top of it.

```
films/
  core.js        the skill's core: palettes, finishes, marks, lattices, motifs, camera, timeline
  kit.js         this site's kit: looks, shapes, puppets, riso plates, transitions, writeOn
  <slug>.html    one film per project, named after its slug in src/data/projects.ts
  film.css       the page chrome for the in-browser player
  render.mjs     the skill's single-film renderer (grid sheets, spot frames)
  build.mjs      the batch build that writes the site's assets
  out/           grid sheets, contact sheets, frame dumps (not committed)
```

## Building

```bash
source films/env.sh          # Windows: puts Chrome and ffmpeg where the scripts look
node films/build.mjs         # every film; or: node films/build.mjs cursors argus
```

Each film produces:

| output | what it is |
|---|---|
| `public/projects/films/<slug>.mp4` | the card loop, 12 fps drawn, packed to 24 |
| `public/projects/films/<slug>.webp` | the still the card shows until it is hovered |
| `src/data/project-films.json` | the manifest the card component reads |
| `films/out/<slug>-contact.jpg` | two tiles a second, for reviewing the cut |
| `films/out/_posters.jpg` | every still on one sheet, for judging the grid as a set |

While drawing a film, look at a grid sheet first — it is a couple of seconds instead of a full
render:

```bash
node films/render.mjs films/cursors.html --grid 24 --ar 4:3 --width 720
node films/render.mjs films/cursors.html --only 0,24,47 --ar 4:3 --width 720
```

Opening `films/<slug>.html` in a browser gives the skill's own player: scrub, play, export.

## Writing a film

A film is one file. It picks a look and a palette, defines its puppets and scenes, and calls
`portfolioFilm`:

```js
portfolioFilm({
  look: 'ink',            // ink | screen | riso | pencil — line and finish weights
  palette: PAL_MINE,      // its own palette, never shared with another film
  poster: 4.6,            // seconds: the frame the card shows at rest
  crf: 27,                // optional: films whose whole frame moves need a higher crf
  beats: [ { name: 'hero', dur: 1.8, fn: sceneHero }, ... ],
});
```

Rules that matter here, beyond the skill's own:

- **Every film is its own piece.** Its own palette, background, signature move and way of
  showing the project's name. No shared end card, no house transition. The grid should look
  like a set of prints by one hand, not one template filled in 49 times.
- **It reads at 330 px.** That is how wide a card is. One subject per shot, outlines 4 to 6
  units, lettering 120 units and up.
- **The name is the ending, and it belongs to the scene**: painted on the hull, sprayed on the
  shutter, typed at the prompt, spelled by the tiles. Never a year, never a title card.
- **Texture only over what is on screen.** `tex()` lays a dot screen over the box you give it.
  A world-sized box is a quarter of a million dots a frame; it is also what made two films
  time out before they ever drew. Pass the visible rectangle.
- **A moving frame costs bitrate.** A dot screen that travels with the camera gives the encoder
  a new picture every twelfth of a second. Those films use flat fills for the big areas and
  keep the texture on what holds still; if they are still heavy, raise `crf`.
- **Scenes drawn into a layer must call `resetT(c)` first.** A layer's context starts in output
  pixels, not logical units, so a scene that forgets it draws at the wrong scale.
