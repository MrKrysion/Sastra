# Security

The engine makes no network requests of its own and runs entirely in the player's browser, so most issues are about how a game's own files, or a plugin it loads, are handled.

## Reporting a vulnerability

Please report a security problem privately through GitHub: **Security > Report a vulnerability** on this repository. Don't open a public issue for it. You'll get a reply as soon as the maintainer can manage, and a fix is released as a patch version.

## What counts

- Script injection or other ways content in a chapter, config, or language pack could run code it shouldn't.
- Anything that makes the engine request or send data on its own.

## What doesn't

- A plugin doing what plugins can do. A plugin is JavaScript from the game's author and runs with the page's full access, so only install plugins you trust.
- Problems in a game's own content, or in a plugin that isn't part of this repository.

Only the latest release is supported.
