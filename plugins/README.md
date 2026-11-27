# Plugins

The official Sastra™ plugins. A plugin is one `.js` file that adds something to the engine without touching `index.html`. Copy the file into your game folder and list it in `config.yaml`:

```yaml
plugins:
  - plugins/sastra-screens.js
```

| File | What it adds |
|------|--------------|
| `sastra-screens.js` | The `screen:` event: hand the story over to an interactive HTML page (a phone or computer desktop, a puzzle, a minigame). Building one is covered in [HTML-SCREENS.md](HTML-SCREENS.md). |
| `sastra-analytics.js` | Google Analytics with a built-in cookie consent banner. Nothing loads until the player accepts. |
| `sastra-checker.js` | The story checker: open a chapter with `?check` on your own computer and it plays through every path, then lists mistakes, missing files, endings no path reaches, options that never show, and loops with no way out. Does nothing on a published game. Needs Sastra 2.1. |
| `sastra-effects.js` | Text effects written as tags in a line (`<shake>`, `<wave>`, `<color red>`, `<big>`, `<small>`, `<pause 1>`) and screen effects as events (`shake:`, `flash:`, `blur:`, `zoom:`, `vignette:`). The screen effects move only the picture, never the buttons or the dialogue box. Needs Sastra 2.1. |

Plugins need Sastra 2.0 or newer; each declares the engine version it needs and the game tells you if yours is older. How to write your own is in the [plugin guide](https://www.sastra.dev/docs/dev/plugin-api).

Each plugin has its own version, in its `SASTRA.plugin()` definition, and updates separately from the engine. They are under the same licence as the engine (see `LICENSE` and `GAME-ASSET-EXCEPTION.txt` in the repository root). Download them from the [Extras page](https://www.sastra.dev/extras).
