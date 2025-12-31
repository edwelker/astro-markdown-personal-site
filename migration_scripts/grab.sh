#!/bin/bash

# generic script to bundle files for LLM context
# Usage: ./bundle.sh src/layouts/*.astro src/pages/index.astro

{
  for file in "$@"; do
    if [ -f "$file" ]; then
      echo "--- FILE: $file ---"
      cat "$file"
      echo -e "\n--- END FILE ---\n"
    fi
  done
} | pbcopy

echo "Files bundled and copied to clipboard."
