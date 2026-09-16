# Contributing

Thanks for your interest. Sastra is a small, single-author project, and this page sets expectations so nobody's time is wasted.

## Bugs and ideas: open an issue

The best way to help is an [issue](https://github.com/MrKrysion/Sastra/issues/new/choose).

- **Bug report:** include the engine version (hover the "Made with Sastra" mark in the game, or check `<meta name="app-version">` at the top of `index.html`), your browser, and the smallest chapter file that reproduces it.
- **Feature request:** describe what you're trying to write and why the current events don't cover it. A YAML sketch of how you'd like it to look helps a lot.

Questions about *using* the engine belong in the [documentation](https://www.sastra.dev/docs/) first, then in an issue if the docs don't answer it.

## Code: talk first

Please **open an issue before writing code**, unless the change is a one-line fix. The engine is a single file with strict conventions, and a pull request that doesn't fit them will be closed rather than reworked.

If you do send a pull request:

- **One file.** Everything lives in `index.html`. Don't split it or add a build step.
- **No dependencies.** No CDN scripts, no remote fonts, no network requests at runtime.
- **No comments.** The code is written to be read without them. Only licence notices are allowed.
- **Match the architecture.** Managers are ES6 classes with `#private` fields, rendering uses handler maps (not `switch`), timings live in the `TIMINGS` constant, z-indexes and colours are CSS variables, and UI state is driven by `body[data-*]` attributes.
- **Keep it tight.** No dead code. If you touch an area, leave it cleaner than you found it.
- **Landscape only** inside chapters. Portrait is supported only on the chapter-select menu.
- **Test it** in a browser over `http://` before opening the PR, and say what you tested.

By contributing you agree your code is licensed under the same terms as the engine (GPL-3.0-or-later with the Game Data & Asset Exception).

## Translations

The interface language packs live on the website, not in this repo. If you spot a wrong translation or want to add a language, open an issue with the corrections or the full JSON.
