# How the engine is put together

`index.html` is the whole engine: CSS, the static DOM, and JavaScript, in one file with no build step. This page is the map. The source comments go into the detail.

## The file

1. **Style block.** Design tokens in `:root` (colours, radii, motion, a z-index list), then components.
2. **Body.** The static DOM: the stage, every screen and overlay, `<template>`s for the log. It is looked up once at startup into `vn.elements`.
3. **Engine script.** Small helpers, shared constants, the manager classes, `VisualNovel`, and the boot code.
4. **js-yaml script.** Bundled, MIT, untouched.

Releases ship this file with every comment removed. Licence notices stay.

## Boot

`DOMContentLoaded` creates one `VisualNovel`. Its constructor builds every manager, then `loadDialogueAndAssets()` runs:

1. `ConfigManager.load()` reads `config.yaml` (or `.yml`), picks the language, merges the defaults, loads the interface strings, and applies the theme and settings.
2. `PluginManager.load()` injects the skin and the plugins listed in the config and awaits each plugin's `setup`.
3. With no `?c=` in the URL, `MenuManager.show()` draws the chapter menu. With `?c=<file>`, `loadChapter()` fetches the chapter, compiles it, preloads what it needs to start, and shows the start gate.

Entering a chapter is a full page load (`?c=`), which resets all state cheaply.

## The managers

`VisualNovel` holds the top-level state. Each manager keeps a private `#vn` and reaches the others through it.

| Class | Owns |
|-------|------|
| `SceneManager` | The game loop: showing active scenes, running passive ones, jumps, restores, asset gating. |
| `ScriptCompiler` | Chapter YAML to the flat scene list, with every authoring error caught and located. |
| `DialogueManager` | Single, multi, narration, and conversation rendering; the typewriter. |
| `SpriteManager`, `StageManager` | Sprites; backgrounds, full-screen media, video. |
| `AudioManager` | Tracks routed through the Web Audio graph; fades; master volume. |
| `AssetManager` | Downloading, verifying, and evicting files; the preload window. |
| `UIManager` | Toasts, fullscreen, start gate, modals, error, title, image, and end screens. |
| `InputManager` | The click and keydown routers; the action map. |
| `ProgressManager`, `SaveManager` | Checkpoint progress; the wrapper around `localStorage`. |
| `ConfigManager`, `LanguageManager`, `I18nManager` | `config.yaml`; language blocks; the interface strings. |
| `LogManager`, `MenuManager`, `AutoplayManager` | The dialogue log; the chapter menu; autoplay. |
| `PluginManager` | Loading plugins and skins; the plugin API. |

## Scenes

Every event in a chapter compiles to a scene. A scene is **active** when it waits for the player (dialogue, image, title) or **passive** when it runs by itself (background, audio, sprites, checkpoint). Passive scenes plus the active scene they lead into form a **cluster**, and none of a cluster runs until every file it needs has loaded.

Handler maps (`#sceneRenderers`, `#passiveInstant`, `#passiveLive`) are used instead of `switch`. *Instant* handlers run without fades, to restore state after a resume or jump.

## Assets

Same-origin files are downloaded whole into memory and played from `blob:` URLs. Everything that shows or plays an asset goes through `AssetManager.url()`. Only the scenes around the player stay loaded.

## Styling hooks

- Colours and fonts are CSS custom properties (`--color-*`, `--font-*`) that `config.yaml` can set.
- Stacking is the `--z-*` list in `:root`.
- Layout state is `body[data-*]` and classes such as `body.portrait-blocked`.
- Components follow BEM modifiers (`block--modifier`).
- Hover styles live inside `@media (hover: hover)`.

## Plugins

A plugin calls `SASTRA.plugin({ name, requires, setup, events, modifiers, on, strings })`. The `api` object passed to `setup` is the supported surface. The managers themselves are reachable as `SASTRA.game` but are not a public API. The full reference is at https://www.sastra.dev/docs/.

## Working on it

- Serve the folder over `http://`. The engine refuses to run from `file://`.
- `?c=<file>` opens a chapter directly. A `- start:` event inside a chapter's `script:` discards everything before it, which is handy for testing a scene deep in a chapter.
- Mobile: chapters are landscape only; only the chapter menu works in portrait.
- No network requests at runtime, no external dependencies.
