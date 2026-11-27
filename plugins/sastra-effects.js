/*
SPDX-License-Identifier: GPL-3.0-or-later WITH LicenseRef-Sastra-Asset-Exception

Sastra™ Visual Novel Engine — Effects Plugin

Copyright (c) 2026 Ken "Krysion" Nisaka (https://www.krysion.com)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.
*/

// Text effects, written as tags inside a line:
//
//   - erika: I said <shake>get out</shake>!
//   - katya: <wave>Hello there</wave><pause 1> who are you?
//   - erika: That's <color red>my</color> seat, and it's <big>mine</big>, not <small>yours</small>.
//
// and screen effects, as events that run with the next line, like a sprite:
//
//   - shake: strong          light, medium (the default) or strong
//   - flash: white           any colour
//   - blur: on               on, off, or a strength in pixels
//   - zoom: 1.2              how close, from 1 to 3, or off; `duration:` in seconds
//   - vignette: on           on, strong or off
//
// Shake and flash play once. Blur, zoom and the vignette stay until turned off. The
// screen effects move the picture (backgrounds and sprites) and never the buttons or
// the dialogue box. With the system's reduced-motion setting, text stays still, shake is
// skipped and flashes are softer.
(() => {
	const TAGS = 'shake, wave, big, small, color, pause';
	const TAG_TEST = /<(shake|wave|big|small|color|pause)\b/i;
	// Scripts whose letters join or combine, so they move a word at a time, not a letter.
	const JOINED = /[؀-ࣿऀ-෿᠀-᢯]/;
	const PAUSE_DEFAULT = 0.5;
	// Offset in pixels and length in milliseconds of each shake.
	const SHAKE = { light: [5, 400], medium: [10, 550], strong: [18, 750] };
	const BLUR_ON = 4;
	const VIGNETTE = { on: 0.7, strong: 1 };
	// Seconds a zoom takes when `duration:` is left out: in slowly, back out quicker.
	const ZOOM_IN = 4;
	const ZOOM_OUT = 1;
	const STYLE = `
		.fx-word { white-space: nowrap; }
		.fx-char { display: inline-block; }
		.fx-shake .fx-char { animation: fx-shake .32s linear infinite; animation-delay: calc(var(--i) * -71ms); }
		.fx-wave .fx-char { animation: fx-wave 1.2s ease-in-out infinite; animation-delay: calc(var(--i) * 90ms - 12s); }
		.fx-big { font-size: 1.35em; line-height: 1; }
		.fx-small { font-size: .8em; }
		@keyframes fx-shake { 0%, 100% { translate: 0 0; } 25% { translate: .1em -.08em; } 50% { translate: -.09em .07em; } 75% { translate: .07em .1em; } }
		@keyframes fx-wave { 0%, 100% { translate: 0 0; } 50% { translate: 0 -.22em; } }
		.fx-picture { transition: filter var(--fx-blur-time, 0s) ease, scale var(--fx-zoom-time, 0s) ease-in-out; }
		.fx-screen { position: absolute; inset: 0; z-index: 10; pointer-events: none; opacity: 0; }
		.fx-vignette { background: radial-gradient(ellipse at center, transparent 45%, #000 100%); transition: opacity var(--fx-vignette-time, 0s) ease; }
		@media (prefers-reduced-motion: reduce) { .fx-char { animation: none !important; } }
	`;

	let api = null;
	let flash = null;
	let vignette = null;

	const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
	const span = (className) => Object.assign(document.createElement('span'), { className });
	// A tag's setting is written like an attribute with no value: `<pause 1>`, `<color red>`.
	const setting = (element) => element.attributes[0]?.name ?? '';

	// Splits the text inside a shake or wave into one span per letter (per word for joined
	// scripts), numbered through --i so each moves a little after the one before. Each word
	// is kept from breaking across lines; the spaces stay plain text.
	const splitLetters = (root) => {
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		const nodes = [];
		while (walker.nextNode()) nodes.push(walker.currentNode);
		const graphemes = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter() : null;
		let index = 0;
		nodes.forEach(node => {
			const parts = node.nodeValue.split(/(\s+)/).filter(Boolean).map(part => {
				if (/^\s+$/.test(part)) return document.createTextNode(part);
				const word = span('fx-word');
				const letters = JOINED.test(part) ? [part] : graphemes ? [...graphemes.segment(part)].map(item => item.segment) : [...part];
				letters.forEach(letter => {
					const char = span('fx-char');
					char.style.setProperty('--i', index++);
					char.textContent = letter;
					word.append(char);
				});
				return word;
			});
			node.replaceWith(...parts);
		});
	};

	// The engine's text hook. In the dialogue box ('line') each tag becomes its effect and
	// <pause> a data-pause marker the typewriter waits at; in the log the moving effects
	// and pauses are dropped and the colours and sizes kept. An unclosed tag runs to the
	// end of the line, as in HTML; <pause> needs no closing tag. Innermost tags go first.
	const text = (html, { mode }) => {
		if (!TAG_TEST.test(html)) return html;
		const template = document.createElement('template');
		template.innerHTML = html;
		[...template.content.querySelectorAll(TAGS)].reverse().forEach(element => {
			const tag = element.localName;
			const value = setting(element);
			let replacement = null;
			if (tag === 'pause') {
				const seconds = value === '' ? PAUSE_DEFAULT : parseFloat(value);
				if (mode === 'line' && seconds > 0) {
					const marker = span('fx-pause');
					marker.dataset.pause = String(Math.round(seconds * 1000));
					element.before(marker);
				}
			} else if (tag === 'color') {
				if (CSS.supports('color', value)) {
					replacement = span('fx-color');
					replacement.style.color = value;
				} else console.warn(`Sastra effects: \`<color ${value}>\` is not a colour.`);
			} else if (tag === 'big' || tag === 'small') {
				replacement = span(`fx-${tag}`);
			} else if (mode === 'line') {
				replacement = span(`fx-${tag}`);
				splitLetters(element);
			}
			if (replacement) {
				replacement.append(...element.childNodes);
				element.replaceWith(replacement);
			} else {
				element.replaceWith(...element.childNodes);
			}
		});
		return template.innerHTML;
	};

	// Shakes the picture with decreasing random offsets, scaled up a little so its edges
	// stay off screen. The shake uses `transform`, the zoom `scale`, so both can run.
	const shake = (strength) => {
		if (reduced()) return;
		const [offset, duration] = SHAKE[strength];
		const scale = 1 + (offset * 2.5) / Math.min(innerWidth, innerHeight);
		const jitter = (size) => ((Math.random() * 2 - 1) * size).toFixed(1);
		const frames = Array.from({ length: 8 }, (_, i) => {
			const size = offset * (1 - i / 8);
			return { transform: `translate(${jitter(size)}px, ${jitter(size)}px) scale(${scale})` };
		});
		api.picture.animate([{ transform: 'none' }, ...frames, { transform: 'none' }], { duration, easing: 'linear' });
	};

	const lasting = (name, seconds, apply) => {
		api.picture.style.setProperty(`--fx-${name}-time`, `${seconds}s`);
		apply();
	};

	const blur = (pixels, instant) => lasting('blur', instant ? 0 : 0.8, () => {
		api.picture.style.filter = pixels > 0 ? `blur(${pixels}px)` : '';
	});

	const zoom = (level, seconds) => lasting('zoom', seconds, () => {
		api.picture.style.scale = level > 1 ? String(level) : '';
	});

	const shade = (level, instant) => {
		vignette.style.setProperty('--fx-vignette-time', instant ? '0s' : '1s');
		vignette.style.opacity = String(level);
	};

	// Before a checkpoint jump or restart the scene is rebuilt from the start; the
	// replay turns back on whatever was still on at that point.
	const reset = () => {
		blur(0, true);
		zoom(1, 0);
		shade(0, true);
	};

	const word = (value) => value === true ? 'on' : value === false ? 'off' : String(value ?? '').trim().toLowerCase();

	SASTRA.plugin({
		name: 'effects',
		title: 'Effects',
		version: '1.0.0',
		description: 'Make words shake, wave, change colour or size, and pause; shake, flash, blur or zoom the picture, or darken its edges.',
		author: 'Ken Nisaka',
		url: 'https://www.sastra.dev/docs/effects',
		requires: '2.1',

		setup(sastra) {
			api = sastra;
			const style = document.createElement('style');
			style.textContent = STYLE;
			document.head.appendChild(style);
			api.picture.classList.add('fx-picture');
			flash = span('fx-screen fx-flash');
			vignette = span('fx-screen fx-vignette');
			api.picture.append(vignette, flash);
		},

		text,

		on: {
			restore: reset
		},

		events: {
			shake: {
				label: 'Shake the screen',
				passive: true,
				fields: {},
				compile(value, event, error) {
					const strength = value == null || value === true ? 'medium' : word(value);
					if (!SHAKE[strength]) error('`shake:` takes `light`, `medium` or `strong`.');
					return { strength };
				},
				run: (scene, { instant }) => { if (!instant) shake(scene.strength); }
			},
			flash: {
				label: 'Flash the screen',
				passive: true,
				fields: {},
				compile(value, event, error) {
					const color = value == null || value === true ? 'white' : String(value).trim();
					if (!CSS.supports('color', color)) error('`flash:` takes a colour, such as `white`, `red` or `#FF006E`.');
					return { color };
				},
				run(scene, { instant }) {
					if (instant) return;
					flash.style.background = scene.color;
					const soft = reduced();
					flash.animate([{ opacity: 0 }, { opacity: soft ? 0.4 : 0.9, offset: 0.15 }, { opacity: 0 }], { duration: soft ? 900 : 600, easing: 'ease-out' });
				}
			},
			blur: {
				label: 'Blur the picture',
				passive: true,
				fields: {},
				compile(value, event, error) {
					const setting = word(value);
					const pixels = setting === 'on' ? BLUR_ON : setting === 'off' ? 0 : Number(value);
					if (!Number.isFinite(pixels) || pixels < 0 || pixels > 20) error('`blur:` takes `on`, `off`, or a strength from 0 to 20.');
					return { pixels };
				},
				run: (scene, { instant }) => blur(scene.pixels, instant)
			},
			zoom: {
				label: 'Zoom the picture',
				passive: true,
				fields: { duration: { type: 'number', label: 'Seconds' } },
				compile(value, event, error) {
					const level = word(value) === 'off' ? 1 : Number(value);
					if (!Number.isFinite(level) || level < 1 || level > 3) error('`zoom:` takes how close to go, from 1 (normal) to 3, or `off`.');
					const duration = event.duration == null ? (level > 1 ? ZOOM_IN : ZOOM_OUT) : Number(event.duration);
					if (!Number.isFinite(duration) || duration < 0) error('`duration:` is the number of seconds the zoom takes, such as `duration: 3`.');
					return { level, duration };
				},
				run: (scene, { instant }) => zoom(scene.level, instant ? 0 : scene.duration)
			},
			vignette: {
				label: 'Darken the edges',
				passive: true,
				fields: {},
				compile(value, event, error) {
					const setting = word(value);
					const level = setting === 'off' ? 0 : VIGNETTE[setting];
					if (level == null) error('`vignette:` takes `on`, `strong` or `off`.');
					return { level };
				},
				run: (scene, { instant }) => shade(scene.level, instant)
			}
		}
	});
})();
