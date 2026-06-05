import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content

    # Replace FASTAPI endpoints
    content = content.replace(
        'import.meta.env.VITE_API_URL || "http://localhost:8090"',
        'import.meta.env.VITE_API_FASTAPI || "http://localhost:8090"'
    )

    # Replace FLASK endpoints
    content = content.replace(
        '${import.meta.env.VITE_API_URL}/status',
        '${import.meta.env.VITE_API_FLASK}/status'
    )
    content = content.replace(
        '${import.meta.env.VITE_API_URL}/update_stream',
        '${import.meta.env.VITE_API_FLASK}/update_stream'
    )
    content = content.replace(
        '${import.meta.env.VITE_API_URL}/video_feed',
        '${import.meta.env.VITE_API_FLASK}/video_feed'
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

search_dir = r"d:\Kuliah\Capstone\K3-capstone\kepston\src\**\*.jsx"
for filepath in glob.glob(search_dir, recursive=True):
    replace_in_file(filepath)

print("Done")
