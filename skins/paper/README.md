# Paper

A printed novel: warm paper, serif type, a table of contents, and turned-down corners. Needs Sastra 2.0 or newer.

## Install

1. Copy the `paper` folder into a `skins` folder in your game.
2. Add this to `config.yaml`, at the top level:

```yaml
skin: skins/paper/
```

## Colours

Set any of these under `theme:` in `config.yaml`. Leave one out to keep its default.

| Key | What it colours | Default |
|-----|-----------------|---------|
| `accent` | Main buttons, ornaments, and highlights | `#8c2a22` |
| `text` | The ink | `#2b2118` |
| `mutedText` | Secondary text, like the chapter numbers | `#76644f` |
| `pageBackground` | The chapter menu, start screen, and pause screen | `#f4ecdc` |
| `panelBackground` | Pop-ups and the top bar's tabs | `#f4ecdc` |
| `dialogueBackground` | The dialogue slips | `#f4ecdc` |
| `success` | Success messages | `#4c6b3a` |
| `error` | Error messages | `#8c2a22` |

A character's `color:` sets the line under their name, and the name itself stays in the text colour.

## Settings

Set these under `skinSettings:`, at the top level of `config.yaml`.

| Key | What it does | Default |
|-----|--------------|---------|
| `paperGrain` | Set `false` to remove the paper texture | `true` |
| `crookedPlates` | Set `false` to straighten the avatars | `true` |

## Example

```yaml
skin: skins/paper/
skinSettings:
  crookedPlates: false
theme:
  colors:
    accent: "#1d5c3f"
```
