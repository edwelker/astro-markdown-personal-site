import os
import re
import sys

# Directories to scan
TARGET_DIRS = [
    os.path.join('src', 'content', 'blog'),
    os.path.join('src', 'content', 'recipes')
]

def run_interactive_replace():
    print("Scanning for http:// links...")
    
    for root_dir in TARGET_DIRS:
        if not os.path.exists(root_dir):
            print(f"Directory not found: {root_dir}")
            continue
            
        for root, dirs, files in os.walk(root_dir):
            for file in files:
                # Only check markdown/mdx files
                if not file.endswith(('.md', '.mdx')):
                    continue
                    
                filepath = os.path.join(root, file)
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                except Exception as e:
                    print(f"Could not read {filepath}: {e}")
                    continue
                
                # Identify code blocks to ignore
                code_block_ranges = []
                for m in re.finditer(r'```[\s\S]*?```', content):
                    code_block_ranges.append(m.span())

                # Find all http matches
                all_matches = [m for m in re.finditer(r'http://[^\s\)\}\]\>\"\'\n]+', content)]
                
                # Filter out matches that are inside code blocks
                matches = []
                for m in all_matches:
                    start, end = m.span()
                    is_inside_code_block = False
                    for cb_start, cb_end in code_block_ranges:
                        if start >= cb_start and end <= cb_end:
                            is_inside_code_block = True
                            break
                    if not is_inside_code_block:
                        matches.append(m)
                
                if not matches:
                    continue
                    
                print(f"\n--- File: {filepath} ---")
                
                new_content_parts = []
                last_index = 0
                modified = False
                replace_all_file = False
                
                for match in matches:
                    start, end = match.span()
                    url = match.group(0)
                    
                    # Append content before the match
                    new_content_parts.append(content[last_index:start])
                    
                    should_replace = False
                    
                    if replace_all_file:
                        should_replace = True
                    else:
                        # Get context (the whole line)
                        line_start = content.rfind('\n', 0, start) + 1
                        line_end = content.find('\n', end)
                        if line_end == -1: line_end = len(content)
                        
                        line_context = content[line_start:line_end].strip()
                        
                        print(f"\nMatch:   {url}")
                        print(f"Context: {line_context}")
                        
                        while True:
                            ans = input("Replace with https? [y]es / [n]o / [a]ll in file / [q]uit: ").lower().strip()
                            if ans in ['y', 'n', 'a', 'q']:
                                break
                        
                        if ans == 'q':
                            print("Exiting...")
                            sys.exit(0)
                        elif ans == 'a':
                            replace_all_file = True
                            should_replace = True
                        elif ans == 'y':
                            should_replace = True
                        else:
                            should_replace = False
                    
                    if should_replace:
                        # Replace http with https
                        new_url = url.replace('http://', 'https://', 1)
                        new_content_parts.append(new_url)
                        modified = True
                        if not replace_all_file:
                            print(f"Changed to: {new_url}")
                    else:
                        new_content_parts.append(url)
                        
                    last_index = end
                
                # Append remaining content
                new_content_parts.append(content[last_index:])
                
                if modified:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write("".join(new_content_parts))
                    print(f"Saved changes to {filepath}")

if __name__ == "__main__":
    try:
        run_interactive_replace()
        print("\nDone.")
    except KeyboardInterrupt:
        print("\nOperation cancelled.")
        sys.exit(0)
