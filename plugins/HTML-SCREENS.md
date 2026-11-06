# Building HTML screens for Sastra

A guide to building an `.html` file that runs inside a Sastra visual novel through the `screen:` event. An HTML screen is any interactive page the story hands over to: a computer or phone desktop the player explores, a puzzle, a minigame. Follow every **must**. The template at the end already does most of this, so start from it.

> The `screen:` event comes from the screens plugin, not the engine. Its source is `Plugins/sastra-screens.js` and it needs Sastra 2.0 or newer. Copy it into the game folder (e.g. `plugins/sastra-screens.js`) and list it in `config.yaml`:
>
> ```yaml
> plugins:
>   - plugins/sastra-screens.js
> ```
>
> Check both before testing.

## How Sastra runs an HTML screen

```yaml
- screen: screens/desktop.html
- bg: backgrounds/office.webp
- narration: "The file opens..."
```

- Sastra treats an HTML screen as one active scene, like a line of dialogue or an image. The story waits on it until the page calls `Sastra.finish()` from the bridge below. There is no timeout.
- The page runs in an `<iframe>` that fills the whole browser window and resizes with it. Sastra reveals it with a 0.5s fade on a black backdrop once the page's `load` event fires, or after 3s at most.
- Sastra's top bar stays on top and keeps working: the chapter name/pause menu (top left), and fullscreen, volume, typewriter, autoplay, and log (top right). Opening them doesn't pause the screen.
- While the screen is open, Sastra ignores clicks and keys for the story, and its keyboard shortcuts are off. The iframe gets focus when it's revealed, so the page receives keyboard input.
- The iframe is on the **same origin** as the game. Paths are relative to the HTML file, not to `index.html`: from `screens/desktop.html`, the game's backgrounds are `../backgrounds/…`.
- Nothing is sent back to the story. Sastra has no branching, so every way of finishing continues to the same next event.
- Sastra doesn't log the screen or save progress inside it. Jumping to a checkpoint, restarting the chapter, or leaving the page removes the iframe immediately. Coming back replays it from the start.

## Preloading

Sastra preloads an HTML screen's files like any other scene's assets. They load in the background as the story gets close, and the loading spinner shows if the player reaches the screen before they're ready. When the chapter loads, Sastra reads the HTML file and collects every file it references:

- `src` on `<img>`, `<audio>`, `<video>`, `<source>`, `<track>`, `<script>`, `<iframe>`, and `<embed>`, plus `<video poster>` and `<object data>`
- `href` on `<link rel="stylesheet">`, `<link rel="preload">`, `<link rel="modulepreload">`, and SVG `<image>`/`<use>`
- every `url(…)` inside `<style>` blocks and `style=""` attributes, including `@font-face` fonts

It **can't see** paths built in JavaScript (`new Audio('…')`, `img.src = …`, `fetch('…')`), or `url(…)` inside an external stylesheet. **Declare every one of those with a preload link in `<head>`:**

```html
<link rel="preload" href="desktop/click.ogg" as="audio">
<link rel="preload" href="desktop/wallpaper-night.webp" as="image">
<link rel="preload" href="desktop/files.json" as="fetch" crossorigin>
```

- A missing or mistyped file stops the chapter with Sastra's usual missing-asset error, so paths must be exact.
- Only same-origin files are preloaded. External URLs are ignored, and they aren't allowed anyway (see File).
- Preloading fills the browser's cache. The page still requests each file but gets it from the cache, so it loads almost instantly.

## Must

### File
- **One self-contained `.html` file.** CSS and JS inline. Keep images, audio, and fonts in a sibling folder named after the screen (`screens/<name>/`). Reuse the game's own art from `../backgrounds/`, `../sprites/`, and so on where it fits.
- **No network.** No CDNs, no remote fonts, no analytics, no `fetch` outside the game folder. Sastra games must work offline. Use the system font stack `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`, or a font file in the screen's folder.
- **Every file preloadable.** Reference files statically where you can, and declare the rest with `<link rel="preload">` (see Preloading).
- **Plain JS.** No build step and no frameworks. Classic `<script>` or `<script type="module">` both work.

