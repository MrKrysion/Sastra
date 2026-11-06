/*
SPDX-License-Identifier: GPL-3.0-or-later WITH LicenseRef-Sastra-Asset-Exception

Sastra™ Visual Novel Engine — Screens Plugin 1.1.0

Copyright (c) 2026 Ken "Krysion" Nisaka (https://www.krysion.com)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.
*/

(() => {
	const FADE = 500;
	const REVEAL_TIMEOUT = 3000;
	const CSS_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
	const REFERENCES = [
		['img, audio, video, source, track, script, iframe, embed', 'src'],
		['video', 'poster'],
		['link[rel~="stylesheet"], link[rel~="preload"], link[rel~="modulepreload"], image, use', 'href'],
		['object', 'data']
	];
	const MESSAGES = { close: 'sastra:close', ready: 'sastra:ready', state: 'sastra:state' };
	const STYLE = `
		.plugin-layer[data-event="screen"] { background: #000; }
		.plugin-layer[data-event="screen"] iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; }
	`;

	const root = new URL('.', location.href).href;
	const scans = new Map();
	let api = null;
	let current = null;

	const toKey = (ref, base) => {
		const value = ref?.trim();
		if (!value || /^(data|blob|javascript|about|mailto):/i.test(value) || value.startsWith('#')) return null;
		try {
			const url = new URL(value, base);
			if (url.origin !== location.origin) return null;
			url.hash = '';
			const href = url.href.startsWith(root) ? url.href.slice(root.length) : url.href;
			try { return decodeURI(href); } catch (e) { return href; }
		} catch (e) { return null; }
	};

	const references = (doc) => {
		const refs = REFERENCES.flatMap(([selector, attr]) => [...doc.querySelectorAll(selector)].map(el => el.getAttribute(attr)));
		const css = [...doc.querySelectorAll('style')].map(el => el.textContent)
			.concat([...doc.querySelectorAll('[style]')].map(el => el.getAttribute('style')))
			.join('\n');
		for (const match of css.matchAll(CSS_URL)) refs.push(match[2]);
		return refs;
	};

	const scan = (src) => {
		if (!scans.has(src)) scans.set(src, (async () => {
			const files = new Set([src]);
			try {
				const response = await fetch(src);
				if (response.ok) {
					const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
					const base = new URL(doc.querySelector('base[href]')?.getAttribute('href') ?? '', new URL(src, location.href));
					references(doc).forEach(ref => { const key = toKey(ref, base); if (key) files.add(key); });
				}
			} catch (e) {}
			return [...files];
		})());
		return scans.get(src);
	};

	const sync = () => {
		if (!current) return;
		const { volume, paused, language } = api.state;
		current.frame.contentWindow?.postMessage({ type: MESSAGES.state, volume, paused, language, replay: current.replay }, '*');
	};

	const dismiss = (instant) => {
		if (!current) return;
		const { frame } = current;
		current = null;
		setTimeout(() => frame.remove(), instant ? 0 : FADE);
	};

	const open = (scene, ctx) => {
		const frame = document.createElement('iframe');
		const entry = { frame, replay: api.progress.passed(api.state.index), close: () => { if (current === entry) ctx.done(); } };
		frame.title = scene.src;
		frame.allow = 'autoplay; fullscreen; gamepad';
		let shown = false;
		const reveal = () => {
			if (shown || current !== entry) return;
			shown = true;
			ctx.show();
			frame.focus();
		};
		frame.addEventListener('load', () => {
			try { frame.contentWindow.close = entry.close; } catch (e) {}
			if (current !== entry) return;
			sync();
			reveal();
		});
		frame.src = scene.src;
		current = entry;
		ctx.layer.appendChild(frame);
		setTimeout(reveal, REVEAL_TIMEOUT);
	};

	SASTRA.plugin({
		name: 'screens',
		requires: '2.0',

		setup(sastra) {
			api = sastra;
			const style = document.createElement('style');
			style.textContent = STYLE;
			document.head.appendChild(style);

			window.addEventListener('message', (e) => {
				if (!current || e.source !== current.frame.contentWindow) return;
				const type = e.data?.type ?? e.data;
				if (type === MESSAGES.close) current.close();
				else if (type === MESSAGES.ready) sync();
			});

			window.addEventListener('keydown', (e) => {
				if (!current) return;
				e.stopImmediatePropagation();
				if (e.target.closest?.('input, select, textarea')) return;
				e.preventDefault();
				current.frame.focus();
			}, true);

			document.addEventListener('click', () => {
				if (current && !document.activeElement?.matches('input, select, textarea')) current.frame.focus();
			});
		},

		on: {
			volume: sync,
			pause: sync
		},

		events: {
			screen: {
				compile(value, event, error) {
					if (typeof value !== 'string' || !value.trim()) error('"screen:" needs a file path.');
					return { src: value.trim() };
				},
				assets: (scene) => scan(scene.src),
				run: open,
				stop: (scene, { instant }) => dismiss(instant)
			}
		}
	});
})();
