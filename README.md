<div align="center">
  <a href="https://www.sastra.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://www.sastra.dev/assets/wordmark-white.png">
      <source media="(prefers-color-scheme: light)" srcset="https://www.sastra.dev/assets/wordmark-black.png">
      <img alt="Sastra" src="https://www.sastra.dev/assets/wordmark-black.png" width="350">
    </picture>
  </a>
  <p><strong>An easy and lightweight web visual novel engine.</strong></p>
  <p>
    <a href="https://www.sastra.dev">Website</a> •
    <a href="https://www.sastra.dev/docs/">Documentation</a> •
    <a href="https://www.sastra.dev/download">Download</a> •
    <a href="https://www.sastra.dev/changelog">Changelog</a> •
    <a href="https://www.sastra.dev/extras">Extras</a>
  </p>
</div>

Sastra is a visual novel engine that runs in the browser. The whole engine is one file, `index.html`, with no build step and no dependencies. You write your story in YAML, drop your art and audio into folders, and open it in a browser.

```yaml
- bg: "backgrounds/platform.webp"

- play: "music/quiet_night.mp3"
  loop: true

- show: character
  pos: center

- character: "The last train leaves at midnight."

- character: "Are you coming with me?"
```

## Quick start

1. **[Download the latest release](https://github.com/MrKrysion/Sastra/releases/latest)** (`Sastra-Template-<version>.zip`) and unzip it, or clone this repo.
2. Serve the folder over `http://`. The easiest way is the **Live Server** extension for VS Code: open `index.html` and click *Go Live*. Or, from a terminal in the folder:
   ```
   python -m http.server 8000
   ```
   then open `http://localhost:8000/index.html`.
3. Edit `config.yaml` and the files in `chapters/`. Save, refresh, play.

> The engine can't run from a `file://` address. Browsers block a page opened that way from loading its chapters and assets, so a local server is required. The [Getting Started](https://www.sastra.dev/docs/#getting-started) guide walks through it.

## What's in this repo

This repo **is** the template: the engine plus a sample project, exactly what the release ZIP contains.

| Path | What it is |
|------|------------|
| `index.html` | The engine. One file: HTML, CSS, and JavaScript. |
| `config.yaml` | Your game's title, chapter list, languages, colours, and fonts. |
| `chapters/` | Your story, one YAML file per chapter. |
| `avatars/`, `backgrounds/`, `sprites/`, `images/`, `music/`, `sounds/`, `videos/` | Your assets. |
| `lang/` | Optional interface [language packs](https://www.sastra.dev/extras). English is built in. |
| `LICENSE.txt` | GPL-3.0 with the Game Data & Asset Exception. |
| `ASSETS-LICENSE.txt` | Terms for the sample artwork (see below). |

## Features

- Dialogue, narration, stacked and split-screen conversations, with a typewriter effect and a scrollback log
- Backgrounds, crossfades, looping video backgrounds, full-screen CGs
- Sprites with positioning, movement, and expression swaps
- Music and sound effects with fades and separate volumes
- Checkpoints, automatic progress saving, and resume
- Chapter title cards and end screens
- Multi-language stories with a built-in switcher, plus interface language packs
- Fully themeable: colours and fonts from `config.yaml`, including custom web fonts
- Works offline. The engine makes no network requests.

## Documentation

Everything is at **[sastra.dev/docs](https://www.sastra.dev/docs/)**, written for people with no coding background.

## Extras

- **[Sastra Compressor](https://github.com/MrKrysion/Sastra-Compressor)**: a Windows app that compresses your images, audio, and video for the web.
- **[PWA starter kit, analytics add-on, and language packs](https://www.sastra.dev/extras)**.

## Reporting problems

Found a bug or have an idea? [Open an issue](https://github.com/MrKrysion/Sastra/issues/new/choose). See [CONTRIBUTING.md](CONTRIBUTING.md) before sending code.

## Licence

The **engine** (`index.html`) is licensed under the **GNU GPL v3** with a **Game Data & Asset Exception**: your story, art, music, and characters stay yours, including for commercial games. If you modify the engine itself and distribute it, the modified engine must stay GPL. Full text in [`LICENSE.txt`](LICENSE.txt); plain-English summary at [sastra.dev/license](https://www.sastra.dev/license).

The **sample character art and Sastra logo** in this template are copyrighted and **not** covered by the GPL. They're included only so the template runs out of the box. Replace them before you publish a game. See [`ASSETS-LICENSE.txt`](ASSETS-LICENSE.txt).

Sastra™ and the Sastra logo are trademarks of Ken "Krysion" Nisaka.

---

Made by [Krysion](https://www.krysion.com).
