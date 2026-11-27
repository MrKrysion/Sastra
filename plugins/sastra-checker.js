/*
SPDX-License-Identifier: GPL-3.0-or-later WITH LicenseRef-Sastra-Asset-Exception

Sastra™ Visual Novel Engine — Story Checker Plugin

Copyright (c) 2026 Ken "Krysion" Nisaka (https://www.krysion.com)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.
*/

// Open a chapter with `?check` on your own computer (`?c=2&check`) and this plugin plays
// through every path of it before you start: each choice, each option that can show, and
// each `if:`, with the variables as the story sets them. It then lists what it found:
// mistakes in the file, missing files, endings no path reaches, options that never show,
// events nothing reaches, loops with no way out, and choices that some paths skip because
// none of their options can show. Answers to `input:` are left at their starting values.
// On a published game it does nothing.
(() => {
	// Places the story can be in (a scene with its variables and labels passed) before
	// the checker stops and says the chapter has too many paths to follow them all, and
	// how many different places one scene may be in: a loop that adds to a variable each
	// time round would otherwise never end, so past this the loop isn't followed further.
	const STATE_LIMIT = 50000;
	const PLACE_LIMIT = 64;
	// The most endings seenEnding() may ask about for the checker to try every mix of them
	// reached and not (2^4 plays); past this it tries none and all.
	const ENDING_MIX_LIMIT = 4;

	// The report sits above everything, the engine's error screen included (a missing file
	// raises it), since it lists those problems too.
	const STYLE = `
		.sc-modal { z-index: calc(var(--z-error) + 1); }
		.sc-modal .modal-body { display: flex; flex-direction: column; gap: 16px; }
		.sc-summary { margin: 0; color: var(--ink-2); line-height: 1.5; }
		.sc-section { display: flex; flex-direction: column; gap: 8px; }
		.sc-row { cursor: default; border-radius: 20px; align-items: flex-start; padding-block: 12px; }
		.sc-row .row-title { white-space: normal; overflow: visible; line-height: 1.4; font-weight: 400; }
		.sc-row .row-title b { font-weight: 700; }
		.sc-row > .row-meta:first-child { padding-top: 2px; }
		.sc-row .row-meta .icon { width: 16px; height: 16px; }
		.sc-error .row-meta:first-child { color: var(--danger); }
		.sc-ok .row-meta:first-child { color: var(--color-success); }
	`;

	const escape = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
	const plain = (html) => new DOMParser().parseFromString(String(html ?? ''), 'text/html').body.textContent.trim();

	// Plays the chapter breadth first over every place the story can be in, following
	// the engine's rules: a scene whose `if:` fails is skipped (a skipped choice carries on
	// after its options), a `goto:` jumps, `set:` and an option's `set:` change the
	// variables, a label is remembered for `seen()`, and an `end:` finishes. Returns what
	// it saw, and where the story steps into a loop it can never leave: the scene, and the
	// option picked when that step is a choice. `ended` answers `seenEnding()`.
	const explore = (scenes, start, ended) => {
		const ids = new Map();
		const where = [];
		const edges = [];
		const picks = [];
		const finishes = new Set();
		const reached = new Set();
		const offered = new Set();
		const endings = new Set();
		const skipped = new Set();
		const queue = [];
		const perScene = new Map();
		let truncated = false;
		let capped = false;
		const visit = (state, from, position) => {
			const key = `${state.i}|${JSON.stringify(state.vars)}|${[...state.seen].sort().join(',')}`;
			let id = ids.get(key);
			if (id === undefined) {
				// A place not followed can't be judged, so the one leading to it counts as able
				// to finish: no false "loop with no way out".
				const count = perScene.get(state.i) ?? 0;
				if (count >= PLACE_LIMIT) { capped = true; if (from !== undefined) finishes.add(from); return; }
				if (ids.size >= STATE_LIMIT) { truncated = true; return; }
				perScene.set(state.i, count + 1);
				id = ids.size;
				ids.set(key, id);
				where[id] = state.i;
				edges[id] = [];
				picks[id] = [];
				queue.push([id, state]);
			}
			if (from !== undefined) { edges[from].push(id); picks[from].push(position); }
		};
		const apply = (vars, ops = []) => {
			const next = { ...vars };
			for (const op of ops) next[op.name] = 'add' in op ? next[op.name] + op.add : op.value;
			return next;
		};
		visit({ i: 0, vars: start, seen: new Set() });
		for (let q = 0; q < queue.length; q++) {
			const [id, { i, vars, seen }] = queue[q];
			const scene = scenes[i];
			const go = (index, nextVars = vars, nextSeen = seen, position) => visit({ i: index, vars: nextVars, seen: nextSeen }, id, position);
			if (!scene) { finishes.add(id); continue; }
			const options = scene.type === 'choice' ? scene.options.map((option, position) => ({ option, position })).filter(({ option }) => !option.when || option.when.test(vars, seen, ended)) : [];
			if ((scene.when && !scene.when.test(vars, seen, ended)) || (scene.type === 'choice' && !options.length)) {
				if (scene.type === 'choice' && (!scene.when || scene.when.test(vars, seen, ended))) skipped.add(i);
				go(scene.type === 'choice' ? scene.afterIndex : i + 1);
				continue;
			}
			reached.add(i);
			if (scene.type === 'end') { endings.add(i); finishes.add(id); }
			else if (scene.type === 'jump') go(scene.target);
			else if (scene.type === 'set') go(i + 1, apply(vars, scene.ops));
			else if (scene.type === 'label') go(i + 1, vars, scene.name ? new Set([...seen, scene.name]) : seen);
			else if (scene.type === 'choice') {
				for (const { option, position } of options) {
					offered.add(`${i}:${position}`);
					go(option.target, apply(vars, option.ops), seen, position);
				}
			} else go(i + 1);
		}
		const canFinish = new Set(finishes);
		const before = edges.map(() => []);
		edges.forEach((targets, from) => targets.forEach((to) => before[to].push(from)));
		const back = [...finishes];
		while (back.length) for (const from of before[back.pop()]) if (!canFinish.has(from)) { canFinish.add(from); back.push(from); }
		const stuck = new Map();
		if (!truncated) {
			if (!canFinish.has(0)) stuck.set('start', { i: 0 });
			edges.forEach((targets, from) => {
				if (!canFinish.has(from)) return;
				targets.forEach((to, k) => { if (!canFinish.has(to)) stuck.set(`${where[from]}:${picks[from][k]}`, { i: where[from], position: picks[from][k] }); });
			});
		}
		return { reached, offered, endings, skipped, stuck: [...stuck.values()], truncated, capped, places: ids.size };
	};

	// The checker can't know which endings a player reached before, so a chapter using
	// seenEnding() is played once for each mix of them, and what any play saw counts.
	const both = (a, b) => ({
		reached: new Set([...a.reached, ...b.reached]),
		offered: new Set([...a.offered, ...b.offered]),
		endings: new Set([...a.endings, ...b.endings]),
		skipped: new Set([...a.skipped, ...b.skipped]),
		stuck: [...new Map([...a.stuck, ...b.stuck].map((place) => [`${place.i}:${place.position}`, place])).values()],
		truncated: a.truncated || b.truncated,
		capped: a.capped || b.capped,
		places: a.places + b.places
	});

	// Turns what the chapter compiled to, what explore() saw, the compile problems and
	// the missing files into sections of rows: [title, [{ level, text, event }]].
	const findings = (story, scenes, seen, problems, missing) => {
		const lines = story.lines();
		const where = (event) => event ? `Event ${event}${lines[event - 1] ? `, line ${lines[event - 1]}` : ''}` : '';
		const sections = [];
		const add = (title, rows) => { if (rows.length) sections.push([title, rows]); };
		const flagged = new Set(problems.map((problem) => problem.event));
		add('Mistakes in the file', problems.map((problem) => ({ level: problem.severity, text: escape(problem.message), place: where(problem.event) })));
		add('Missing files', missing.map((src) => ({ level: 'error', text: `<b>${escape(src)}</b> isn't in the game folder.` })));
		const ends = scenes.map((scene, i) => [scene, i]).filter(([scene]) => scene.type === 'end');
		add('Endings', ends.map(([scene, i]) => {
			const name = `<b>${escape(plain(scene.title) || 'An ending')}</b>${scene.id ? ` (${escape(scene.id)})` : ''}`;
			return seen.endings.has(i)
				? { level: 'ok', text: `${name} can be reached.`, place: where(scene.eventNumber) }
				: { level: 'warning', text: `${name} is never reached: no path through the choices and if: tests leads there.`, place: where(scene.eventNumber) };
		}));
		const options = [];
		scenes.forEach((scene, i) => {
			if (scene.type !== 'choice' || !seen.reached.has(i)) return;
			scene.options.forEach((option, position) => {
				if (!seen.offered.has(`${i}:${position}`)) options.push({ level: 'warning', text: `The option <b>${escape(plain(option.text))}</b> never shows: its if: is false on every path.`, place: where(scene.eventNumber) });
			});
		});
		add('Options', options);
		const never = new Map();
		scenes.forEach((scene, i) => {
			const shows = !scene.isPassive || ['background', 'audio', 'sprite', 'sprites'].includes(scene.type);
			if (shows && scene.type !== 'chapter' && scene.type !== 'end' && !seen.reached.has(i) && !flagged.has(scene.eventNumber) && !never.has(scene.eventNumber)) never.set(scene.eventNumber, { level: 'warning', text: 'This event is never reached: the choices and if: tests before it never let the story get there.', place: where(scene.eventNumber) });
		});
		add('Events never reached', seen.truncated ? [] : [...never.values()]);
		add('Loops', seen.stuck.map(({ i, position }) => ({
			level: 'error',
			text: position !== undefined
				? `Picking <b>${escape(plain(scenes[i].options[position].text))}</b> leads into a loop with no way out: the story can never finish after it.`
				: 'After this, the story goes round a loop with no way out and can never finish.',
			place: where(scenes[i].eventNumber)
		})));
		add('Choices skipped', [...seen.skipped].map((i) => ({ level: 'warning', text: 'On some paths none of this choice\'s options can show, so the story carries on after it without asking.', place: where(scenes[i].eventNumber) })));
		add('Sound', sound(scenes, where));
		return sections;
	};

	// play: events next to music:, sound: or voice:. Only a chapter that mixes them gets the
	// tip, since only then the player has channel sliders that these older events don't
	// follow. An id named like a channel would be caught by `stop: music` and the like.
	const CHANNELS = ['music', 'sound', 'voice'];
	const sound = (scenes, where) => {
		const plays = scenes.filter((scene) => scene.type === 'audio' && scene.action === 'play');
		const clashes = plays.filter((scene) => !scene.channel && CHANNELS.includes(scene.id)).map((scene) => ({
			level: 'warning',
			text: `This play: has the id <b>${escape(scene.id)}</b>, the name of a sound channel, so <b>stop: ${escape(scene.id)}</b> also stops everything on that channel. Give it another id.`,
			place: where(scene.eventNumber)
		}));
		const loose = plays.filter((scene) => !scene.channel);
		if (!loose.length || !plays.some((scene) => scene.channel)) return clashes;
		const list = (items) => {
			const numbers = items.map((scene) => scene.eventNumber);
			return numbers.length <= 5 ? numbers.join(', ') : `${numbers.slice(0, 4).join(', ')} and ${numbers.length - 4} more`;
		};
		const loops = loose.filter((scene) => scene.loop === true);
		const once = loose.filter((scene) => scene.loop !== true);
		const tip = [
			loops.length && `Looping ones could be <b>music:</b> (event${loops.length > 1 ? 's' : ''} ${list(loops)}).`,
			once.length && `The others could be <b>sound:</b> (event${once.length > 1 ? 's' : ''} ${list(once)}).`
		].filter(Boolean).join(' ');
		return [...clashes, {
			level: 'tip',
			text: `${loose.length} play: event${loose.length > 1 ? 's' : ''} follow${loose.length > 1 ? '' : 's'} only the main volume, not the sliders for music, sound effects and voice. ${tip} Or add <b>channel:</b> to them. Change any stop: or volume: that names their id too.`
		}];
	};

	const icon = { ok: 'success', warning: 'warning', error: 'error', tip: 'info' };

	const show = (overlay, sections, notes) => {
		const counts = sections.flatMap(([, rows]) => rows).reduce((total, row) => ({ ...total, [row.level]: (total[row.level] || 0) + 1 }), {});
		const clean = !counts.error && !counts.warning;
		const summary = clean ? 'No problems found.' : [counts.error && `${counts.error} ${counts.error === 1 ? 'problem' : 'problems'}`, counts.warning && `${counts.warning} ${counts.warning === 1 ? 'warning' : 'warnings'}`].filter(Boolean).join(' and ') + ' found.';
		overlay.innerHTML = `
			<div class="modal-overlay menu-modal sc-modal active" role="dialog" aria-modal="true" aria-labelledby="sc-title">
				<div class="modal-content" tabindex="-1">
					<div class="modal-head">
						<div class="modal-title" id="sc-title"><i class="icon" data-icon="${clean ? 'success' : 'warning'}"></i><span>Story check</span></div>
						<button class="close-button" data-sc="close" aria-label="Close"><i class="icon" data-icon="close"></i></button>
					</div>
					<div class="modal-body scrollbar">
						<p class="sc-summary">${summary} ${notes.join(' ')}</p>
						${sections.map(([title, rows]) => `
							<div class="sc-section">
								<div class="eyebrow">${title}</div>
								<div class="rows">${rows.map((row) => `<div class="row sc-row sc-${row.level === 'warning' ? 'warn' : row.level}"><span class="row-meta"><i class="icon" data-icon="${icon[row.level]}"></i></span><span class="row-title">${row.text}</span>${row.place ? `<span class="row-meta">${row.place}</span>` : ''}</div>`).join('')}</div>
							</div>`).join('')}
					</div>
				</div>
			</div>`;
		const modal = overlay.querySelector('.sc-modal');
		const close = () => { modal.classList.remove('active'); document.removeEventListener('keydown', onKey, true); };
		const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } };
		document.addEventListener('keydown', onKey, true);
		modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-sc="close"]')) close(); });
		modal.querySelector('.modal-content').focus();
	};

	let api = null;

	const check = async () => {
		const story = api.story;
		const scenes = story.scenes();
		const asked = [...new Set(scenes.flatMap((scene) => [scene.when, ...(scene.options || []).map((option) => option.when)]).flatMap((when) => when?.endings || []).map(({ id, file }) => `${file ?? ''}:${id}`))];
		const every = asked.length <= ENDING_MIX_LIMIT;
		const mixes = every ? Array.from({ length: 2 ** asked.length }, (_, mask) => asked.filter((key, bit) => mask & (1 << bit))) : [[], asked];
		const seen = mixes.map((mix) => explore(scenes, story.vars(), (id, file) => mix.includes(`${file ?? ''}:${id}`))).reduce(both);
		const problems = story.problems();
		const missing = await story.missingFiles();
		const notes = [];
		if (seen.truncated) notes.push(`The chapter has too many paths to follow them all (it stopped after ${seen.places.toLocaleString('id-ID')} places), so endings, options and events may be reached that it didn't see.`);
		else if (seen.capped) notes.push('Some loops change a variable each time round, so the checker followed them a limited number of times.');
		if (asked.length) notes.push(every ? 'seenEnding() was tried with every mix of endings reached before.' : `seenEnding() asks about ${asked.length} endings, so it was tried only with none of them reached before and with all of them.`);
		if (scenes.some((scene) => scene.type === 'input')) notes.push('Answers to input: were left at their starting values.');
		show(api.overlay(), findings(story, scenes, seen, problems, missing), notes);
	};

	SASTRA.plugin({
		name: 'checker',
		title: 'Story Checker',
		version: '1.0.0',
		description: 'Plays through every path of a chapter and lists what needs fixing: mistakes, missing files, endings no path reaches, options that never show. Open a chapter with ?check on your own computer.',
		author: 'Ken Nisaka',
		url: 'https://www.sastra.dev/docs/checker',
		requires: '2.1',
		setup(pluginApi) {
			if (!pluginApi.local || !new URLSearchParams(location.search).has('check')) return;
			api = pluginApi;
			const style = document.createElement('style');
			style.textContent = STYLE;
			document.head.appendChild(style);
		},
		on: {
			// The chapter's files are listed right after this happening, so the check waits
			// a turn before asking which are missing.
			chapter: () => { if (api) setTimeout(check, 0); }
		}
	});
})();
