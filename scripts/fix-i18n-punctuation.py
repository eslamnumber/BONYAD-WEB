#!/usr/bin/env python3
"""
Normalise boundary punctuation in the locale files so it RENDERS after the text
in both locales, under the app's inverted direction mapping (en->rtl, ar->ltr).

Rule (see docs/i18n-and-rtl.md + project_create_project_wizard memory):
  - Strings rendered in a field that follows the document direction WITHOUT
    auto-detection (no dir="auto", no unicode-bidi:plaintext) need their weak
    punctuation at the LEADING edge of the string so it shows after the text.
    These keys are listed in LEADING_KEYS.
  - Every other string (dir="auto" / plaintext display text) keeps NORMAL
    TRAILING punctuation.

Only boundary punctuation (. ! ? : … ؟ and runs like "...") is moved; internal
punctuation is never touched. Formatting is preserved (targeted text replace),
so the diff is just the changed values.

Usage:
  python3 scripts/fix-i18n-punctuation.py            # dry run (prints changes)
  python3 scripts/fix-i18n-punctuation.py --apply    # writes the files
"""

import json
import sys

FILES = ["src/locales/ar.json", "src/locales/en.json"]
WEAK = set(".!?:…؟")

# Keys whose field follows the document direction with NO auto-detection ->
# weak punctuation must sit at the LEADING edge to render after the text.
LEADING_KEYS = {
    "dashboard.createProject.steps.info.descriptionPlaceholder",
    "dashboard.createProject.steps.deliverables.placeholder",
    "dashboard.createProject.technicianPicker.searchPlaceholder",
    "dashboard.jobOffer.form.messagePlaceholder",
    "messages.inputPlaceholder",
    "dashboard.customer.search.placeholder",
}


def split_punct(s):
    """Return (leading_punct, core, trailing_punct); core keeps internal punct."""
    left = 0
    while left < len(s) and s[left] in WEAK:
        left += 1
    right = len(s)
    while right > left and s[right - 1] in WEAK:
        right -= 1
    return s[:left], s[left:right], s[right:]


def fixed(path, value):
    lead, core, trail = split_punct(value)
    if (not lead and not trail) or core.strip() == "":
        return value  # no boundary punctuation, or string is only punctuation
    punct = trail if trail else lead  # canonical mark (BOTH case -> keep one)
    return (punct + core) if path in LEADING_KEYS else (core + punct)


def walk(node, prefix=""):
    if isinstance(node, dict):
        for key, val in node.items():
            yield from walk(val, f"{prefix}.{key}" if prefix else key)
    elif isinstance(node, str):
        new = fixed(prefix, node)
        if new != node:
            yield prefix, node, new


def main():
    apply = "--apply" in sys.argv
    total = 0
    for filename in FILES:
        with open(filename, encoding="utf-8") as handle:
            raw = handle.read()
        data = json.loads(raw)
        changes = list(walk(data))
        if not changes:
            print(f"{filename}: no changes")
            continue
        print(f"\n{filename}: {len(changes)} change(s)")
        for path, old, new in changes:
            target = "LEADING" if path in LEADING_KEYS else "trailing"
            print(f"  [{target}] {path}\n      - {old!r}\n      + {new!r}")
            old_lit = json.dumps(old, ensure_ascii=False)
            new_lit = json.dumps(new, ensure_ascii=False)
            if raw.count(old_lit) != 1:
                print(f"      !! skipped: {raw.count(old_lit)} matches (not unique)")
                continue
            raw = raw.replace(old_lit, new_lit)
            total += 1
        if apply:
            with open(filename, "w", encoding="utf-8") as handle:
                handle.write(raw)
    print(f"\n{'APPLIED' if apply else 'DRY RUN'} — {total} value(s) "
          f"{'written' if apply else 'would change'}")


if __name__ == "__main__":
    main()
