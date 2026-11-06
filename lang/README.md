# Interface language packs

These JSON files translate the engine's own interface (buttons, menus, messages). They are separate from a game's story text. English is built into the engine, so a pack only needs the languages you add.

To use one, copy its file into your game's `lang/` folder and set `language:` in `config.yaml` to its code (for example `fr-FR`). The engine tries the full code first, then its primary part (`fr-FR`, then `fr`). A string a pack leaves out falls back to English.

## Adding or fixing a language

1. Copy `en-GB.json` to a new file named with the language code, or open the existing one.
2. Translate the **values**. Keep the keys, and keep placeholders like `{name}` and `{chapter}` exactly as they are.
3. Add the language to `index.json` if it is new.
4. Open a pull request.

## Say it the way people say it

A pack is not a word-for-word translation. For every string, ask what a native speaker would say for that idea in an app or a game, and use the term people actually see in the software they use every day: the wording of YouTube's player, your operating system, or well-known visual novels. If English borrows a word and your language has borrowed it too (`checkpoint` is a common one), use the borrowed word.

- Pick one level of address (formal or informal) and keep it everywhere.
- Prefer the short, familiar term for a control. "Fullscreen" is a label, not a sentence.
- Deleting progress should read as deleting, not as changing a setting.
- A translated string is an interface label first. Fit matters: buttons are small.

If you are unsure, open the pull request anyway and say which strings you doubt.
