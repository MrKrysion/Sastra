# Contributing

Thanks for your interest. Sastra is a small project with one maintainer, and this page sets expectations so nobody's time is wasted.

## Bugs and ideas: open an issue

The best way to help is an [issue](https://github.com/MrKrysion/Sastra/issues/new/choose).

- **Bug report:** include the engine version (hover the "Made with Sastra" mark in the game, or check `<meta name="app-version">` at the top of `index.html`), your browser, and the smallest chapter file that reproduces it.
- **Feature request:** describe what you're trying to write and why the current events don't cover it. A YAML sketch of how you'd like it to look helps a lot.

Questions about *using* the engine belong in the [documentation](https://www.sastra.dev/docs/) first, then in an issue if the docs don't answer it.

## Translations

The official plugins are in [`plugins/`](plugins/README.md) and the skins in [`skins/`](skins/README.md). The interface language packs are in [`lang/`](lang/README.md), and fixes and new languages are welcome as pull requests. A pack should say things the way a native speaker would, not translate the English word for word. The guide in `lang/README.md` explains how.

## Code: talk first

Please **open an issue before writing code**, unless the change is a one-line fix. The engine is a single file with strict conventions, and a pull request that doesn't fit them will be closed rather than reworked. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) first.

If you do send a pull request:

- **One file.** Everything lives in `index.html`. Don't split it or add a build step.
- **No dependencies.** No CDN scripts, no remote fonts, no network requests at runtime.
- **Comment the source.** Explain what a class owns, and why a piece of code is the way it is: browser workarounds, ordering, and race guards, anything a reader would otherwise have to rediscover. Don't restate what the code says. Methods that other classes call get a short doc comment. Releases ship the file with every comment stripped, so comments cost players nothing.
- **Match the architecture.** Managers are ES6 classes with `#private` fields, rendering uses handler maps (not `switch`), timings live in the `TIMINGS` constant, z-indexes and colours are CSS variables, and UI state is driven by `body[data-*]` attributes.
- **Keep it tight.** No dead code. If you touch an area, leave it cleaner than you found it.
- **Landscape only** inside chapters. Portrait is supported only on the chapter-select menu.
- **Test it** in a browser over `http://` before opening the PR, and say what you tested.

## Licence of your contribution

Sastra is licensed under the GPL-3.0-or-later with the Game Data & Asset Exception (see [`LICENSE`](LICENSE) and [`LICENSE-EXCEPTION.txt`](LICENSE-EXCEPTION.txt)).

- **You keep the copyright** in what you contribute.
- Your contribution is licensed to everyone under the same terms as the engine.
- You also give Ken "Krysion" Nisaka a perpetual, worldwide, non-exclusive, royalty-free, irrevocable right to use, modify, sublicense, and relicense your contribution, under any licence, including a commercial or closed one. This lets the engine's licensing change in future without tracking down every contributor.
- You confirm that the contribution is your own work, or that you have the right to submit it under these terms.

The pull request template has a checkbox for this. A pull request without it ticked won't be merged.