### Layout
- **Fill the viewport at any aspect ratio.** `html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }`. No letterboxing and no fixed-size stage. Lay out from the live `innerWidth`/`innerHeight` (or with CSS), and handle `resize`. The window can be anything from a 568×320 phone in landscape to an ultrawide monitor.
- **Landscape only on phones and tablets.** Sastra covers the screen with a "turn your device" message in portrait inside chapters, so never design for portrait. Short heights (320–400px) must stay usable.
- **Keep the top 84px clear of anything important.** Sastra's bar covers it: the chapter pill on the left (44px tall, 20px from the edges, variable width) and about 330px of buttons on the right. Background art or a wallpaper can go under it, but not buttons, icons, menus, or text the player needs. On a desktop-style screen, put the taskbar at the bottom and start the icons below 84px.
- **Respect safe areas:** pad edge UI with `env(safe-area-inset-*)`.
- **Canvas:** size the backing store to `innerWidth × innerHeight × min(devicePixelRatio, 2)` and scale the context, so it's sharp without overloading phones.

### Input
- **Pointer first.** Use Pointer Events (`pointerdown/move/up`) or plain `click`, which cover mouse, touch, and pen. Everything must work by touch alone. Keyboard input is a bonus and never required.
- **No hover-only or double-click-only actions.** Touch has neither. On a desktop-style screen, open icons with a single tap, or select on the first tap and open on the second, but never rely on `dblclick`.
- Set `touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;` on interactive areas so touches don't scroll, zoom, or select text. Leave text selectable only where the player is meant to read or copy it.
- Touch targets at least 44×44px.
- **Don't use `Escape`, `F11`, or `Tab` as controls.** `Escape` exits browser fullscreen. Any other key is fine, and text inputs work normally.

### The Sastra bridge (copy verbatim)
All communication with Sastra goes through this object. Don't call `window.close()`, `parent.postMessage`, or anything on `parent`/`top` directly.

```js
const Sastra = (() => {
	const embedded = window.parent !== window;
	const state = { volume: 1, paused: false, replay: false, language: '' };
	const listeners = new Set();
	let finished = false;
	addEventListener('message', (e) => {
		if (e.source !== window.parent || e.data?.type !== 'sastra:state') return;
		state.volume = Math.min(1, Math.max(0, Number(e.data.volume) || 0));
		state.paused = Boolean(e.data.paused);
		state.replay = Boolean(e.data.replay);
		state.language = String(e.data.language || '');
		listeners.forEach(fn => fn({ ...state }));
	});
	if (embedded) window.parent.postMessage({ type: 'sastra:ready' }, '*');
	return {
		embedded,
		get volume() { return state.volume; },
		get paused() { return state.paused; },
		get replay() { return state.replay; },
		get language() { return state.language; },
		onChange(fn) { listeners.add(fn); fn({ ...state }); },
		finish() {
			if (finished) return;
			finished = true;
			if (embedded) window.parent.postMessage({ type: 'sastra:close' }, '*');
			else location.reload();
		}
	};
})();
```

- `Sastra.volume` is the player's master volume from Sastra's slider, 0–1 (0 when muted). It updates live.
- `Sastra.paused` is `true` only while a phone or tablet is held in portrait and Sastra's "turn your device" message covers the screen. Sastra's own menus and log do **not** pause the screen.
- `Sastra.replay` is `true` when the player has already got past this screen before: a later checkpoint in the chapter is unlocked, or the chapter is finished. It comes from Sastra's saved progress (and whatever syncs it), so it also works on another device. Use it to shorten or skip long parts on a second play. It's known by the time `onChange` first fires with Sastra's state, shortly after `load`; outside Sastra it's always `false`.
- `Sastra.language` is the game's language code, like `'fr'`, so the screen can match the player's language. It's empty outside Sastra, in a game without `language:`, or with Screens plugin versions before 1.1.0.
- `Sastra.onChange(fn)` calls `fn({ volume, paused, replay, language })` straight away and again on every change.
- `Sastra.finish()` hands control back to the story. It only works once. Opened on its own outside Sastra, it reloads the page so you can replay while testing.

### Audio
- **Every sound must follow `Sastra.volume`.** Route all audio through one Web Audio master `GainNode` and set its gain from `onChange`. With `<audio>` elements instead, set each `el.volume = ownVolume * Sastra.volume` and reapply on change.
- **Resume the `AudioContext` on the first `pointerdown`/`keydown`** in case the browser started it suspended.
- **While paused, suspend the `AudioContext`** (or pause the elements), and resume after.
- Sastra's own music keeps playing under the screen unless the writer stops it. That can be what the writer wants, e.g. ambient music under a desktop. If the screen has its own music, tell the writer to add `- stop: all` (with `fade:`) before the `screen:` event.
- Fade the screen's audio out over about 300ms before calling `finish()`.

