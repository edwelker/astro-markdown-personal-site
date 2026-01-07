import os
import shutil
import re

# Configuration
BLOG_DIR = 'src/content/blog'
PUBLIC_DIR = 'public'

# Specific files to migrate
TARGET_FILES = {
    'csscheatsheet.pdf',
    'expertpythonprogramming.jpg',
    'learningjQuery.jpg',
    'learningwebsitedjango.jpg',
    'letterman.jpg',
    'microformats.png',
    'ncbibaseapp_designv1.pdf',
    'objectorientedjavascript.jpg',
    'prototypebasedprogramming.png'
}

def get_public_files(directory):
    file_list = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file in TARGET_FILES:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, directory)
                # Normalize to forward slashes for URL matching
                rel_path_slash = rel_path.replace(os.sep, '/')
                file_list.append((full_path, rel_path_slash))
    # Sort by length descending to avoid partial matches of substrings
    return sorted(file_list, key=lambda x: len(x[1]), reverse=True)

def main():
    print("Scanning for specific public file references in blog posts...")

    if not os.path.exists(PUBLIC_DIR):
        print(f"Public directory {PUBLIC_DIR} not found.")
        return

    public_files = get_public_files(PUBLIC_DIR)
    
    if not public_files:
        print("None of the target files were found in the public directory.")
        return

    md_files = []
    for root, dirs, files in os.walk(BLOG_DIR):
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))
    md_files.sort()

    # Map: public_rel_path -> list of md_files that reference it
    references = {} 
    
    # Map: md_file -> list of public_files it references
    md_updates = {}

    for md_path in md_files:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for p_full, p_rel in public_files:
            esc_rel = re.escape(p_rel)
            
            # Regex to match path ending in filename
            # Group 1: Opening delimiter (quote, paren)
            # Group 2: The path content ending with the filename
            # We ensure the filename is preceded by / or start of string to avoid partial matches
            pattern = r'([\(["\'])([^)\"\'\s]*(?:/|^)' + esc_rel + r')(?=[)\"\'\s])'
            
            if re.search(pattern, content):
                if p_rel not in references:
                    references[p_rel] = []
                references[p_rel].append(md_path)
                
                if md_path not in md_updates:
                    md_updates[md_path] = []
                md_updates[md_path].append((p_full, p_rel))

    # Identify unreferenced files (from the target list)
    referenced_set = set(references.keys())
    all_found_public_set = set(p[1] for p in public_files)
    unreferenced = all_found_public_set - referenced_set

    print(f"\nFound {len(references)} target files referenced across {len(md_updates)} markdown files.")
    
    if references:
        print("\n--- Proposed Migrations ---")
        for md_path, files in md_updates.items():
            print(f"\nPost: {os.path.relpath(md_path, BLOG_DIR)}")
            for p_full, p_rel in files:
                action = "Copy" if len(references[p_rel]) > 1 else "Move"
                print(f"  [{action}] public/{p_rel}")

    if unreferenced:
        print("\n--- Unreferenced Target Files (Candidates for deletion) ---")
        for f in sorted(unreferenced):
            print(f"  public/{f}")
    else:
        print("\nNo unreferenced target files found.")

    if not md_updates:
        print("\nNo references found. Exiting.")
        return

    confirm = input("\nDo you want to proceed with moving/copying these files and updating references? (y/N): ")
    if confirm.lower() != 'y':
        print("Aborted.")
        return

    print("\nProcessing...")

    moved_sources = set()

    for md_path, files in md_updates.items():
        # Determine target directory
        dir_name = os.path.dirname(md_path)
        base_name = os.path.basename(md_path)
        slug = os.path.splitext(base_name)[0]
        
        # Check if already bundled
        parent_folder = os.path.basename(dir_name)
        if parent_folder == slug:
            target_dir = dir_name
            new_md_path = md_path
            is_bundled = True
        else:
            target_dir = os.path.join(dir_name, slug)
            new_md_path = os.path.join(target_dir, base_name)
            is_bundled = False

        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            print(f"Created directory: {target_dir}")

        # Read content again
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()

        for p_full, p_rel in files:
            filename = os.path.basename(p_rel)
            dest_path = os.path.join(target_dir, filename)
            
            ref_count = len(references[p_rel])
            
            if os.path.exists(dest_path):
                print(f"  [Skip] {filename} already exists in {target_dir}")
            else:
                if ref_count > 1:
                    # Shared resource: Copy
                    print(f"  [Copy] {p_rel}")
                    shutil.copy2(p_full, dest_path)
                else:
                    # Single reference: Move
                    if p_full in moved_sources:
                         # Should not happen if logic is correct (ref_count=1 means only this loop hits it)
                         print(f"  [Error] Source {p_rel} already moved?")
                    else:
                        print(f"  [Move] {p_rel}")
                        shutil.move(p_full, dest_path)
                        moved_sources.add(p_full)

            # Update content
            esc_rel = re.escape(p_rel)
            pattern = r'([\(["\'])([^)\"\'\s]*(?:/|^)' + esc_rel + r')(?=[)\"\'\s])'
            replace_str = r'\1./' + filename
            content = re.sub(pattern, replace_str, content)

        # Write markdown
        if not is_bundled:
            with open(new_md_path, 'w', encoding='utf-8') as f:
                f.write(content)
            os.remove(md_path)
            print(f"  Moved markdown to {new_md_path}")
        else:
            with open(new_md_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  Updated markdown in {new_md_path}")

    print("\nDone.")

if __name__ == "__main__":
    main()
