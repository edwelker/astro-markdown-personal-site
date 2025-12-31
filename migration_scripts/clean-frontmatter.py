import os
import re
import xml.dom.minidom


def manual_format(content):
    """
    Backup formatter: simple regex-based indenter if strict XML parsing fails.
    """
    # 1. Force newlines between tags
    # Replace >< with >\n<
    content = re.sub(r">\s*<", ">\n<", content)

    # 2. Indent based on nesting
    lines = content.split("\n")
    formatted_lines = []
    indent_level = 0
    indent_str = "  "

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check if it's a closing tag </...
        if stripped.startswith("</"):
            indent_level = max(0, indent_level - 1)

        formatted_lines.append((indent_str * indent_level) + stripped)

        # Check if it's an opening tag <... (but not </... and not self-closing /> and not <...?>)
        # simplistic check: starts with <, doesn't start with </, doesn't end with /> or ?>
        if stripped.startswith("<") and not stripped.startswith("</"):
            if not (
                stripped.endswith("/>")
                or stripped.endswith("?>")
                or stripped.startswith("<?")
            ):
                # Check if it is a container or leaf.
                # If the line contains </, it's a one-liner like <name>Bob</name>, so don't indent next line
                if "</" not in stripped:
                    indent_level += 1

    return "\n".join(formatted_lines)


def strict_format(content):
    """
    Strict XML parser (minidom).
    """
    try:
        # Fix the specific typo you mentioned
        content = content.replace("??>", "?>")

        # Fake root wrapper for fragments
        wrapped = f"<fake_root>{content}</fake_root>"
        dom = xml.dom.minidom.parseString(wrapped)
        pretty = dom.toprettyxml(indent="  ")

        # Cleanup
        lines = pretty.split("\n")
        cleaned = []
        for line in lines:
            if "fake_root" in line or "?xml version" in line:
                continue
            if not line.strip():
                continue
            cleaned.append(line)

        joined = "\n".join(cleaned)

        # Snap leaf nodes <tag>\n val \n</tag> -> <tag>val</tag>
        pattern = re.compile(r">\n\s*([^<>\n]+)\n\s*</")
        joined = pattern.sub(r">\1</", joined)

        # Dedent
        final = []
        for line in joined.split("\n"):
            if line.startswith("  "):
                final.append(line[2:])
            else:
                final.append(line)
        return "\n".join(final)
    except Exception as e:
        # Return None to trigger manual fallback
        return None


def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        original_content = f.read()

    # Pattern finds code blocks ``` ... ```
    pattern = re.compile(r"```(.*?)```", re.DOTALL)

    def replacer(match):
        raw_block = match.group(1)

        # 1. Detect and strip <pre> wrapper
        # We look for <pre ...> CONTENT </pre>
        pre_match = re.search(
            r"<pre[^>]*>(.*?)</pre>", raw_block, re.DOTALL | re.IGNORECASE
        )

        content_to_format = raw_block
        is_xml = False

        if pre_match:
            # We found a pre tag, extract the inside
            content_to_format = pre_match.group(1)
            # Check if language was xml
            if "xml" in raw_block.lower():
                is_xml = True
        else:
            # No pre tag, but check if the fence said ```xml
            # (The regex capture group 1 starts *after* the ```)
            # We need to check the match context, but regex replace is tricky with that.
            # Heuristic: does the content look like XML?
            if content_to_format.strip().startswith("<") and ">" in content_to_format:
                is_xml = True

        if is_xml:
            clean_content = content_to_format.strip()

            # Try strict format first
            formatted = strict_format(clean_content)

            # If strict failed (likely due to syntax errors), use manual force
            if not formatted:
                formatted = manual_format(clean_content)

            return f"```xml\n{formatted}\n```"

        return match.group(0)

    new_content = pattern.sub(replacer, original_content)

    if new_content != original_content:
        # Create backup just in case
        with open(filepath + ".bak", "w", encoding="utf-8") as f:
            f.write(original_content)

        # Write new file
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed: {filepath}")


def main():
    print("Scanning and forcing XML format...")
    for root, dirs, files in os.walk("."):
        for file in files:
            if file.endswith(".md"):
                process_file(os.path.join(root, file))
    print("Done.")


if __name__ == "__main__":
    main()
