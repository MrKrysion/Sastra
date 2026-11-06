/*
SPDX-License-Identifier: GPL-3.0-or-later WITH LicenseRef-Sastra-Asset-Exception

Sastra™ Visual Novel Engine — Analytics Plugin

Copyright (c) 2026 Ken "Krysion" Nisaka (https://www.krysion.com)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.
*/

(() => {
	const PATH = location.pathname;
	const CONSENT_KEY = `sastra:consent:${PATH}`;
	const TIME_KEY = (id) => `sastra:playtime:${PATH}:${id}`;
	const IDLE_LIMIT = 120000;
	const TICK = 5000;

	const ls = {
		get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
		set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
		del: (k) => { try { localStorage.removeItem(k); } catch (e) {} }
	};

	const dataLayer = window.dataLayer = window.dataLayer || [];
	const gtag = (...args) => dataLayer.push(args);

	let measurementId = null;
	let gtagReady = false;
	let consent = ls.get(CONSENT_KEY);
	let creditsStart = null;
	let ui = null;
	let overlay = null;

	const hasConsent = () => consent === 'granted';

	const applyConsentMode = () => gtag('consent', 'update', {
		analytics_storage: hasConsent() ? 'granted' : 'denied',
		ad_storage: 'denied'
	});

	const loadGtag = () => {
		if (gtagReady || !measurementId) return;
		gtagReady = true;
		gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' });
		const s = document.createElement('script');
		s.async = true;
		s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
		document.head.appendChild(s);
		gtag('js', new Date());
		gtag('config', measurementId, { anonymize_ip: true });
		applyConsentMode();
	};

	const setConsent = (value) => {
		consent = value;
		ls.set(CONSENT_KEY, value);
		if (value === 'granted') loadGtag();
		if (gtagReady) applyConsentMode();
	};

	const track = (event, params) => {
		if (!hasConsent() || !gtagReady) return;
		gtag('event', event, params || {});
	};

	const timer = {
		id: null,
		runningStart: null,
		lastActivity: Date.now(),
		idle: false,
		get accumulated() { return Number(ls.get(TIME_KEY(this.id))) || 0; },
		set accumulated(ms) { ls.set(TIME_KEY(this.id), String(Math.max(0, Math.round(ms)))); },
		load(id) {
			this.id = id || 'unknown';
			this.runningStart = null;
			this.idle = false;
			this.lastActivity = Date.now();
			this.resume();
		},
		resume() {
			if (this.id && this.runningStart == null && document.visibilityState === 'visible') this.runningStart = Date.now();
		},
		flush() {
			if (this.runningStart == null) return;
			this.accumulated = this.accumulated + (Date.now() - this.runningStart);
			this.runningStart = null;
		},
		total() { this.flush(); return this.accumulated; },
		clear() { if (this.id) ls.del(TIME_KEY(this.id)); this.runningStart = null; }
	};

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') { timer.flush(); return; }
		timer.lastActivity = Date.now();
		timer.idle = false;
		timer.resume();
	});

	window.addEventListener('pagehide', () => timer.flush());

	['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => {
		timer.lastActivity = Date.now();
		if (timer.idle) { timer.idle = false; timer.resume(); }
	}, { passive: true }));

	setInterval(() => {
		if (timer.runningStart == null) return;
		const inactive = Date.now() - timer.lastActivity;
		if (inactive <= IDLE_LIMIT) { timer.flush(); timer.resume(); return; }
		timer.flush();
		timer.accumulated = timer.accumulated - inactive;
		timer.idle = true;
		track('idle_timeout', { idle_seconds: Math.round(inactive / 1000) });
	}, TICK);

	const handle = ({ event, params = {} }) => {
		if (!event) return;

		if (event === 'chapter_started') timer.load(params.chapter_id);

		if (event === 'chapter_completed') {
			const seconds = Math.round(timer.total() / 1000);
			timer.clear();
			track('chapter_completed', { ...params, time_spent: seconds });
			return;
		}

		if (event === 'credits_open') { creditsStart = Date.now(); return; }
		if (event === 'credits_close') {
			if (creditsStart != null) track('credits_viewed', { time_spent: Math.round((Date.now() - creditsStart) / 1000) });
			creditsStart = null;
			return;
		}

		track(event, params);
	};

	const STYLE = `
		.sa-banner {
			position: fixed;
			left: 20px;
			bottom: 20px;
			width: min(520px, calc(100vw - 40px));
			padding: 22px 24px;
			border-radius: var(--r-card);
			background: var(--color-panel-bg);
			color: var(--color-text);
			box-shadow: var(--shadow-lg);
			font-family: var(--font-ui);
			z-index: calc(var(--z-modal) - 1);
			opacity: 0;
			visibility: hidden;
			transform: translateY(16px);
			transition: opacity .3s var(--ease-out), transform .3s var(--ease-out), visibility .3s;
		}
		.sa-banner.sa-show { opacity: 1; visibility: visible; transform: none; }
		.sa-banner h2 { margin: 0 0 6px; font-size: 1.1rem; font-weight: 700; }
		.sa-banner p { margin: 0 0 16px; font-size: .95rem; line-height: 1.5; color: var(--ink-2); }
		.sa-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
		.sa-setting { margin-top: 16px; }
		.sa-setting strong { display: block; color: var(--color-text); }
		.sa-setting small { font-size: .88rem; color: var(--color-muted-text); }
		@media (max-width: 760px) {
			.sa-banner { left: 12px; bottom: 12px; width: calc(100vw - 24px); padding: 18px 20px; }
			.sa-actions .ui-button { flex: 1; }
		}
	`;

	const buildUI = () => {
		if (ui) return;
		const style = document.createElement('style');
		style.textContent = STYLE;
		document.head.appendChild(style);

		const root = document.createElement('div');
		root.dir = document.documentElement.dir || 'ltr';
		root.innerHTML = `
			<div class="sa-banner" role="dialog" aria-labelledby="sa-banner-title">
				<h2 id="sa-banner-title">Cookies</h2>
				<p>We use cookies to measure how players experience this story. No personal data is sold or shared.</p>
				<div class="sa-actions">
					<button class="ui-button secondary" data-sa="decline">Decline</button>
					<button class="ui-button" data-sa="accept"><i class="icon" data-icon="check"></i><span>Accept</span></button>
				</div>
			</div>
			<div class="modal-overlay menu-modal" role="dialog" aria-modal="true" aria-labelledby="sa-modal-title">
				<div class="modal-content modal-confirm">
					<div class="modal-head">
						<div class="modal-title" id="sa-modal-title"><i class="icon" data-icon="cookie"></i><span>Cookie settings</span></div>
						<button class="close-button" data-sa="close" aria-label="Close"><i class="icon" data-icon="close"></i></button>
					</div>
					<div class="modal-body">
						Choose whether anonymous analytics may be collected to help improve this visual novel.
						<div class="setting sa-setting">
							<span><strong>Analytics</strong><small>Anonymous usage statistics via Google Analytics.</small></span>
							<button class="switch" role="switch" aria-checked="false" aria-label="Analytics" data-sa="toggle"></button>
						</div>
					</div>
					<div class="modal-foot">
						<button class="ui-button" data-sa="save"><i class="icon" data-icon="check"></i><span>Save preferences</span></button>
					</div>
				</div>
			</div>`;
		overlay.appendChild(root);

		const banner = root.querySelector('.sa-banner');
		const modal = root.querySelector('.modal-overlay');
		const toggle = root.querySelector('[data-sa="toggle"]');

		const hideBanner = () => banner.classList.remove('sa-show');
		const openModal = () => { toggle.ariaChecked = String(hasConsent()); modal.classList.add('active'); };
		const closeModal = () => modal.classList.remove('active');

		root.addEventListener('click', (e) => {
			const action = e.target.closest('[data-sa]')?.dataset.sa;
			if (action === 'accept') { setConsent('granted'); hideBanner(); }
			else if (action === 'decline') { setConsent('denied'); hideBanner(); }
			else if (action === 'toggle') toggle.ariaChecked = String(toggle.ariaChecked !== 'true');
			else if (action === 'save') { setConsent(toggle.ariaChecked === 'true' ? 'granted' : 'denied'); closeModal(); }
			else if (action === 'close' || e.target === modal) closeModal();
		});

		ui = { banner, modal, openModal, showBanner: () => requestAnimationFrame(() => banner.classList.add('sa-show')) };
	};

	SASTRA.plugin({
		name: 'analytics',
		title: 'Google Analytics',
		version: '2.0.1',
		description: 'See how players find and play your game, with Google Analytics.',
		author: 'Ken Nisaka',
		url: 'https://www.sastra.dev/docs/#analytics',
		requires: '2.0',
		setup(api) {
			overlay = api.overlay();
			measurementId = typeof api.config.analytics_id === 'string' ? api.config.analytics_id.trim() : '';
			if (!measurementId) return;
			buildUI();
			if (hasConsent()) loadGtag();
			else if (consent == null) ui.showBanner();
		},
		on: {
			analytics: handle,
			cookies: () => { if (measurementId) ui.openModal(); }
		}
	});
})();
