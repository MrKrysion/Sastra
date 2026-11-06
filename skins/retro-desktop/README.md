# Retro Desktop

A nineties computer: bevelled windows, a taskbar, a boot screen, and dialogue in title-barred windows. The top bar moves to the bottom of the screen. Needs Sastra 2.0 or newer.

## Install

1. Copy the `retro-desktop` folder into a `skins` folder in your game.
2. Add this to `config.yaml`, at the top level:

```yaml
skin: skins/retro-desktop/
```

## Colours

Set any of these under `theme:` in `config.yaml`. Leave one out to keep its default.

| Key | What it colours | Default |
|-----|-----------------|---------|
| `accent` | Title bars and highlights | `#000080` |
| `text` | Most text | `#000` |
| `mutedText` | Secondary text | `#444` |
| `pageBackground` | The desktop, behind the chapter menu and loading screen | `#008080` |
| `panelBackground` | Window bodies and buttons (the bevels follow it) | `#c0c0c0` |
| `dialogueBackground` | The text fields inside dialogue windows | `#fff` |
| `success` | Success marks | `#008000` |
| `error` | Error marks | `#a00000` |
| `titlebarEnd` | The right end of the title bars | A lighter blue worked out from `accent` |

A character's `color:` sets the small square in their title bar.

## Settings

Set these under `skinSettings:`, at the top level of `config.yaml`.

| Key | What it does | Default |
|-----|--------------|---------|
| `bootScreen` | Set `false` to replace the boot text with a plain start screen | `true` |
| `snapWindows` | Set `false` to fade between dialogue windows instead of cutting | `true` |

## Example

```yaml
skin: skins/retro-desktop/
skinSettings:
  bootScreen: false
theme:
  colors:
    accent: "#7a1fa2"
    titlebarEnd: "#ff8800"
```
