#!/bin/bash
# Builds the graphify code graph (graphify-out/, gitignored) at session start so
# `graphify query|explain|path|affected` answer from the current checkout.
# AST-only (`--code-only`): local tree-sitter, no API key.
#
# Cloud sessions install graphify themselves; on a local machine it is only
# used when already installed (`uv tool install graphifyy`), so the hook never
# installs anything on a developer's computer.
# Wheels only (`--no-build` / `--only-binary`), so installing runs no setup script.
# Fails open: every path exits 0.
set -uo pipefail

GRAPHIFY_VERSION="0.9.95"
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

if ! command -v graphify >/dev/null 2>&1; then
  if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
    exit 0
  fi
  if command -v uv >/dev/null 2>&1; then
    uv tool install --quiet --no-build "graphifyy==${GRAPHIFY_VERSION}" >/dev/null 2>&1
  else
    pip install --quiet --only-binary :all: "graphifyy==${GRAPHIFY_VERSION}" >/dev/null 2>&1
  fi
  command -v graphify >/dev/null 2>&1 || { echo "graphify: install failed, continuing without the graph" >&2; exit 0; }
fi

# Incremental after the first build: only files whose hash changed are re-parsed.
if [ -f graphify-out/graph.json ]; then
  graphify update . >/dev/null 2>&1 || true
else
  graphify extract . --code-only >/dev/null 2>&1 || true
fi
# Report without LLM community naming and without graph.html (unused by agents).
graphify cluster-only . --no-label --no-viz >/dev/null 2>&1 || true

if [ -f graphify-out/graph.json ]; then
  echo "graphify: code graph ready at graphify-out/ - use \`graphify explain|query|path|affected\` before grepping (see CLAUDE.md)."
fi
exit 0
