import os
import re


def clean_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    if not lines or lines[0].strip() != "---":
        return

    new_lines = []
    in_frontmatter = False
    frontmatter_count = 0
    skipping_key = False
    found_content = []
    modified = False

    for line in lines:
        stripped = line.strip()

        # Detect Frontmatter delimiters
        if stripped == "---":
            frontmatter_count += 1
            if frontmatter_count == 1:
                in_frontmatter = True
            elif frontmatter_count == 2:
                in_frontmatter = False
                skipping_key = False  # Ensure we stop skipping when FM ends

        # Logic while inside frontmatter
        if in_frontmatter:
            # Check if this line starts the target key
            if line.startswith("wp-syntax-cache-content:"):
                skipping_key = True
                modified = True
                # Capture the content part of this line
                content_part = line.split(":", 1)[1].strip()
                if content_part:
                    found_content.append(content_part)
                continue  # Do not add this line to new_lines

            # If we are currently skipping a multi-line value
            if skipping_key:
                # Check if the next line is indented (part of the previous key)
                # or if it is the closing '---'
                is_indented = line.startswith(" ") or line.startswith("\t")

                if is_indented:
                    found_content.append(stripped)
                    continue  # Skip this line
                elif stripped == "---":
                    # End of frontmatter, stop skipping, add the delimiter
                    skipping_key = False
                elif ":" in line:
                    # Likely a new key starting (e.g., "title: ...")
                    skipping_key = False
                else:
                    # Edge case: Empty lines inside a block?
                    # Usually safe to assume if it's not indented and not a delimiter,
                    # the block is done.
                    skipping_key = False

        # Add line to output if not skipping
        if not skipping_key:
            new_lines.append(line)

    if modified:
        print(f"--- Found in: {filepath} ---")
        # Print a snippet of what was found to avoid flooding the terminal
        full_content = " ".join(found_content)
        print(
            f"Content removed: {full_content[:200]}..."
            if len(full_content) > 200
            else full_content
        )
        print("-" * 30)

        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)


def main():
    target_dir = "."  # Current directory

    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith(".md"):
                clean_file(os.path.join(root, file))


if __name__ == "__main__":
    main()
