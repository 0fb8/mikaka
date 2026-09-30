# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

みかか変換 is a static web page that converts text between Japanese kana-input and the characters typed in romaji (alphanumeric) input on a JIS keyboard. For example, `3` becomes `あ` and `t` becomes `か`. The page is live at https://0fb8.github.io/mikaka/.

There's no build step, package manager, linter, or test suite. The page is plain HTML, CSS, and JS.

## Running locally

`script.js` loads `js/rules.txt` with `fetch`, so opening `index.html` over `file://` won't work. Serve the repo root over HTTP instead:

```sh
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Deployment

`.github/workflows/deploy.yml` publishes the entire repo root to GitHub Pages on every push to `main`. Anything committed to `main` goes live.

## Architecture

- `js/rules.txt` is the only source of mapping data. It has one `key,kana` pair per line with LF line endings. The key is split at the **last** comma so the line `,,ね` parses correctly; keep this in mind if the format changes.
- `js/script.js` builds two lookup tables from that file, `engToJpn` and `jpnToEng`. Each textarea's `input` event rewrites the other textarea's contents.
- Conversion runs one UTF-16 code unit at a time (`split("")`) with a direct table lookup, and unmapped characters pass through unchanged. As a result:
  - `rules.txt` has no voiced or semi-voiced kana. Those are handled around `convert()` instead. `decomposeMarks()` splits `が` into `か゛` before kana → key conversion, and `composeMarks()` merges `か゛` back into `が` after key → kana conversion. Normalization runs one character at a time and only on kana that have a rule; running NFD over the whole string would break text like `é`. Katakana has no rules, so it passes through unchanged.
  - Duplicate keys overwrite earlier ones. `\` maps to both `ー` and `ろ`, so `engToJpn["\\"]` ends up as `ろ` while both kana map back to `\`.
