#!/usr/bin/env sh
# Husky v9 support file. Do not edit.
if [ -z "$HUSBY_0" ]; then
  echo "This script is meant to be run by Husky"
  exit 1
fi

hook_name="$1"
if [ -z "$hook_name" ]; then
  hook_name="$(basename "$0")"
fi

hook_path=". husky/$hook_name"
if [ ! -f "$hook_path" ]; then
  exit 0
fi

. "$(git rev-parse --show-toplevel)/$hook_path"
