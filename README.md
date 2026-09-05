# Steam Artwork Generator

Makes the artwork Steam actually wants for your library — capsule,
header, hero, small capsule, logo — starting from a game's real store
art instead of a blank canvas. Search the game, it pulls the real
capsule/header/hero images and the title, then you skin it with a
neon/glow layer editor and export PNGs (or a looping GIF if you want
the animated version).

Started as a fork of an old CSS demo that only did one hardcoded neon
text effect with no way to save the result. Rebuilt it into an actual
tool: real Steam lookup, all five artwork sizes, a proper layer stack
(background / gradient / glow / text / grain / vignette, each on its
own toggle), and PNG + GIF export.

## Layers

- **Background image** — the art pulled from Steam (or upload your own)
- **Gradient overlay** — two colors, angle, blend mode, optional slow rotation
- **Glow** — colored bloom behind the text, pulses
- **Neon text** — your title, any of the bundled SF Pro weights, blurred ghost copy behind the crisp text
- **Grain** — film grain, adjustable size/intensity
- **Vignette** — darkened edges

Every layer is independent — turn any of them off, tweak the rest.
5 built-in presets to start from, and you can save your own.

## Running it

```
npm install
npm run dev
```

Everything works offline except the game search box, which hits two
tiny serverless functions in `/api`. Those only run under Vercel, so
if you want search working locally too, use `vercel dev` instead of
`npm run dev`. Otherwise just deploy it and it works.

```
npm run build   # type-check + production build
npm run test    # unit tests
```

## Deploying

```
vercel deploy --prod
```

`vercel.json` handles the SPA routing, the two API functions get
picked up automatically.

## Why the image proxy exists

Steam's CDN doesn't send CORS headers, so an `<img>` tag showing the
art works fine but the moment you try to export it (canvas
`toBlob`/`toDataURL`), the browser blocks it as a tainted canvas.
`api/image-proxy.ts` just re-fetches the image server-side and adds
the CORS header back so export actually works.

## Not trying to do

Doesn't touch your actual Steam install — you download the PNG/GIF
and drop it in the grid folder yourself. No AI-generated art either,
backgrounds come from real store assets.
