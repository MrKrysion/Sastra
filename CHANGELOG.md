# Changelog

Every release, newest first. The same text is on https://www.sastra.dev/changelog

## 2.0.0 (2026-11-06)

### Features
- **A new look.** Every screen is redesigned: the chapter menu, start screen, dialogue boxes, pause menu, log, credits, and end screen. Games are dark by default with Sastra pink as the accent, and everything is bigger and easier to tap.
  - The chapter menu shows your logo, author, and synopsis on the left of your background, with a Start or Continue button and a progress bar on each chapter you've started. A game with a single chapter shows just the button.
  - The pause menu shows your logo, Continue, Restart, and Back to menu, next to the chapter's checkpoints. The list shows how many the player has reached and opens at where they are. Checkpoints the player hasn't reached yet show as a locked "Checkpoint", so their names don't spoil anything.
  - Pick any `accent` you like: Sastra makes the text on it white or near-black, whichever stays readable.

- **Plugins.** A plugin is a `.js` file that adds something to Sastra without touching `index.html`. List the files under `plugins:` in your `config.yaml`:

```yaml
plugins:
  - plugins/sastra-screens.js
```

Two official plugins are on the [Extras page](https://www.sastra.dev/extras): **Interactive Screens**, which adds the `screen:` event for your own HTML screens, and **Google Analytics**. If you know JavaScript, [Writing Plugins](https://www.sastra.dev/docs/#plugin-api) explains how to make your own.

Plugins can add their own keys to existing events (an effect on a line, for example), carry their own text in several languages, replace the chapter menu, start screen, pause menu, or end screen with their own design, put more than two buttons in the top bar (extras go in a "⋯" menu) and show Sastra's notifications with `api.toast()`.

- **Skins.** A skin is a CSS file that restyles the engine beyond colours and fonts. Point to it with `skin:`:

```yaml
skin: skins/my-skin.css
```

Skins can tell who is speaking and what's on screen (`[data-speaker="erika"]`, `body[data-scene]`), swap any icon for their own picture, and come as a folder with their own images and fonts (`skin: skins/paper/`). Three official skins are on the [Extras page](https://www.sastra.dev/extras): **Paper**, **Pastel**, and **Retro Desktop**. Your theme colours recolour them, and a skin can offer extra colours under `theme: colors:` and its own switches under `skinSettings:`. See [Writing Skins](https://www.sastra.dev/docs/#skins) for what you can change.

### New
- **Turn off the dim on title and end screens.** Set `screenDim: false` in `settings:` to remove the dark layer behind every title and end screen, or add `dim:` to a single one. With the dim off, make sure your text still reads over your background.

```yaml
- title: "Chapter One"
  dim: false
```

- **Turn the typewriter effect on or off for a single line.** Add `typewriter: false` to show a line all at once (a sign, a shout, a sudden cut), or `typewriter: true` to always type it out. It overrides the player's own setting for that line only.

```yaml
- narration: "BANG."
  typewriter: false
```

> In a conversation, put it under one line to change just that line, or next to `left:` and `right:` to change the whole conversation.

- **`allowProgressReset` setting.** Set it to `false` under `settings:` to hide the reset-progress button on the chapter menu.
- **Simpler config for one language.** Write your title, synopsis, and chapters at the top of `config.yaml` and name the language with `language:`. Translations only list what changes. Configs with `defaultLanguage:` and an `en:` block keep working.

```yaml
language: en
title: "My Story"
chapters:
  - name: "Chapter 1"
    file: "1"
```

- **Credits on the main menu.** Add `credits:` to your config and the menu gets a Credits button for the whole game. Credits, here or on an `end:` event, can also be a `.html` or `.txt` file.
- **Cut to a background.** Add `fade: false` to a `bg:` event to switch at once, with no crossfade.

```yaml
- bg: backgrounds/flash.webp
  fade: false
```

- **Warnings for typos.** A key Sastra doesn't use, like `postion:`, now shows a warning in the browser console with the file, event, and line. Set `strict: true` under `settings:` to make it stop the game with the error screen instead.
- **`showMadeWith` setting.** Set it to `false` under `settings:` to hide the "Made with Sastra" link on the menu.
- **Shorter chapter links.** A chapter opens at `?c=1`. Links with `?chapter=1` still work.

### Fixes & Improvements
- **Simpler theme colours.** `colors:` now has eight keys: `accent`, `text`, `mutedText`, `pageBackground`, `panelBackground`, `dialogueBackground`, `success`, and `error`. Hover shades and tints follow your `accent` automatically.

> The other eleven keys from 1.0 (like `accentHover` or `buttonBackground`) are no longer used. Your game still loads with them in place. If your `config.yaml` still has the 1.0 colours (a blue accent), delete them to get the new look.

- **Conversations between characters with the same name.** If both sides had the same display name (two "???" strangers), every line appeared on the left. Each line now goes to its speaker's side.
  - The speaker was matched by display name; lines now carry the character ID.
- **The Credits button only shows when there are credits.** An end screen without `credits:` showed a Credits button that opened an empty panel.
- **Sound no longer cuts out on phones.** On Firefox for Android, after about 30 sound effects in one chapter, every sound and song stopped playing, and the chapter could stop with a "could not be loaded" error. Every sound now plays to the end, however long the chapter is.
  - Finished one-shot tracks stayed connected to the Web Audio graph, so Firefox kept every one of them alive until it refused to open new media (`NS_ERROR_OUT_OF_MEMORY`). A track is now disconnected and unloaded when it ends, fails, or is stopped.
- **Videos no longer get stuck on phones.** On Firefox for Android, a video background could freeze partway through for about 15 seconds, sometimes until the next scene. If a video stops moving now, it picks up again from the same moment within about two seconds.
  - Firefox for Android sometimes stalls a video playing from a `blob:` URL even with the whole file in memory. If a video fires `waiting` and hasn't moved a second later, a second element loads the plain file, seeks to the same time, and replaces the stuck one.
- **`position: top` and `bottom` follow the screen size.** The text box sat a fixed 70px from the edge, which is a fifth of a phone held sideways, so `bottom` could look almost centred. The distance is now 7% of the screen height, and `top` never goes under the top bar.
- **Text and boxes scale with the screen.** Dialogue, narration, avatars, and title screens used to jump between a desktop size and a phone size. They now grow and shrink smoothly with the screen height: a bit smaller than before on phones, so more fits, and larger on big monitors.
- **The phone menu bar scrolls with the page.** On a phone held upright, the "Made with Sastra" pill and the menu buttons were pinned to the bottom of the screen over the chapter list. They now sit after the last chapter.
- **Smooth playback on slow connections.** Avatars could lag a line behind or never appear, video backgrounds stuttered, and music meant to follow straight away started late. Every file is now fully downloaded before the scene that uses it, and played from memory. If the player gets ahead of the download, the loading screen waits for it.
  - Assets counted as ready after their first frame, and playback then requested the file again. They're now fetched once into a `Blob` and played from an object URL.
- **Events before a line load together.** `stop:` and `play:` on the same event used to load separately, leaving a gap. Everything before the next line now loads first, then runs at once.
- **Continue and checkpoints wait for their files.** Resuming or jumping restored the background, sprites, and music without waiting for them to load.
- **Loading no longer stalls in a background tab.** If the game was loading while its tab was hidden, it waited until you came back.
  - Image preloading awaited `img.decode()`, which browsers hold until the page renders. It now waits for the `load` event and gives decoding a short head start.
- **Restart no longer leaves a black screen.** Restarting a chapter while the tab was in the background could leave the screen black.
  - `fadeToBlack` waited on `requestAnimationFrame`, which doesn't run in hidden tabs.
- **Fast background changes are safe.** A new background arriving within a second of the previous one could be cleared by the old fade's cleanup. The cleanup is now cancelled when the next background starts.
- **Keyboard shortcuts no longer fire while typing.** Typing in a text field (a plugin's form, for example) could mute the game or open the log.
- **The fullscreen button notices F11.** If the player went fullscreen with their browser, the button now shows the exit icon and tells them which key leaves it, since a page can't exit that kind of fullscreen itself.
- **A broken logo shows your title.** If the menu logo failed to load, the title meant to replace it didn't appear.
- **Friendly error screens.** When something stopped the game, players saw "Script error" and were told to fix a file they had never seen. Every error now shows one calm screen, "Something went wrong", with **Retry** and **Back to menu**. The message for you is under **Details**, with file names and keys in code style and a **Copy** button for bug reports. When you test on your own computer, the details open by themselves. The network error lists the files it couldn't reach.
- **A broken or missing `config.yaml` is no longer ignored.** A YAML mistake in the config, or no config at all, started the game with default settings and an empty menu. It now shows the error screen with the line that's wrong.
  - `ConfigManager.load` caught the parse error and fell through to defaults. Config and chapters now share one `.yaml`/`.yml` loader that reports parse errors with js-yaml's snippet.
- **No more black screens on unexpected errors.** An error while starting the game or drawing the menu left a black screen, with the message only in the browser console. It now shows the error screen with the technical details.
- **A damaged sound no longer stops the story.** If a song or sound can't be played, the story carries on without it, and the browser console names the file. Missing files, and damaged images or videos, still show the error screen.
- **"Local server required" is shorter.** It says what to do in one sentence, and **Learn more** opens the setup steps in the Sastra docs.
- **Games without analytics stay quiet.** They no longer request a missing `sastra-analytics.js` on every load. Games set up the 1.0 way, with the file next to `index.html` and an `analytics_id`, keep working.
- **The template's sample avatar is a plain placeholder.** It is free to use, and the sample chapter's speaker is now `character` ("Character"). Replace both with your own.
- **Clearer rules for the Sastra™ logo.** The template's licence notice now says what you may do without asking: keep the logo in your published game, delete or replace it, or show it unchanged to refer to Sastra. Editing or recolouring it, or using it for products or merch, needs written permission. You no longer have to replace it before you publish.
- **Interface wording in every language.** The eight language packs are reworded the way each language's everyday apps and games say things, not word for word from English, and two messages ("Couldn't copy" and the rotate-your-device notice) are clearer. The packs now live in the [Sastra repository](https://github.com/MrKrysion/Sastra/tree/main/lang), where anyone can suggest a fix or add a language, and the Extras page lists them from there. Packs already in your game keep working.

### Refactor
- Background and fullscreen image/video layers share one set of helpers, and the streaming-era video safety timers are gone now that videos play from memory.
- Icons are Font Awesome 7.3.1 shapes (plus three of Sastra's own) drawn with CSS masks, so a skin can swap any of them. They replace Fluent UI.
- The settings defaults live in one list, and the dialogue log builds its entries in one place for both play and checkpoint jumps.
- The UI strings drop nine duplicated or unused keys, and the language packs follow.
- The engine's source on GitHub is now commented for contributors. The `index.html` in a release is the same file with the comments removed, so it behaves the same and stays small.

## 1.0.0 (2026-09-16)

First public release.

Sastra is now open source on [GitHub](https://github.com/MrKrysion/Sastra).

## Closed Beta #13 (2026-09-15)

### New
- **Generic font names in `fonts:`.** You can now write the standard CSS family names — `system-ui`, `serif`, `sans-serif`, `monospace` and the rest — straight into `fonts:`, on their own or at the end of a list. They used to be quoted like a real font name, which stopped them working.

```yaml
theme:
  fonts:
    dialogue: "Georgia, serif"
    ui: system-ui
```

`sans-serif` is still added as a fallback, unless your list already ends in a generic name.

### Fixes & Improvements
- **The engine no longer needs the internet.** `index.html` used to load its YAML parser from a CDN and its default font from krysion.com, so a game with no connection — or a player behind a strict network — could fail to start or show the wrong font. Both are now built in. Nothing is fetched from anywhere but your own game folder.
  - js-yaml 4.1.0 is bundled at the end of `index.html`, after the engine script, with its MIT notice. The engine only calls `jsyaml.load()` after `DOMContentLoaded`, so the load order is safe.
- **The default font is now the player's system font.** Gabarito is no longer bundled. Leave `body:` empty under `fonts:` — the template now ships this way — and the game uses the device's standard font: Segoe UI on Windows, San Francisco on Mac and iPhone, Roboto on Android. It appears instantly and works offline.

If you want to keep Gabarito, load it like any other font:

```yaml
theme:
  customFonts:
    Gabarito: "https://fonts.googleapis.com/css2?family=Gabarito:wght@400..900&display=swap"
  fonts:
    body: "Gabarito"
```

> Your existing `body: "Gabarito"` line won't break anything, but without the `customFonts:` entry it now falls back to `sans-serif`.

- **Empty font keys fall back properly.** With `body:` left empty, `dialogue: body` used to set the dialogue font to a family literally called "body". A reference to an empty key now falls through to the engine default, the same as leaving it empty yourself.
  - `resolveVariables` tested the referenced value for truthiness; it now checks `Object.hasOwn`, so an empty key still counts as a reference target.
- **The "Made with Sastra™" pill is drawn as vector shapes.** The wordmark was SVG text set in Gabarito, so it would have changed shape once the font went. It's now a path traced from Gabarito's outlines with the font's own kerning, plus the ™ mark, and looks identical everywhere without loading a font.

### Refactor
- `formatFontFamily` quotes only non-generic names (checked against a `GENERIC_FONT_FAMILIES` set) and appends `sans-serif` only when the last entry isn't generic, replacing the old filter-and-requote.
- The two inline `|| 'Sastra'` game-title fallbacks now reuse `DEFAULT_GAME_META.title`.
- The brand is now written **Sastra™** in the page title, the licence banner, and the wordmark.

## Closed Beta #12 (2026-09-15)

### Features
- **Language packs.** The interface — buttons, menus, and messages like "Checkpoint unlocked" — used to fetch its translations from www.sastra.dev every time the game loaded, so while testing offline (or on a flaky connection) every language other than English silently fell back to English. Translations now live in your own project: download a **language pack** from the [Extras page](extras.html) and save it in a `lang/` folder next to `index.html`. English is built in, so you only need packs for the other languages you offer.

```
your-game/
└── lang/
    ├── fr-FR.json
    └── id-ID.json
```

The engine looks for `lang/<code>.json` matching the language key in your config, then the short form of that code (`fr-FR` → `fr`), and otherwise stays in English. Packs are plain JSON, so you can translate one yourself for a language we don't have yet — anything you leave out falls back to English — and an `en.json` pack overrides the built-in wording. The template ZIP now ships with an empty `lang/` folder.

> If your config uses a short key like `fr:`, rename the pack to `fr.json` or use `fr-FR:` as the key — the file name is all the engine goes by.

- **Keyboard shortcuts.** Inside a chapter, players can now press `M` to mute, `F` for fullscreen, `L` to open and close the log, `T` to toggle the typewriter effect, and `A` to toggle autoplay. Button tooltips show the key, e.g. "Mute (M)". Shortcuts respect your button settings — hiding the log button also disables `L` — and are ignored on the start screen, while a menu is open, and when a key is held down. Turn them off with a new setting:

```yaml
settings:
  enableKeyboardShortcuts: false
```

### Fixes & Improvements
- **Checkpoints replay the audio placed alongside them.** Resuming from a checkpoint restored the background, sprites, and text position, but never the music — even a `play:` written directly above the checkpoint stayed silent, so a jump could land in a scene with no soundtrack. Any audio event in the same run of passive events as the checkpoint now starts again on a jump or a Continue. Audio from earlier in the chapter is still left alone, since restarting a track that was meant to begin scenes ago would land it at the wrong moment.
  - `SceneManager.restoreSceneState()` walks back from the checkpoint to the previous active event to find where the cluster starts, and only skips `audio` scenes with an index before that. Replayed events go through the existing `#passiveInstant` handlers, so tracks start with `fade: 0`.
- **The Sastra pill on the main menu now links to www.sastra.dev** instead of the old krysion.com page.

### Under the Hood
- `I18nManager` no longer fetches `manifest.json` or a locale from a hardcoded URL. `load()` tries `lang/${code}.json` for the config key and then its primary subtag, keeps the first JSON object it gets, and otherwise uses the embedded `en-GB` strings. The manifest-based resolver, alias table, version cache-bust, `uiLocale`, `RTL_PRIMARIES`, and `directionOf()` are gone: text direction was already handled per element with `dir="auto"`, and the language-picker buttons now use it too. `MenuManager.LANG_DISPLAY_ALIAS` (`arb → ar`) went with them — the Arabic pack is simply named `ar.json`.
- A `SHORTCUTS` map (`KeyM → mute`, `KeyF → fullscreen`, …) routes key presses through `InputManager.runAction()`, so keys and buttons share the same handlers; the only new action is `log-toggle`. `#shortcutAllowed()` gates on `enableKeyboardShortcuts`, `isLoaded`, `isWaitingForStart`, `activeModal`, and the matching `show*Button` control, and modifier combinations (Ctrl/Alt/Meta) are left to the browser.
- Tooltips go through one `UIManager.setTitle(el, key)` helper that appends the button's `data-shortcut` when shortcuts are enabled. It replaces six separate `.title =` assignments across the fullscreen, volume, typewriter, and autoplay updaters, and the `data-i18n-title` attributes those buttons no longer needed. `updateFullscreenButton()` moved from the constructor into `applyGameSettings()` alongside the other control refreshes.

## Closed Beta #11 (2026-09-04)

### Fixes & Improvements
- **Sprites fade in again on Firefox.** Sprites popped straight in at full strength instead of fading, but only on Mozilla Firefox — Google Chrome and Microsoft Edge were fine, so it was easy to miss. They now fade in on every browser. Fading out was never affected.
  - A new sprite's `opacity: 0` starting style wasn't flushed before its `active` class landed one `requestAnimationFrame` later, so Mozilla Firefox coalesced both states into a single style computation and generated no transition. The reveal now waits a second frame, the same way toasts and the screen fade already do.
- **Backgrounds no longer dim as they change.** Crossfading from one background to the next dipped darker halfway through, then came back up. The new background now fades in over the old one at full brightness, so the change stays even the whole way.
  - Both layers used to animate at once — outgoing `1 → 0`, incoming `0 → 1` — and because they composite separately, the midpoint landed at roughly 75% luminance. The outgoing layer now holds `opacity: 1` beneath at `z-index: -2` while only the incoming one transitions, and its transition is cleared before it's reset so it can't fade out afterwards.
- **Re-showing a sprite right after hiding it no longer makes it vanish.** If you used `hide:` and then `show:` for the same character within about half a second, the sprite would fade in and then disappear a moment later. It now stays put.
  - `hide:` scheduled a `setTimeout` to remove the element once the fade finished, and `show:` never cancelled it. The pending removal is now tracked on the sprite and cleared by both.

## Closed Beta #10 (2026-08-22)

### Fixes & Improvements
- **`start:` now keeps your `position:` too.** The testing marker already carried the last background set before it. It skipped `position`, so jumping into a scene put the text box back in the centre no matter where you'd set it. The last `position:` before the marker is now kept as well — on a fresh run and when you resume from a checkpoint.
- **Changing `position` no longer slides the box.** Narration boxes glided to their new spot when the position changed mid-chapter. They now fade out and back in like every other line.
- **Blank lines next to credits headings show again.** Headings in a `credits:` block still sit tight against the line directly below them, so a section header reads as part of its list. But if you deliberately leave a blank line after a heading, you now get the gap you asked for.

## Closed Beta #9 (2026-08-10)

### New
- **`position:` as its own event.** The `position` override moves the text box for a single line. Now you can write `position` as a standalone event and it sets the box for *everything that follows*, until you change it again. Takes `top`, `center`, or `bottom`; leave it empty to go back to the default.

```yaml
- position: top
- narration: "The rooftop stretched out beneath a bruised sky."
- erika: "Careful. It's a long way down."
- katya: "I'd noticed."
- position:
```

A per-line `position` override still wins for that one line, and the stretch position picks up again straight after. Chapters always start centred, and resuming from a checkpoint puts the box back where it should be.

### Fixes & Improvements
- **Tighter headings in the credits panel.** A heading in a `credits:` block used to leave as much empty space below it as above, so the names under a section header floated away from it. Headings now get a gap above and none below, and blank lines around them are ignored. The same applies to headings in the dialogue history.
- **`position` and `log` now work on conversations.** Setting either one on a `conversation:` event did nothing — `position` was reset to centre on every line, and `log` was ignored when written inside the `conversation:` block. Both work now, whether you nest them under `conversation:` or put them alongside it.

> `position` is now a reserved word, so it can no longer be used as a character ID.

## Closed Beta #8 (2026-08-05)

### Fixes & Improvements
- **Narration boxes are back to their old width.** Closed Beta #7 changed how the text layers are centred, which had the side effect of letting narration boxes stretch much wider than before. They now cap at the width they had prior to #7, while keeping #7's fix that grows the box from the centre as the text types in. Dialogue and conversation boxes are unaffected.
- **`start:` keeps your background.** The testing marker used to drop you into the scene on a blank screen. It now carries over the last background set before the marker, so you see the scene the way players will.

### New
- **`from:` for `play:`.** Start a track partway in — `from: 12` skips the first twelve seconds, handy for jumping past an intro when you re-use a piece of music. Looping tracks still repeat from the very beginning.

```yaml
- play: "music/theme.ogg"
  id: "bgm"
  loop: true
  from: 12
```

## Closed Beta #7 (2026-07-23)

### Fixes & Improvements
- **Avatars no longer stretch.** In conversations (and single and multi-speaker lines), a long line of dialogue used to squash the avatars sideways as the dialogue box grew, so faces changed shape from one line to the next. Avatars now keep their exact size no matter how big the box gets.
- **Wider dialogue boxes in conversations.** Because avatars were being squashed to make room, the conversation box could never actually reach its full width. It now does, so long lines wrap less and read better.
- **Narration boxes grow from the centre.** A multi-line narration used to open at its full final height with the text typing into the top of an oversized, half-empty box. The box now starts at one line and grows as the text arrives, expanding evenly upwards and downwards and staying centred on screen the whole time — the same way dialogue boxes behave.
- **`position:` no longer leaks between scenes.** A line set to `position: top` used to leave the following lines stuck at the top too, unless they set a position of their own. Every line now sits where it should, with `center` as the default.

### Under the Hood
- Dialogue, narration and conversation layers are centred with `inset` and automatic margins instead of a percentage transform. This removes an animating transform that lagged behind the box while text was typing, and — because the layers are no longer offset by half the screen — lets each box measure itself against the full width available.
- The typewriter now reveals line breaks along with the text, rather than leaving every break in place from the first frame.

## Closed Beta #6 (2026-06-25)

### Features
- **Autoplay.** A new **Autoplay** button sits in the top-right controls. Its panel lets players turn autoplay on, choose a reading speed on a five-stop slider (Very slow → Very fast), and toggle a thin scene **progress bar** along the bottom of the screen. Autoplay advances dialogue, narration, images, blanks and videos on its own: text and images wait for a reading-length pause that scales with the chosen speed, and videos advance when the clip finishes. Hide it with `showAutoplayButton: false`.
- **`video:` event.** A new active event that plays a video clip as a featured moment — centred on screen (or fullscreen), with sound and no player controls, just like a background video. It shares the background-video options `loop` (default `true`), `volume`, and `anchor`.
- **Fullscreen images and videos.** `image:` and `video:` now take `fullscreen: true`, which makes the media cover the whole screen like a background and crossfade in and out. The scene's real background is preserved underneath and returns exactly as it was when the fullscreen moment ends. `fullscreen` defaults to `false` for both, so existing screens are unchanged.
- **`anchor:` for images and videos.** `image:` and `video:` accept the same `anchor` as backgrounds, choosing which part of a fullscreen one stays in view when it's cropped to fill the screen.

### Fixes & Improvements
- Fullscreen images and videos now **crossfade naturally**, exactly like a background — no more "pop-up", and no flicker of the background between two fullscreen scenes. Transitions to and from dialogue, and between one fullscreen scene and another, all dissolve cleanly.
- On the final chapter's end screen, **Back to Menu** is promoted to the primary button and is now sized to span the same width as the two buttons beneath it, for a tidier layout.
- The **Log** and **Credits** close buttons now show a "Close" tooltip, matching the other close buttons.
- The pause menu's click-to-dismiss area now adapts when a chapter has no checkpoints, so the empty side space is clickable.
- UI text now falls back to English when a translation is missing, instead of showing a raw key.

### Under the Hood
- Autoplay is implemented as a self-contained `AutoplayManager`: a single dwell calculator drives the timer and the progress bar, with a video path that reads the element's remaining playback time and a fixed-duration mode that speed changes leave alone.
- Fullscreen images and videos render through a second pair of background-style layers above the scene — their own crossfade "channel" — reusing the existing background-layer styling and the shared video helpers, so the real background and its asset window are never touched. The incoming fullscreen layer fades in on top of the opaque outgoing one, so a fullscreen swap never reveals the background mid-fade. A single `createVideo` helper now builds the video element for instant backgrounds, contained video screens, and the fullscreen overlay.
- The volume and Autoplay speed sliders share one `slider` style (consistent thumb, accent fill via a `--fill` variable, optional evenly-spaced tick dots), and the near-duplicate image/video screen rules were merged.

### Engine Code Refactor
- The chapter line-scan regexes in the script compiler are precompiled to static fields instead of being rebuilt inside the loop.
- The orientation-watching `ResizeObserver` is now coalesced through `requestAnimationFrame`, so a flurry of resize callbacks does at most one layout check per frame.
- CSS `contain` was added to the modal overlays and the log body, isolating their internal changes from the rest of the page's layout.
- A hot-path `transition: all` on conversation avatars was narrowed to just the properties that actually animate (`opacity` and `transform`), avoiding needless style recalculation on every line.

## Closed Beta #5 (2026-06-22)

### Fixes
- Progress is now only recorded when you reach a checkpoint or finish a chapter. Before, simply starting a chapter could make the "Reset Progress" button appear on the menu even though no checkpoint had been passed.
- A missing or mistyped asset path now shows the "Script error" screen instead of the misleading "Network error" screen, and lists the file(s) it couldn't load so you can fix the path.
- Video background audio now follows the master volume and mute controls.

### Engine Code Refactor
- Video background audio is now routed through the Web Audio graph (the same path as music and sound effects) for same-origin videos, so it respects the master volume and mute and fades via gain ramps. Cross-origin videos fall back to a `requestAnimationFrame` volume fade. Replaced the old `setInterval`-based video fade.
- Audio source and gain nodes are now disconnected when a track stops, so they no longer linger in the audio graph after playback ends.
- Asset load failures are diagnosed with a quick follow-up request that tells a genuinely missing or broken file apart from a real connection loss, so each routes to the correct error screen.
- Checkpoint progress now stores a precomputed percentage (based on position among active events) and is written only on checkpoint or chapter completion. Removed the per-scene progress writes.
- Smaller cleanups: a shared `isPlainObject` helper across the compiler, audio/video preloading folded into one `loadMediaElement`, a single reused element for `stripHtml`, image-cache eviction that releases bitmaps sooner, and a new `--color-control-bg` theme variable.

## Closed Beta #4 (2026-06-20)

### Features and Fixes
- Added the `anchor:` override for the `background:` event, letting you choose which part of background media stays in view to prevent cropping.
- Sprites can now be placed vertically too. `pos:` and `anchor:` accept a single number (sideways) or a pair (sideways then up-down), all on one 0–100 ruler where `0` is the top/left. Defaults are unchanged: sprites still stand on the floor, centred.
- `end:` events can now only be placed as the very last active event in a chapter.
- Added all necessary wirings for the Google Analytics add-on.

### Engine Code Refactor
- Deleted the `PASSIVE_SCENE_TYPES` array. The compiler now attaches `isPassive: true` directly to compiled chapter, background, audio, sprite/sprites, and checkpoint events. `AssetManager` (`collectAssets`, `preloadInitialAssets`) and `SceneManager` (`#getNextActiveSceneType`, plus the three lifecycle methods) now read `scene.isPassive`.
- Background events get `mediaType: 'video' | 'image'` computed once during compilation. `StageManager` now reads `scene.mediaType === 'video'` in all three spots instead of re-running the `isVideoAsset` regex on every playback. I left the `isVideoAsset`/`isAudioAsset` helpers in `AssetManager` because there they operate on deduplicated *URL strings* for cache/preload decisions (not per-event execution), so a per-event flag doesn't apply. Also removed the now-dead `vn.isVideoAsset` wrapper.
- Added `#passiveInstant` / `#passiveLive` handler maps and a single `dispatchPassiveEvent(scene, index, live)`. `consumePassiveScenesInstant`, `restoreSceneState`, and `showCurrentScene` now all route through it. Restore keeps its explicit `audio`/`checkpoint` skip (those are intentionally not replayed on a jump).
- Added `#updateAvatarDOM(element, hasAvatar, src, toggleHiddenClass)` and applied it in `#setupConversation` (both avatars) and `#renderSingle`.
- `play/stop/pause/volume` route through `#compileAudio`; `show/replace/hide/clear` through `#compileSprite`.
- Unified all position parsing behind one `resolvePlacement(value, keywords)` helper and a shared `PLACEMENT_KEYWORDS` table. Sprite `pos`/`anchor` (now via `SpriteManager.#applyAxes` writing `--sprite-x/y` and `--sprite-anchor-x/y`) and the background `anchor` (`#bgAnchor`) all use it, replacing the three separate `#normalizePosition`/`#normalizeAnchor`/`#bgPosition` parsers. Sprites are positioned with `top`/`left` + a 2-axis `translate` so they can sit anywhere vertically.
- `InputManager`'s `switch` is now an `#actions` object dispatched as `this.#actions[action]?.(actionEl)`.
- Replaced the per-char delta-time stepping with `target = floor(elapsed / stepMs)` and a batched per-segment `slice(0, show)`. This also fixes a latent correctness bug — the old loop revealed at most one char per frame, capping speed at ~60 chars/s regardless of `typewriterStep`. Dropped the now-unused `i/segIndex/segPos/lastTime` node fields.

## Closed Beta #3 (2026-06-20)

- Added `.ogg` support for audio.
  - OGG videos now must use the `.ogv` container.
- You can now change typewriter effect speed in `config.yaml` using `typewriterSpeed:` under `settings:`.
  - This is the delay in milliseconds between each letter. The default is `30`.

## Closed Beta #2 (2026-06-19)

- You can now press Tab to toggle the visibility of the controls UI in a chapter.
- Reaching an "end"-type scene no longer marks the chapter as complete.
  - A chapter is now only marked complete if you reach the final scene.
- Completed PWA wiring.

## Closed Beta #1 (2026-06-18)

* Migrated the engine to the new YAML script formatting.
* Bug fixes and improvements.

## Dev Build #20 (2026-06-16)

### Major Architectural Overhaul (The "De-Godification")

The monolithic `VisualNovel` class (previously ~1,500 lines) was completely dismantled. It has been reduced to a lean, 215-line **Minimal Orchestrator** that holds top-level state and wires dependencies. All heavy lifting has been delegated to specialised ES6 Managers using a shared back-reference pattern (`this.#vn`):

- `SceneManager` **(New):** Owns the core game loop. Handles `showCurrentScene`, `nextScene`, `executeScene`, asset gating, passive-scene consumption, `restoreSceneState`, checkpoint jumping, and `fadeToBlack`/`fadeFromBlack` transitions.
- `MenuManager` **(New):** Owns the initialisation and rendering of the Chapter Select screen, as well as the language and reset-progress modals.
- `UIManager` **(Expanded):** Now governs all UI overlays. Manages toasts, fullscreen toggling, the volume panel, start gate, pause menu, title/image screens, the end screen, load-error overlays, and share button functionality.
- `DialogueManager` **(Expanded):** Now owns the entire dialogue-rendering layer (single, multi, narration, conversation), conversation state machines, and the typewriter effect.
- `InputManager` **(Expanded):** Centralises all global `keydown` and `click` event listeners. Functions as a command router for UI actions (e.g., mute toggles, typewriter toggles) and dialogue advancement.
- `SpriteManager` **(New):** Encapsulates all DOM manipulation for sprites, including rendering, positioning, hiding, and clearing active sprites from the stage.
- `StageManager` **(New):** Encapsulates the `bg1`/`bg2` background layers, managing background crossfades, HTML5 video fading, and video DOM cleanup.
- `ProgressManager` **(New):** Handles checkpoint discovery, progress percentage calculations, resume indexes, and persistence (via `SaveManager`).
- `ConfigManager` **(New):** Handles `config.yml` parsing, theme application, CSS variable injection, dynamic `@font-face` rules, and setting the favicon.
- `LogManager` **(New):** Manages the dialogue scrollback history, DOM templating, and history rebuilding when jumping between scenes.

**Strategy Pattern:** Eliminated massive `switch` statements in `VisualNovel.executeScene()` and `DialogueManager.render()` in favour of clean handler maps (`#sceneRenderers` and `#renderers`). Unknown scene types are now handled gracefully as no-ops.

### Core Engine & Performance Optimisations

- **Typewriter GC Optimisation:** Completely rewrote the typewriter effect. Instead of continuous `innerHTML` string slicing (which caused heavy garbage collection/reflow churn), it now parses HTML once into the DOM and progressively reveals characters by modifying text-node `nodeValue`. This fully preserves inline HTML formatting (like colours and bolding) at 60 FPS.
- **Aggressive DOM Caching:** Replaced over 36 scattered `document.getElementById()` calls with a single ID-array mapper that runs once during initialisation. Static DOM elements are cached in `vn.elements`, ensuring render loops never re-query the DOM.
- **Menu Asset Preloading:** `showChapterSelect` now strictly awaits a `preloadMenuAssets()` function. The game logo, background, fonts, and inline SVGs are guaranteed to be fully loaded before the initial loading spinner disappears.
- **Centralised Timings:** Moved ~15 scattered hardcoded timeouts, delays, and animation durations into a single `TIMINGS` constant at the top of the file.
- **SaveManager DRYing:** Consolidated all `localStorage` access via new private `#safeGet`, `#safeSet`, and `#safeRemove` wrappers, universally eliminating `try...catch` boilerplate.

### UI, UX & Visual Polish

- **Streaming-Style End Screen:** Redesigned the End Screen visual hierarchy. If a subsequent chapter exists, **"Next Chapter"** appears as a large, primary accent CTA button. The other actions (Back to Menu, Credits, Share) are rendered as neat secondary/ghost buttons below it. If it is the final chapter, "Back to Menu" becomes the primary CTA.
- **Share Button Inline Feedback:** Replaced the "Copied!" popup toast with slick inline feedback. Clicking "Share" smoothly animates the button's width, turns it green (`var(--color-success)`), swaps the icon to a checkmark, and changes the text to "Copied!" for 2 seconds.
- **Glassy Volume Panel:** Upgraded the volume pop-up panel from a solid background to a translucent-dark aesthetic with a 16px backdrop blur (`backdrop-filter: blur(16px)`), perfectly matching the engine's modern design language.
- **Inline Sastra Logo:** Replaced external network fetches for the "Made with Sastra" logo. It is now a tightly-cropped, inline SVG perfectly vertically aligned (Y-axis adjusted to 77, viewBox tightened to 332) using the Gabarito 500 weight font.
- **Universal Button Icons:** Added explicit `viewBox="0 0 24 24"` tags to all 14 SVG symbols to fix browser-dependent off-centre rendering. Added new specific icons for _Share_, _Back to Menu_, _Credits_, _Play from Beginning_, and _Reset_. Introduced `.ui-button.icon` to maintain padding alongside icons.
- **Pause Menu Precision:** Perfectly horizontally centred the vertical divider between the left (actions) and right (checkpoints) panels (56px gap on each side). The "Checkpoints" title is now pixel-perfectly aligned with the unhovered edge of the checkpoint buttons.
- **Start Gate to Title Transition:** Fixed an issue where a bright background would flash when dismissing the start gate. The title screen now activates synchronously while the start gate is still opaque.

### Localisation & Formatting

- **RTL Chrome Lock vs. Prose Flow:** Locked the engine's UI chrome (toolbars, button rows, modals) to `direction: ltr` to ensure buttons never mirror awkwardly in Right-to-Left languages. Prose elements (dialogue, narration, character names) dynamically scale RTL via `dir="auto"`. This permanently fixed sentence-final punctuation (e.g., `!`) landing on the wrong side of Arabic text.
- **Smart Language Sorting:** Removed hardcoded priority arrays. Languages are now sorted strictly alphabetically by their display label, with logic added to automatically detect and float the user's system base language (e.g., `en`) to the top of the list.
- **Universal HTML Formatting:** Enabled HTML tags (`<b>`, `<i>`, coloured `<span>`, monospace, etc.) universally across character names, the chapter-info pill, pause titles, menus, credits, and logo fallbacks.
- **Safe String Extraction:** Added a `stripHtml()` helper for plain-text-only browser areas (like `document.title` and the clipboard copy text) to prevent HTML tags from leaking into the user's OS clipboard.
- **Cache-Busting Locales:** Locale JSON fetches now append `?v=${APP_VERSION}`. Returning users will immediately receive updated string localisations when the app version is bumped without clearing browser cache.
- **Translation Keys:** Renamed `poweredBy` to `madeWith` across the engine and all localisation files. Deleted unused keys (`toast.copied`, `toast.copyFailed`).

### CSS Architecture & Standardisation

- **BEM Naming Conventions:** Converted all bare state classes to strict BEM modifiers to prevent style leakage (e.g., `.conv-dialogue-box.right` became `.conv-dialogue-box--right`; `.single-dialogue.no-avatar` became `.single-dialogue--no-avatar`).
- **Component Systems:**
  - Merged six separate dark-icon buttons into a unified `.control-button` system (with `.circle` and `.pill` modifiers).
  - Merged the pause and modal close buttons into a shared `.close-button` class (with an `.absolute` modifier).
  - Merged the start and action buttons into a unified `.ui-button` system.
- **Merged Shared Layouts:**
  - `.title-main` and `.end-main` -> `.screen-title`
  - `.title-sub` and `.end-sub` -> `.screen-subtitle`
  - `.title-screen` and `.end-screen` -> `.full-screen-overlay`
  - `.loading-error` and `.file-protocol-error` -> `.error-overlay`
  - `.non-dialogue` -> `.narration-screen`
- **CSS Utilities:** Created and applied `.centered-scene`, `.flex-center`, and `.scrollbar` utilities to strip repeated layout rules.
- **Global Variables:** Moved all scattered `z-index` layering values into `:root` variables (`--z-scene`, `--z-modal`, `--z-toast`, etc.).
- **Data-Attribute UI States:** The typewriter toggle CSS is now safely driven by a global `body[data-typewriter-enabled="false"]` attribute instead of individually toggling `.disabled` JS classes.
- **Purged Cruft:** Removed unused CSS keyframes (`slideUpFade`, `buttonSlideIn`).

### Code Consistency & Bug Fixes

- **Strict Private Fields:** Converted every `_prefixed` private member to native ES6 `#private` fields across all classes. Enforced boolean naming conventions (e.g., `isConvDialogueActive` instead of `convDialogueActive`).
- **Version Meta Tags:** Centralised app versioning via two easily editable `<meta>` tags at the top of the `<head>` (`app-version` and `app-version-label`). This fully supports letters and symbols for release streams (e.g., `v18-rc1`).
- **HTML Templates:** Moved the large, injected HTML string for the Reset Progress modal into a `<template id="tplResetModal">` tag. It is now cleanly hydrated via cloning rather than injected as raw string literals.
- **Background Bleed Fix:** Fixed an issue where the background would flash grey during scene loading. Re-assigned the base black colour to `body = #000` while keeping `.game-container` transparent, allowing background layers to render flawlessly.
- **Conversation Triangle Clipping:** Changed `.conv-dialogue-box` CSS containment from `contain: layout paint` to `contain: layout`, restoring the speech bubble pointer arrow that was previously being visually clipped.
- **Routing Bug Fixes:** Fixed minor delegation bugs uncovered during the extraction phase (`DialogueManager.advanceConversation` now correctly calls `vn.scene.nextScene()`; `SceneManager.jumpToCheckpoint` correctly calls `vn.ui.closeModal()`).
- **Minification Prep:** Stripped all JS, CSS, and HTML development comments (`//`, `/* */`, \`\`) from the source code, reducing file size by roughly 24 KB without breaking regex literals or URLs.

## Dev Build #19 (2026-06-14)

### Performance Optimisations

- **CSS Containment Layout Isolation:** Applied `contain: strict;` to the `.sprite-stage` and `contain: layout paint;` to dialogue boxes (`.dialogue-content`, `.non-dialogue`, `.conv-dialogue-box`) to isolate layout calculations and prevent viewport-wide reflows during rapid typewriter effects or sprite updates.
- **Modernised Resize Handling:** Replaced the legacy rapid-firing `resize` and `orientationchange` window event listeners (along with their `setTimeout` debouncer) with a single, highly performant `ResizeObserver` bound to `document.body` that handles screen recalculations asynchronously.
- **Garbage Collection-Friendly Typewriter:** Refactored `startTypewriterLoop` to stop mutating memory via character-by-character string concatenation. It now advances an tracking index (`node.i`), skipping whole HTML tags instantly, and slices the original immutable string (`text.slice(0, node.i)`) every frame, eliminating a massive garbage collection footprint.
- **Explicit VRAM & Element Nullification:** Enhanced asset disposal workflows (such as `removeSprite`) to explicitly reset an element's `.src` to an empty string (`sprite.src = ''`) immediately prior to `.remove()`, assisting the browser's Garbage Collector in instantly evicting textures from memory.

### Internationalisation

- **Clean Architectural Extraction:** Extracted all hardcoded engine user interface strings (buttons, error screens, modals, tooltips, alt text, titles) into separate local JSON catalogues.
- **Static DOM Content Binding:** Instrumented the static layout with data attributes (`data-i18n`, `data-i18n-title`, `data-i18n-alt`, `data-i18n-html`), letting the new `I18nManager` dynamically translate the DOM on boot or menu instantiation.
- **Flexible Config Cascading & Inheritance:** Upgraded configuration parsing via a new `LanguageManager` to accept BCP 47 language codes as root nodes alongside a global `defaultLanguage`. It handles deep merging of top-level configurations (like `settings` and `theme`) down to regional blocks, enabling a creator to supply base-level codes (`fr`), highly specific dialects (`fr-FR` vs. `fr-CA`), or missing fields that safely inherit properties/chapters from the default language without breaking.
- **Smart UI Locale Mapping:** Formulated a fallback algorithm that normalises creator-defined codes to the engine's core UI packages by primary subtag. It resolves regional variations gracefully (e.g., mapping `en` or `en-US` configs to use `en-GB.json`, or `fr-CA` to use `fr-FR.json`), while cleanly supporting variable interpolation `{var}` and a key-echo on missing strings.
- **Bi-Directional Script Layout (RTL / Arabic Support):** Embedded native RTL handling. The engine checks the current subtag against common RTL maps along with native `Intl.Locale` text info to flag bi-directional environments. When a language like Arabic (`arb`) is active, the engine maps language-subtag rules (`ar*` / `arb` → `arb`) and applies a root `<html dir="rtl">` layout flip.

### User Interface & Layout Refinements

- **Bidirectional Layout Separation:** Fixed a layout flaw where a global `dir="rtl"` mirrored the game stage. The game chrome layout is isolated by forcing `.game-container`, the chapter-select cluster, and the attribution pill to stay structurally LTR. To handle rendering multilingual text inside this structural frame, `dir="auto"` was globally integrated across all dynamic engine text nodes (titles, dialogs, log entries, checkpoints, and button labels). This forces individual text runs to re-orient according to their internal characters (e.g., English stays LTR/left-aligned, while Arabic story content aligns RTL/right-aligned natively).
- **Unified Full-Screen Language Menu:** Integrated a responsive language menu that adheres to the game's core design language by employing the identical screen overlay structure, vertical layout widths (`min(320px, 80vw)`), and a `40px` heading gap used by the Reset modal. Unselected languages appear in a subtle grey secondary variant (`.end-button.secondary`), while the active selection features a blue accent highlight.
- **Smart Native Names & Prioritised Sorting:** Configured the language list selection modal to pull the localized native string representation of codes automatically via `Intl.DisplayNames` (e.g., showing "Français canadien" or "العربية"). The output is ordered using a static base priority lookup matrix (`['en','id','nl','fr','es','ru','zh','ar']`) followed by an inner alphabetical `localeCompare` sort, grouping regional variants cleanly underneath their primary category.
- **DRY Control Routing:** Merged duplicated layout classes into shared, unpolluted rule bases (e.g., standardising `.reset-progress-button` and the new globe `.language-button` into one base class). Extended global click interceptors and Escape key handlers to handle closing active Reset or Language overlay surfaces cleanly.
- **Localisation edge cases addressed:**
  - **"Made with" Pill Integration:** Converted the floating attribution pill to be translation-ready (`data-i18n="poweredBy"`). Because the layout is generated dynamically, the translation engine is explicitly re-invoked on the menu after initialisation to capture it.
  - **Unified Close System:** Removed redundant component-specific close indicators (like `pause.resume`) in favour of a clean, globally translated header tooltip binding (`data-i18n-title="close"`), used across all overlay close buttons ("Close" / "Fermer" / "Tutup" / "إغلاق")
  - **De-Localised Hard Boot Errors:** Removed dead asset keys from local JSON catalogs since file protocol system errors (`showFileProtocolError`) trigger instantly under `file:/`/ long before engine subsystems or localised file loaders can physically execute.

## Dev Build #18 (2026-06-06)

### Performance & Memory Optimisations

- **Garbage Collection Elimination:** Migrated the engine's `imageCache` and `audioCache` from plain JavaScript Objects to native `Map` structures, preventing V8 hidden-class de-optimisation and eliminating micro-stutters during asset eviction.
- **Typewriter Array Recycling:** Replaced array redeclaration (`[]`) with mutation (`length = 0`) in the Typewriter RAF loop to recycle memory references and reduce Garbage Collection churn.
- **Layout Thrashing Prevention:** Replaced synchronous `.offsetWidth` layout recalculations with a newly created `forceNextFrame` utility (double `requestAnimationFrame`), deferring UI paints to the browser's natural rendering cycle.
- **Video Memory Leaks:** Added `disableRemotePlayback` to dynamically created `<video>` elements to halt unnecessary background AirPlay / Chromecast polling.
- **VRAM & Font Crispness:** Purged legacy `translateZ(0)`, `will-change`, and `backface-visibility` hacks from static UI elements, modals, and dialogue boxes, restoring native subpixel anti-aliasing for crisp text and freeing mobile VRAM.

### New Features & Controls

- **Configurable Hold-to-Skip:** Added an `allowHoldToSkip` boolean to the `config.yml` metadata. The engine now uses native `e.repeat` detection to intercept and reject held-down keys, preventing rapid, unintended dialogue spam.

### UI Polish & Bug Fixes

- **Typewriter Toggle Alignment:** Fixed a visual bug caused by the GPU cleanup by adding `position: relative` to the menu toggles, restoring the proper containing block for the absolute-positioned strike-through line.
- **Unified Close Icons:** Refactored the Log, Credits, and Pause menus to use a completely DRY, shared SVG `<use>` reference (`#icon-close`) instead of text-based glyphs, ensuring pixel-perfect consistency across all overlays.

## Dev Build #17 (2026-06-05)

### Memory & Asset Management

- **Bilateral Sliding-Window Preloader:** The engine no longer forces the entire chapter into RAM. It now tracks "active" scenes (dialogue, choices) and dynamically manages memory around the player's current position:
  - **Lookahead:** Preloads assets for the next **12 active scenes**.
  - **Heavy Media Priority:** Scans ahead **30 active scenes** specifically to queue video and audio assets first.
  - **History Retention:** Keeps assets from the last **7 active scenes** in memory to prevent sprite thrashing if the script flips back and forth.
  - **Aggressive Eviction:** Any asset falling outside this window is immediately wiped from the `imageCache` and `audioCache`, preventing mobile Out-Of-Memory (OOM) crashes.
- **Killed Ghost Video Buffering:** Implemented a new `destroyVideo()` helper. When transitioning away from a video background, the engine now explicitly strips the `<source>` and forces a `.load()` before removing the node, instantly severing the background network request and saving massive amounts of background bandwidth.

### Rendering & GPU Performance

- **Incremental Log Rendering:** The `populateLog()` function has been completely rewritten. Instead of wiping and rebuilding the entire DOM history every time the log is opened, it tracks the `_renderedLogCount` and uses a `DocumentFragment` to append _only_ the new lines. Opening the log after 2.000 lines is now instantaneous.
- **Dynamic VRAM Allocation:** Removed permanent `will-change` CSS properties from sprites and scene layers. Hardware acceleration is now applied just-in-time via a new `enableGpuAccel()` JavaScript utility right before a CSS transition begins, and is cleanly stripped away on `transitionend`. Idle sprites no longer permanently hoard GPU memory.

### Quality of Life & Debugging

- **Window-Aware Debug Readout:** The pause menu's asset tracker was updated to reflect the new sliding-window architecture. Instead of the former "X / Total", it now displays live footprint metrics (e.g., _18 assets resident · 18/95 warm · window 1–18/312 active_), giving an exact read on what is currently in RAM.
- **Graceful Local File Handling:** The engine now intercepts users trying to open the `game.html` file directly via the `file://` protocol. It safely halts initialisation before any network errors occur and displays a cleanly styled, full-screen overlay (using existing CSS variables) explaining how to launch the engine via a local server using methods ibnlt. VS Code’s Live Server extension.

## Dev Build #16 (2026-06-01)

### Architecture & Core Codebase Refactoring

### God-Object Decomposition

- **Decoupled Sub-systems**: The massive, singular `VisualNovel` class has been completely split into separate, specialised manager classes to enhance readability and maintainability.
- `SaveManager`: Now independently controls all `localStorage` state updates and checkpoint histories.
- `AssetManager`: Centralises the new Just-In-Time (JIT) preloading, retry loops, asset caching, and loading state diagnostics.
- `AudioManager`: Manages the Web Audio API context initialisation, track mixing, audio source caching, and gain envelopes.
- **Hoisted Global Scopes**: Shared utility methods such as `clamp`, `delay`, `hasAsset`, `isVideoAsset`, `isAudioAsset`, and `PASSIVE_SCENE_TYPES` have been hoisted to module scope, leaving thin VN delegators to prevent breaking existing API hook sites.

### DRY (Don't Repeat Yourself) Code Consolidation

- **Merged Dialogue System**: Consolidated the redundant, individual methods (`showSingleDialogue`, `showMultiDialogue`, `showNonDialogue`, and `showConversationalDialogue`) into a single, intelligent `renderDialogue(scene)` method. This handler routes DOM injections dynamically by type while safely unifying layout updates, typewriter execution, and history logs.
- **Unified Modals**: Removed individual show/hide methods for the dialogue log, credits, and checkpoint windows. They have been replaced by a single `openModal(id)` and `closeModal()` system that hooks natively into `Escape` keypresses and backdrop clicks.
- **De-duplicated Theme Settings**: `DEFAULT_THEME.colors` and `DEFAULT_THEME.fonts` have been stripped of duplicate fallback values. The JS `applyTheme` method now only calls `setProperty` if custom values are explicitly declared in `config.yml`, allowing the browser to naturally fall back to the CSS `:root` baseline rules.
- **Centralised Timings**: All scattered animation limits and engine timeouts (e.g., toast alerts, sprite fades, title crossfades) are now mapped inside a single `TIMINGS` reference configuration object.

### Performance, Rendering & Preloading

### Just-In-Time (JIT) Asset Pipeline

- **Streaming Queue**: Abandoned heavy asset bottlenecks. The engine now runs `preloadInitialAssets()` to fetch only the files required for the immediate opening scenes before dropping the load overlay. The remainder of the assets stream silently via `backgroundPreloadRest()` while the user reads.
- **Asset Gatekeeping**: If a player advances faster than their connection can stream, `gateSceneAssets()` safely halts execution and shows the loading spinner until the needed media resolves.
- **Auto-Retry & Network Recovery**: Built a native network shield using `loadAssetWithRetry()`, which attempts a 3x retry loop with a 1-second delay during drops. If the connection completely fails, the game gracefully surfaces a dedicated "Network error" retry screen to prevent broken image cards or engine errors.

### GPU Acceleration & Layout Compression

- **Hardware Acceleration Layers**: Applied `translateZ(0)` and `translate3d()` properties alongside `backface-visibility: hidden` and `will-change` configurations across all dialogues, layout boxes, toasts, and popups. This offloads animation rendering directly to the GPU for fluid 60 FPS performance without modifying existing layout transforms.
- **CSS Component Compression**: Consolidated modal styles under baseline `.modal-overlay` and `.modal-content` framework classes, shaving off roughly 120 lines of redundant CSS. Individual modules now only hold their unique canvas dimensions.
- **Scene Layer Normalisation**: Extracted repeating absolute positioning, z-index properties, and fade transitions from the distinct dialogue layers and applied them once under a unified `.scene-layer` class wrapper.

### DOM & Asset Optimisation

- **SVG Vector Sprite Sheet**: Relocated all inline icons into an optimised `<svg><defs>` sprite block at the top of the body. Reused icons are now called cleanly via lightweight `<svg><use href="#id"/>` tags.
- **Volume/Mute SVG Extraction**: Stripped heavy data-URI string clutter from the stylesheet entirely. Volume controls now hold two geometrically centred `<use>` glyph symbols (`.volume-icon-on` / `.volume-icon-off`) that are cleanly flipped by the parent `.muted` class.
- **Template Log Rendering**: Replaced high-overhead string generation in `populateLog()` with a layout structure that clones native HTML `<template>` items into a single `DocumentFragment`. This maps long history files in a single browser reflow while preserving safe styling rules.
- **Unified Background Processing**: Completely stripped out the separate `background_video` node type. The standard `background` class now auto-detects standard formats using an `isVideoAsset()` extension lookup, dynamically building background layers while perfectly protecting target fades and crossfade loops.

### UI/UX & Interactive Enhancements

### The Two-Section Pause Menu

- **Chapter Info Refactoring**: Transformed the old checkpoint popup into a gorgeous, full-screen interactive Pause Menu.
  - **Left Branding Column**: Features a larger game logo (with native fallback protection), high-contrast white chapter titles, a pill-styled "Play from Beginning" button, and a menu escape control.
  - **Right Checkpoint Column**: Features an organised, isolated checkpoint scroll lane paired with a vertical divider line that automatically collapses if a chapter features no save points.
- **Live Engine Readout**: Integrated a technical readout anchored at the bottom-centre that showcases deep debugging telemetry via `AssetManager.debugSummary()`, strictly limited to one line to avoid screen overflow.
- **Close Window Optimisation**: Swapped the unaligned close glyph for a perfectly centred, custom SVG macro button that maps identically with top-bar positioning and remains invisible until hovered.
- **Responsive Scaling Rules**: Implemented a responsive height media filter (`@media (max-height: 520px)`) that dynamically rescales branding headers, menu spacing, text weights, and brings diagnostics safely inside tight landscape frames.

### Interaction Fluidity & Typography

- **Start-Panel Progression Fix**: Removed conflicting visibility filters on the `.start-panel` layer. Clicking a start prompt now seamlessly drops the panel elements over 0.4 seconds, followed by a soft 0.6-second reveal of the gameplay view to eliminate overlapping text glitches.
- **Global Interaction Delegation**: Replaced heavy individual event attachments inside `renderChapterSelect()` with global delegation mapping. Menu routes and progress reset paths run entirely through the global `handleGlobalClick` engine gate.
- **Conversation Real Estate Balance**: Realigned `.conversational-dialogue` from baseline positioning to vertical centring. Dialogue boxes now feature an enlarged `min-height: 150px` layout block with centred content and an aligned speech pointer.
- **High-Contrast Subtitles**: Elevated readability across the UI by forcing `.title-sub`, `.end-sub`, and log history subtitles to full white (`var(--color-text)`).

### Bug Fixes & Stability

- **New Player Audio Initialisation**: Fixed an explicit initialisation bug within `loadSavedVolume()` where blank `localStorage` keys mapped to zero, locking new users into an accidental muted state. The system now evaluates absent keys to an accurate 100% volume state.
- **Start Gate Audio Clipping Solution**: Resolved an audio truncation glitch where passive music nodes triggered immediately behind the Start Gate had their opening notes clipped by a suspended audio context. Playback states now defer smoothly until user clicks resolve the underlying context, keeping visual transitions fluid and instantaneous.
- **Pipeline Preload Inclusion**: Extended asset collection parameters to cover target background audio files inside the core engine loop (`sceneAssetSrcs`), warming the browser HTTP cache to guarantee zero cold-loading latency.
- **Strict History Suppression Flags**: Patched a processing bug in history recovery loops. Added strict `scene.log !== false` flag enforcement across every script style (`single`, `multi`, `narration`, etc.), guaranteeing that hidden developer nodes stay hidden inside the text log.
- **Global Orientation Blocker**: Swapped mobile touch parameters for a structural viewport layout look up. Chapters accessed via landscape-oriented small devices lock down securely into portrait blocks even behind the initial Start Gate window, while keeping global chapter selection cards responsive and accessible.

## Dev Build #15 (2026-05-30)

- Migrated the chapter array parsing from a standalone `chapters.json` file into the main `config.yml` data object and updated the fetch directory from `dialogues/` to `chapters/`, significantly streamlining game setup for non-technical creators.
- Resolved flexbox vertical centring discrepancies on the Title Screen and Start Gate by dynamically applying `display: none` to empty DOM elements to eliminate ghost margins, alongside implementing dynamic font-weight toggling based on the start/resume state.
- Set the delay argument in the `showMultiDialogue` method's `runTypewriter` loop to `0` (previously `index * 200`), eliminating the staggered animation delay and ensuring all character dialogue texts render simultaneously.
- Implemented dynamic text crossfading for consecutive title screens by selectively preserving the title container's `.active` state via a strict filter in `hideAllScreens()`, and eliminated scene transition delays to ensure seamless, non-flickering text updates without breaking standard dialogue fades.
- Refactored chapter initialisation and checkpoint logic to instantly process background setup nodes (`consumePassiveScenesInstant()`) before rendering, and synchronised the Start Gate's fade-out to the browser's paint cycle using `requestAnimationFrame`, ensuring scenes and dims are completely painted before being revealed.
- Refactored the toast system from a static single-node architecture to a dynamically generated, Flexbox-based container model; individual toasts are now instantiated, independently animated, and safely garbage-collected from the DOM, allowing concurrent notifications to cleanly stack without overwriting active alerts.
- Synchronised the title screen's fade-in duration with the engine's 1-second background crossfade to eliminate un-dimmed visual flashes, decoupled the end-screen transition to preserve its dramatic 2-second fade, and tightened CSS fade-out timings for both the screen container and text elements to perfectly align with JavaScript timeouts for snappier, stutter-free consecutive scene updates.
- Deprecated and removed all engine references to legacy `sound`, `music`, and `music_stop` scene types. All audio execution logic and scene indexing processes now route exclusively through the unified `audio` type, streamlining asset management and playback handling.
- Introduced `hideAvatarInGame` and `hideAvatarInLog` boolean properties for `single`, `multi`, and `conversation` scenes. This updates the dialogue rendering and `rebuildLogHistory` methods, allowing creators to decouple on-screen sprite visibility from dialogue log portraits (e.g., to create off-screen narrators or hide temporary visual UI from the text logs).
- Resolved a bug where holding advance inputs (click/space) bypassed the engine's 200ms visual transition delay, resulting in unrendered and unlogged dialogue. Refactored the render loop by extracting UI logic into a new `executeScene` method and utilising a `_pendingSceneExecute` closure in the event listener, which now forces interrupted scenes to immediately render and push to the log before advancing.

## Dev Build #14 (2026-05-29)

- Replaced `game.json` with `config.yml` via the `js-yaml` library, drastically improving ease-of-use for creators by removing strict JSON syntax requirements in favour of highly readable formatting.
- Implemented dynamic variable resolution for CSS elements and built an auto-formatting font loader, allowing creators to map theme colours and define custom `@font-face` rules using simple key-value pairs without writing raw CSS boilerplate.
- Integrated a deterministic `rebuildLogHistory` function within the `restoreSceneState` method to dynamically reconstruct the script history, ensuring perfect log synchronisation when navigating forwards or backwards via checkpoints.
- Refactored `populateLog` to compile the entire log array into a single concatenated HTML string instead of iteratively appending individual DOM elements, bypassing DOM bottlenecks to render thousands of entries exponentially faster and eliminate UI freezing.
- Introduced dedicated colour configuration parameters (`logDialogueBorder`, `logNarrationBorder`, `logTitleBorder`, `logImageBorder`) to the configuration parser. These fields dynamically map user settings from `config.yml` to internal CSS variables, replacing hardcoded colour definitions to allow seamless visual branding for each distinct log entry type.
- Added a "Play from beginning" button at the top of the checkpoint list; updated the `showCheckpoints()` UI engine to render this element, bound a matching interaction handler inside `bindEvents()`, and introduced the `restartChapterMidGame()` routine to safely truncate the text sequencer, purge active sprites, clear log histories, and reset audio tracks before indexing back to scene zero.
- Improved the design of the "Powered by Sastra" watermark.
- Bug fixes and improvements.

## Dev Build #13 (2026-05-26)

- Replaced `music`, `sound`, and `music_stop` handling with unified `audio`.
- Added Web Audio API routing via `createMediaElementSource()` while keeping HTML5 `Audio()` streaming.
- Replaced audio fade intervals with `linearRampToValueAtTime`.
- Added “Click to start” gate before chapters.
- Reworked typewriter effect timing to use `requestAnimationFrame`.
- Removed the forced `offsetHeight` reflow from conversational dialogue setup.
- Added a top volume button with slider and saved volume.
- Added checkpoints, saved checkpoint availability, resume prompt, chapter progress bars, and reset progress button.
- Added `settings.enableCheckpoints` to `game.json`.

## Dev Build #12 (2026-05-26)

- Added a fullscreen toggle button next to the typewriter effect toggle.
- Mobile VN stays flexible with modest font/layout reductions in landscape so text is less oversized.
- Mobile main menu “Powered by Sastra” is now part of the scrollable chapter list bottom, while desktop keeps its fixed bottom-right behaviour.
- Typewriter effect toggle state is saved in local storage and survives refreshes/revisits.
- `game.json` now supports:
  - `settings.showLogButton`
  - `settings.showTypewriterToggle`
  - `settings.typewriterEnabled`
- Grouped VN control buttons together in a Flexbox container with a strict `gap`, and utilised `backface-visibility: hidden;` and `transform: translateZ(0);` which forces the browser to use hardware acceleration (the GPU) for buttery smooth transitions.

## Dev Build #11 (2026-05-25)

- Added a robust Sprite system to manage character graphics on screen. You can control a sprite's visibility, positioning, sizing, and layering using specific keys within scene objects.
- Added mobile support: the menu can load in portrait, chapter play is allowed on landscape, portrait chapter play shows a rotate message.

## Dev Build #10 (2026-05-25)

- Replaced Google Fonts with a self-hosted `@font-face` for Gabarito.
- Removed all SCR/Sastra Content Rating markup, styling, script logic, storage keys, and `game.json` config.
- Renamed the old text fade-in system to `typewriter` in code, UI IDs/classes, toggle logic, titles, and toast text.
- Added `game.json` customisation through `theme`, including font slots, optional `fontFaces`, favicon, UI/button/dialogue colors, accent colors, panel colors, and toast colors.
- Refactored asset collection to use a small deduped helper path instead of repeated filtering.
- Improved image preloading by using `decode()` without appending hidden image nodes to the document.
- Added dialogue `position: "top" | "bottom" | "center"` support for single, multi, narration, and conversation scenes. Default remains centered.
- Empty or missing avatars now hide the avatar element/slot and keep the dialogue box centered.
- Added `gameContainer` ID to match the existing cached element reference.

## Dev Build #9 (2026-03-07)

Added the Sastra Content Ratings (SCR) system.

## Dev Build #8 (2026-02-21)

Fixed avatar loading delay and intermittent unloading issue.

Avatars were not being preloaded during the splash screen due to a scene type mismatch in `collectAssets()`, where Sastra was checking for outdated type names (`single_dialogue`, `multi_dialogue`, `conv_dialogue`) instead of the actual scene types (`single`, `multi`, `conversation`). As a result, avatar images were never added to the preload queue and only began loading when first displayed, causing a noticeable delay.

After correcting the type checks, avatars are now properly included in the initial asset preload. Additionally, the image preloading system was improved by using `img.decode()` and persisting decoded images in an in-memory cache to prevent garbage collection. This eliminates first-render delays and prevents avatars from becoming unloaded after extended periods without use. A small render-frame delay was also added after the loading screen to ensure all assets are fully committed before the first scene displays. Avatars now appear instantly and remain stable throughout gameplay.

## Dev Build #7 (2026-02-12)

Added a new “Powered by Sastra” badge! ✨

Fixed issues:

- Closing the Dialogue Log by clicking outside the modal progresses the screen

## Dev Build #6 (2026-02-07)

Added a new button to disable text fade-in animations.

The `title_unlogged` screen type has been merged into the `title` screen type as a `"log": "false"` parameter.

## Dev Build #5 (2026-01-24)

- Added new `blank` scene type for displaying only the background.
- `title` screens are now shown in the Dialogue Log.
- `title` and `end` screens now support HTML formatting.
- New `title_unlogged` screen type that shows a title without adding it to the Dialogue Log.

## Dev Build #4 (2025-12-18)

New video backgrounds! The new `"background_video"` scene type allows you to use videos as background. It also has a loop and volume parameter.

Fixed issues:

- Text in title screens remained selectable even when hidden

## Dev Build #3 (2025-12-06)

Implemented a comprehensive multi-track audio management system that replaces the singular `currentMusic` with a `currentMusicTracks` object mapping URLs to Audio instances, allowing simultaneous playback of multiple tracks. The system now distinguishes between text typing intervals (`textFadeIntervals`) and music fade intervals (`musicFadeIntervals`) to prevent type errors. When `music_stop` is called without an asset (or with an empty string), it stops all tracks by creating a snapshot of current tracks before clearing the main tracking object, ensuring new tracks started during fade-out aren't affected; when a specific track is targeted, only that track stops. The `playMusic` method now checks for and cancels any active fades for the same track URL, preventing duplicate audio objects. This architecture supports independent fade-outs, allows new tracks to play immediately after a global stop command, maintains backward compatibility with existing VN scripts, and ensures all tracks remain individually controllable through their unique identifiers.

## Dev Build #2 (2025-11-15)

Added support for HTML formatting elements.

## Dev Build #1 (2025-07-09)

Launch!
