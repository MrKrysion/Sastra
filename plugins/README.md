# Plugins

The official Sastra plugins. A plugin is one `.js` file that adds something to the engine without touching `index.html`. Copy the file into your game folder and list it in `config.yaml`:

```yaml
plugins:
  - plugins/sastra-screens.js
```

| File | What it adds |
|------|--------------|
| `sastra-screens.js` | The `screen:` event: hand the story over to an interactive HTML page (a phone or computer desktop, a puzzle, a minigame). Building one is covered in [HTML-SCREENS.md](HTML-SCREENS.md). |
| `sastra-analytics.js` | Google Analytics with a built-in cookie consent banner. Nothing loads until the player accepts. |

Plugins need Sastra 2.0 or newer; each declares the engine version it needs and the game tells you if yours is older. How to write your own is in the [plugin guide](https://www.sastra.dev/docs/#plugin-api).

They are released together with the engine, under the same licence (see `LICENSE` and `LICENSE-EXCEPTION.txt` in the repository root). Copies for download are on the [Extras page](https://www.sastra.dev/extras).
