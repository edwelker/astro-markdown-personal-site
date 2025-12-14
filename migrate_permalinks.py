import os
import re


def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    if not lines or lines[0].strip() != "---":
        return

    new_lines = []
    in_frontmatter = False
    fence_count = 0
    modified = False

    for line in lines:
        # Frontmatter tracking
        if line.strip() == "---":
            fence_count += 1
            if fence_count == 1:
                in_frontmatter = True
            elif fence_count == 2:
                in_frontmatter = False

        if in_frontmatter and line.strip().startswith("permalink:"):
            # Found a permalink!
            key, value = line.split(":", 1)
            raw_slug = value.strip().strip("\"'")

            # Clean it for Astro: Remove leading/trailing slashes
            # /2025/my-post/  ->  2025/my-post
            clean_slug = raw_slug.strip("/")

            new_lines.append(f"slug: {clean_slug}\n")
            modified = True
            print(f"  [Migrated] permalink -> slug: {clean_slug}")
        else:
            new_lines.append(line)

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)


def main():
    print("Migrating 'permalink' to 'slug'...")
    target_dir = "src/content"

    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith(".md") or file.endswith(".mdx"):
                process_file(os.path.join(root, file))
    print("Done.")


if __name__ == "__main__":
    main()
