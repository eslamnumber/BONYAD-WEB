#!/usr/bin/env bash
# UserPromptSubmit router.
# Keep smart-next (token + mapping discipline) as the DEFAULT for ordinary code
# edits, but route design / UI / Figma / RTL prompts into the full
# bonyad-production-design workflow so they follow the app's conventions
# (especially the inverted en->rtl mapping) and end on the full verify gate.
#
# UserPromptSubmit hooks receive the prompt as JSON on stdin; whatever this
# script prints on stdout is injected into the model's context.
set -uo pipefail

DIR="${CLAUDE_PROJECT_DIR:-.}/.claude"
payload="$(cat)"

# Design-specific keywords only — kept tight so ordinary "fix the X page" code
# tasks stay in surgical smart-next mode and token-saving is preserved.
design_re='design|redesign|re-?style|restyl|figma|mockup|\bpdf\b|\bui\b|\brtl\b|\bltr\b|dark mode|responsive|layout|styling|\bstyle\b|visual|glow|hero|landing|polish|theme|(add|build|implement|create|place|insert|put|render)\b.{0,30}\b(section|screen|page|card|widget|panel|component|modal|sidebar|navbar|banner|footer|tab)\b|تصميم|واجهة'

if printf '%s' "$payload" | grep -qiE "$design_re"; then
  cat "$DIR/design-auto.txt" 2>/dev/null || true
else
  cat "$DIR/smart-next-auto.txt" 2>/dev/null || true
fi