### Timing
- **Freeze time-based logic while `Sastra.paused` or `document.hidden` is true.** That covers loops, countdowns, spawning, and audio. Nothing else pauses the screen.
- Run animation and game loops on `requestAnimationFrame` with delta time, and clamp the delta (e.g. to 50ms) so a long frame or a resume doesn't cause a jump. Don't use `setInterval` for game logic.

### Ending
- **Always reachable.** Every way through the screen must lead to `finish()`. On a desktop-style screen, that's the action the story is waiting for, e.g. opening the right file. Make sure the player can find it. If the writer wants, hint at it or highlight it when they wander too long.
- For minigames, a loss either retries or finishes anyway, whichever the writer asks for. A "Skip" option after a few failures is worth offering, but it's up to the writer.
- Give the ending a beat, not an abrupt cut: a short animation, a "Continue" button, or a 1–2s hold (e.g. the file window opening) before `finish()`.

### Storage and scope
- The screen shares `localStorage` with the game. **Never read, write, or clear keys starting with `sastra:`**, and never call `localStorage.clear()`. Prefix your own keys `screen:<name>:`. Normally you won't need storage at all, and state shouldn't need to survive a replay.
- Don't access `parent`/`top` or their DOM, and don't use `window.open`, `alert`/`confirm`/`prompt`, `requestFullscreen` (Sastra has a fullscreen button), service workers, or cookies. Build fake dialogs and windows inside the page instead.

## Should

- **Load fast.** Keep assets small: `.webp` images, `.ogg`/`.mp3` audio, the whole folder ideally under 5MB. The Sastra Compressor can convert assets. Do the setup the first frame needs synchronously, so the page is complete when `load` fires and Sastra reveals it.
- **Match the story.** Ask the writer for the scene's mood, palette, characters, and what the player should find or do, and fit the look to the game.
- **Make the goal clear** without breaking immersion: a one-line prompt, a notification, a highlighted icon, or controls explained before a minigame starts.
- Put all readable text in one place near the top of the script, so the writer can reword or translate it.
- Test that nothing overflows at 568×320.
- Respect `prefers-reduced-motion` for screen shake and flashes. Avoid flashing faster than 3 per second.

## Test before handing over

Serve the game folder over HTTP (e.g. `python -m http.server`). Sastra and iframes don't work from `file://`.

1. Open the `.html` on its own. It should work start to finish, and `finish()` should reload it. Check the browser console for errors and 404s.
2. Add it to a chapter with `screen:` (use `- start:` right before it to skip ahead), load the game, and check:
   - No missing-asset error on load. In the console, `SASTRA.game.script.find(s => s.event === 'screen').assets` lists every file the screen uses, including those loaded from JS.
   - It fills the window, with nothing important under the top bar.
   - It resizes live without breaking, down to 568×320.
   - Mouse, touch, and (if used) keyboard all work, and keys don't trigger Sastra shortcuts.
   - Sastra's volume slider and mute change the screen's sound live.
   - Finishing fades into the story and the next event plays.
   - "Play from beginning" in the pause menu removes the screen cleanly and replays it.
3. Remove the test `- start:`.

## Starter template

