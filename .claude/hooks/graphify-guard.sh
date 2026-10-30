#!/bin/bash
# PreToolUse nudge from `graphify claude install`, made portable: the generated
# hook named an absolute binary path, and errored wherever graphify is absent.
# Fails open - prints nothing and exits 0 when graphify is not installed.
command -v graphify >/dev/null 2>&1 || exit 0
exec graphify hook-guard "$1"
