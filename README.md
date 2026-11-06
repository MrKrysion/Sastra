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

1. **[Download the latest release](https://github.com/MrKrysion/Sastra/releases/latest)** (`Sastra-Template-<version>.zip`) and unzip it. It holds the engine and a small sample project.
2. Serve the folder over `http://`. The easiest way is the **Live Server** extension for VS Code: open `index.html` and click *Go Live*. Or, from a terminal in the folder:
   ```
   python -m http.server 8000
   ```
   then open `http://localhost:8000/index.html`.
3. Edit `config.yaml` and the files in `chapters/`. Save, refresh, play.

> The engine can't run from a `file://` address. Browsers block a page opened that way from loading its chapters and assets, so a local server is required. The [Getting Started](https://www.sastra.dev/docs/#getting-started) guide walks through it.

## What's in this repo

This is the engine's source. To make a game, use the release download above: it is `index.html` plus the contents of `template/`.

| Path | What it is |
|------|------------|
| `index.html` | The engine, with its comments. One file: HTML, CSS, and JavaScript. The file in a release has the comments removed. |
| `template/` | The starter project the release zip is built from: `config.yaml`, a sample chapter, empty asset folders, and the licence files. |
| `lang/` | Interface [language packs](lang/README.md), one JSON file per language. English is built in. |
| `plugins/` | The official [plugins](plugins/README.md): the Screens plugin and the Google Analytics plugin. |
| `skins/` | The official [skins](skins/README.md), and a blank starter skin to copy. |
| `docs/ARCHITECTURE.md` | How the engine is put together. Read it before changing the code. |
| `CHANGELOG.md` | Every release. |
| `LICENSE` | The GNU GPL v3. |
| `LICENSE-EXCEPTION.txt` | The Game Data & Asset Exception, which keeps your games yours. |
| `ASSETS-LICENSE.txt` | What the GPL does not cover: the logo and the skin previews. |
| `THIRD-PARTY-NOTICES.md` | The licences of the code and icons bundled in the engine. |

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
- **[Plugins, the PWA starter kit, and language packs](https://www.sastra.dev/extras)**.

## Reporting problems

Found a bug or have an idea? [Open an issue](https://github.com/MrKrysion/Sastra/issues/new/choose). See [CONTRIBUTING.md](CONTRIBUTING.md) before sending code.

## Licence

The **engine** (`index.html`) is licensed under the **GNU GPL v3** with a **Game Data & Asset Exception**: your story, art, music, and characters stay yours, including for commercial games. If you modify the engine itself and distribute it, the modified engine must stay GPL. Full text in [`LICENSE`](LICENSE) and [`LICENSE-EXCEPTION.txt`](LICENSE-EXCEPTION.txt); plain-English summary at [sastra.dev/license](https://www.sastra.dev/license).

Two things are **not** covered by the GPL, and [`ASSETS-LICENSE.txt`](ASSETS-LICENSE.txt) spells out both:

- The **Sastra logo** is copyrighted and trademarked. You can keep it as it comes, or delete or replace it, but don't modify or recolour it.
- The **preview pictures** in `skins/` show Sastra's sample characters and are all rights reserved. The skins themselves are GPL.

The placeholder avatar and backgrounds in the template are free to use.

Sastra™ and the Sastra logo are trademarks of Ken "Krysion" Nisaka.

---

Made by [Krysion](https://www.krysion.com).