A tiny tap game that shows every rule in place: the bridge, volume, pausing, resizing, touch input, the top-bar gap, and a beat before `finish()`. For a desktop-style screen, keep the bridge and audio parts and replace the canvas with your DOM layout.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>Minigame</title>
<style>
	html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #111; color: #fff; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
	canvas { position: fixed; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
	.panel { position: fixed; left: 50%; bottom: max(24px, env(safe-area-inset-bottom)); transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
	.panel[hidden] { display: none; }
	button { min-width: 44px; min-height: 44px; padding: 0 24px; border: 0; border-radius: 22px; background: #ff006e; color: #fff; font: 600 16px system-ui, sans-serif; cursor: pointer; }
</style>
</head>
<body>
<canvas id="stage"></canvas>
<div class="panel" id="panel"><div id="message"></div><button id="action"></button></div>
<script>
const TEXT = {
	intro: 'Tap the circle 10 times.',
	start: 'Start',
	win: 'You did it!',
	continue: 'Continue'
};

const Sastra = (() => {
	const embedded = window.parent !== window;
	const state = { volume: 1, paused: false, replay: false, language: '' };
	const listeners = new Set();
	let finished = false;
	addEventListener('message', (e) => {
		if (e.source !== window.parent || e.data?.type !== 'sastra:state') return;
		state.volume = Math.min(1, Math.max(0, Number(e.data.volume) || 0));
		state.paused = Boolean(e.data.paused);
		state.replay = Boolean(e.data.replay);
		state.language = String(e.data.language || '');
		listeners.forEach(fn => fn({ ...state }));
	});
	if (embedded) window.parent.postMessage({ type: 'sastra:ready' }, '*');
	return {
		embedded,
		get volume() { return state.volume; },
		get paused() { return state.paused; },
		get replay() { return state.replay; },
		get language() { return state.language; },
		onChange(fn) { listeners.add(fn); fn({ ...state }); },
		finish() {
			if (finished) return;
			finished = true;
			if (embedded) window.parent.postMessage({ type: 'sastra:close' }, '*');
			else location.reload();
		}
	};
})();

const audio = new AudioContext();
const master = audio.createGain();
master.connect(audio.destination);
const isFrozen = () => Sastra.paused || document.hidden;
const syncAudio = () => {
	master.gain.setTargetAtTime(Sastra.volume, audio.currentTime, 0.02);
	if (isFrozen()) audio.suspend(); else audio.resume();
};
Sastra.onChange(syncAudio);
document.addEventListener('visibilitychange', syncAudio);
addEventListener('pointerdown', () => { if (!isFrozen()) audio.resume(); });
addEventListener('keydown', () => { if (!isFrozen()) audio.resume(); });

const beep = (freq) => {
	const osc = audio.createOscillator();
	const gain = audio.createGain();
	osc.frequency.value = freq;
	gain.gain.setValueAtTime(0.2, audio.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.15);
	osc.connect(gain).connect(master);
	osc.start();
	osc.stop(audio.currentTime + 0.15);
};

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const view = { w: 0, h: 0 };
const resize = () => {
	const dpr = Math.min(devicePixelRatio || 1, 2);
	view.w = innerWidth;
	view.h = innerHeight;
	canvas.width = Math.round(view.w * dpr);
	canvas.height = Math.round(view.h * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};
addEventListener('resize', resize);
resize();

const panel = document.getElementById('panel');
const message = document.getElementById('message');
const action = document.getElementById('action');
const showPanel = (text, label, onClick) => {
	message.textContent = text;
	action.textContent = label;
	action.onclick = onClick;
	panel.hidden = false;
};

const game = { playing: false, hits: 0, time: 0 };
const target = () => ({ x: view.w / 2, y: Math.max(84 + 60, view.h / 2), r: Math.max(30, Math.min(view.w, view.h) * 0.1) });

canvas.addEventListener('pointerdown', (e) => {
	if (!game.playing || isFrozen()) return;
	const t = target();
	if (Math.hypot(e.clientX - t.x, e.clientY - t.y) > t.r) return;
	game.hits++;
	beep(440 + game.hits * 40);
	if (game.hits >= 10) {
		game.playing = false;
		master.gain.setTargetAtTime(0, audio.currentTime, 0.1);
		showPanel(TEXT.win, TEXT.continue, () => Sastra.finish());
	}
});

let last = performance.now();
const frame = (now) => {
	const dt = Math.min(now - last, 50) / 1000;
	last = now;
	if (!isFrozen()) game.time += dt;
	const t = target();
	ctx.clearRect(0, 0, view.w, view.h);
	ctx.fillStyle = game.playing ? '#ff006e' : '#444';
	ctx.beginPath();
	ctx.arc(t.x, t.y, t.r * (1 + Math.sin(game.time * 4) * 0.05), 0, Math.PI * 2);
	ctx.fill();
	if (game.playing) {
		ctx.fillStyle = '#fff';
		ctx.font = '600 20px system-ui, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(`${game.hits} / 10`, view.w / 2, view.h - 40);
	}
	requestAnimationFrame(frame);
};
requestAnimationFrame(frame);

showPanel(TEXT.intro, TEXT.start, () => {
	panel.hidden = true;
	game.playing = true;
	audio.resume();
});
</script>
</body>
</html>
```
