import os
import re

# --- CONFIGURATION ---
# ONLY these fields will survive. Everything else gets deleted.
ALLOWED_KEYS = {"title", "description", "date", "tags", "draft", "layout", "slug"}
# ---------------------


def clean_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    if not lines or lines[0].strip() != "---":
        return

    new_lines = []
    in_frontmatter = False
    fence_count = 0
    modified = False
    dropped_keys = []

    for line in lines:
        stripped = line.strip()

        # Handle delimiters
        if stripped == "---":
            fence_count += 1
            new_lines.append(line)
            if fence_count == 1:
                in_frontmatter = True
            elif fence_count == 2:
                in_frontmatter = False
            continue

        # Process Frontmatter Content
        if in_frontmatter:
            # Check if this line looks like a key "key: value"
            # We look for the first colon
            if ":" in line:
                key = line.split(":", 1)[0].strip()

                # Check against allowlist
                if key in ALLOWED_KEYS:
                    new_lines.append(line)
                else:
                    # It's garbage, drop it
                    dropped_keys.append(key)
                    modified = True
            else:
                # If it's a continuation line (like a list item not on the same line as key)
                # This is tricky without a real YAML parser.
                # For safety, if we aren't sure, we usually keep it or drop it based on the previous key.
                # BUT, assuming your FM is simple key:value, dropping lines without colons is usually safe
                # unless you have multi-line lists.

                # Simple Heuristic: If it starts with space/tab and dash, it's a list item.
                # We will blindly KEEP indentation for now to avoid breaking multi-line tags.
                # Realistically, most "garbage" fields (guid, id) are single lines.
                if line.startswith(" ") or line.startswith("\t"):
                    new_lines.append(line)
                else:
                    # Likely a weird artifact or empty line, drop it
                    pass
        else:
            # Content body - keep everything
            new_lines.append(line)

    if modified:
        print(f"Cleaned {os.path.basename(filepath)}")
        print(f"  - Removed: {', '.join(dropped_keys)}")

        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)


def main():
    target_dir = "src/content"  # Adjust if your posts are elsewhere
    print(f"Pruning frontmatter in {target_dir}...")
    print(f"Keeping only: {', '.join(ALLOWED_KEYS)}\n")

    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith(".md") or file.endswith(".mdx"):
                clean_file(os.path.join(root, file))

    print("\nDone.")


if __name__ == "__main__":
    main()
