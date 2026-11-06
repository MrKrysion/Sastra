# Pastel

Candy colours, sticker avatars, washi tape, and puffy buttons. Needs Sastra 2.0 or newer.

## Install

1. Copy the `pastel` folder into a `skins` folder in your game.
2. Add this to `config.yaml`, at the top level:

```yaml
skin: skins/pastel/
```

## Colours

Set any of these under `theme:` in `config.yaml`. Leave one out to keep its default.

| Key | What it colours | Default |
|-----|-----------------|---------|
| `accent` | Main buttons, titles, and every pink | `#ff6da5` |
| `text` | Most text | `#4b3560` |
| `mutedText` | Secondary text | `#80699a` |
| `pageBackground` | The loading screen | A pale tint of `accent` |
| `panelBackground` | Pop-ups, the chapter menu, and the pause list | `#fffaf5` |
| `dialogueBackground` | The dialogue bubbles | `#fffaf5` |
| `success` | Success messages | `#7fe0b8` |
| `error` | Error messages | `#ff8f8f` |
| `mint` | Candy colour: top-bar buttons, chapter tiles, and washi tape | `#bdf0dc` |
| `lemon` | Candy colour: top-bar buttons, chapter tiles, and narration notes | `#fff0a8` |
| `lilac` | Candy colour: secondary buttons, top-bar buttons, and chapter tiles | `#d9c8ff` |
| `sky` | Candy colour: top-bar buttons, chapter tiles, and screen backgrounds | `#bfe4ff` |

A character's `color:` tints their name tag.

## Settings

Set these under `skinSettings:`, at the top level of `config.yaml`.

| Key | What it does | Default |
|-----|--------------|---------|
| `bobbingAvatars` | Set `false` to stop the avatars moving | `true` |

## Example

```yaml
skin: skins/pastel/
skinSettings:
  bobbingAvatars: false
theme:
  colors:
    accent: "#2a7de1"
    mint: "#c8f7a8"
```
