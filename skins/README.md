# Skins

The official Sastra™ skins. A skin is a folder with a `skin.css` that restyles the engine beyond theme colours and fonts. Copy the folder into your game and point to it in `config.yaml`:

```yaml
skin: skins/my-skin/
```

Skins need Sastra 2.0 or newer. Each skin has its own version, in its `skin.json`, and updates separately from the engine. What a skin can change (variables, classes, page markers, icons) is in the [skin guide](https://www.sastra.dev/docs/#skins).

## Layout

```
skins/
├── starter/            a commented blank skin to copy
│   ├── skin.css
│   └── skin.json
└── <name>/             one folder per skin, lowercase with hyphens
    ├── skin.css        the styles (required)
    ├── skin.json       name, author, version, description, colors, settings
    ├── README.md       how to install it, and its colours and settings (required)
    ├── preview.webp    a 16:9 screenshot of the chapter menu or a dialogue scene (required)
    ├── fonts/          fonts the skin loads (optional)
    ├── images/         pictures the skin uses (optional)
    └── LICENSE.txt     only if its files are under a different licence than the repository
```

Paths inside `skin.css` (`url(…)`) are relative to `skin.css`.

## `skin.json`

Sastra ignores this file; tools such as Sastra Studio and the Extras page read it.

```json
{
  "name": "Paper",
  "author": "Ken Nisaka",
  "version": "1.0.0",
  "description": "A warm, light skin with square corners.",
  "requires": "2.0",
  "colors": { "mint": { "label": "Mint", "default": "#bdf0dc" } },
  "settings": { "paperGrain": { "label": "Paper texture", "type": "boolean", "default": true } }
}
```

`colors` and `settings` are optional and list what the skin offers beyond the eight theme colours, for tools. Writers set them under `theme: colors:` and `skinSettings:`, and read about them in the skin's `README.md`.

## Rules for an official skin

- Use the variables, classes, and markers in the guide, and nothing else from the engine's internals. A skin that sticks to them keeps working when Sastra updates.
- Set your defaults on the eight theme colours and build the rest from them, so `theme:` recolours the skin. A writer's theme colours win over a skin's.
- Stay readable with `screenDim: false`, using `.full-screen-overlay--no-dim`.
- Describe every colour and setting in `README.md`, with a table and an example.
- Check it on the chapter menu, the start screen, dialogue (single, multi, narration, conversation), the pause menu with a few checkpoints, the log, an end screen, and a phone held sideways.
- Fonts and images need a licence that lets people use and redistribute them with their game. Say where they came from in `LICENSE.txt`.
- Put a short comment at the top of `skin.css`: what the skin is, and which Sastra version it was made for.

## Testing one

Copy the folder to `Project/skins/<name>/`, add `skin: skins/<name>/` to `Project/config.yaml`, and serve `Project/` over `http://`. Remove both again when you're done.

Skins are under the same licence as the engine (see `LICENSE.txt` in the repository root), except the `preview.webp` pictures, which are all rights reserved because they show Sastra's sample characters. They are only here to show what each skin looks like, and the download ZIPs leave them out. The [Extras page](https://www.sastra.dev/extras) reads them live from this repository: `Tools/publish.py` writes `skins/index.json` from the folders, and the page builds each ZIP in the browser. So a new skin appears once `Repo/` is pushed, with no website deploy.
