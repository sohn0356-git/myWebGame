#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
NPM_BIN="${NPM_BIN:-/usr/local/bin/npm}"
"$NPM_BIN" run build:assets
