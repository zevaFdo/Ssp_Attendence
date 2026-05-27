# PDF Fonts

This directory bundles the Japanese-capable fonts used by the PDF generator
(`src/lib/pdf/generator.ts`) to render approval documents in both English and
Japanese.

The default Helvetica font shipped by `pdfkit` cannot render kanji or kana —
Japanese characters would print as `□`. Bundling a Japanese-aware font is
therefore mandatory once `preferred_language = 'ja'`.

## Files

- `NotoSansJP-Regular.otf` — Noto Sans JP regular weight
- `NotoSansJP-Bold.otf` — Noto Sans JP bold weight

Both files are sourced from
[github.com/notofonts/noto-cjk](https://github.com/notofonts/noto-cjk) and are
licensed under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL).

## Replacing or upgrading

If you need to upgrade the fonts, drop the new `.otf` files in this directory
with the same filenames. The PDF generator falls back to Helvetica with a
console warning if a font is missing — fine for English-only output but
broken for Japanese.
