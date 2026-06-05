import os
import glob
import re

def add_trailing_slash(match):
    full_match = match.group(0)
    base_url = match.group(1) # e.g. `${apiUrl}` or `${import.meta.env.VITE_API_FASTAPI}`
    path = match.group(2) # e.g. `/api/camera`
    suffix = match.group(3) # e.g. `?page_size=100` or just ending quote
    
    # Check if path already ends with slash
    if path.endswith('/'):
        return full_match
        
    return f"{base_url}{path}/{suffix}"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Regex to find: (apiUrl_var)(/api/[a-zA-Z0-9_-]+(?:/\$\{.*?\})?)([`'\"\?])
    # Examples:
    # `${apiUrl}/api/camera`
    # `${apiUrl}/api/violations?page_size=100`
    # `${apiUrl}/api/users/${id}`
    # `${apiUrl}/api/violations/${data.id}/validate` -> Wait, /validate is not at the end. We only want to append slash before ? or end of string.
    
    # Let's replace specifically occurrences of known routes
    routes = [
        r'/api/camera',
        r'/api/users',
        r'/api/violations',
        r'/api/violation-types',
        r'/api/auth/login',
        r'/api/auth/register'
    ]
    
    # We want to replace `/api/camera` with `/api/camera/`
    # if it's followed by `?`, ```, `'`, `"` or `/`... wait, if it's followed by `/` it already has a slash.
    # What about `/api/users/${id}`? We want it to be `/api/users/${id}/`.
    
    # A generic regex: find occurrences of `/api/.*?` that are endpoints.
    # Actually, we can just find all `${apiUrl}/api/...` or `${import.meta.env.VITE_API_FASTAPI}/api/...` inside fetch/axios calls and append `/` before `?` or string ending.
    
    # Let's just use string replace for the base routes first
    for r in routes:
        # replace `/api/camera?` with `/api/camera/?`
        content = content.replace(f"{r}?", f"{r}/?")
        # replace `/api/camera\`` with `/api/camera/\``
        content = content.replace(f"{r}`", f"{r}/`")
        content = content.replace(f"{r}'", f"{r}/'")
        content = content.replace(f"{r}\"", f"{r}/\"")
    
    # Also handle dynamic ones like `${apiUrl}/api/camera/${cameraId}` -> `${apiUrl}/api/camera/${cameraId}/`
    # `${editingCamera.id}` -> `${editingCamera.id}/`
    # `${id}` -> `${id}/`
    # `${data.id}/validate` -> `${data.id}/validate/`
    
    dynamic_endings = [
        r'${cameraId}',
        r'${editingCamera.id}',
        r'${id}',
        r'${user_id}',
        r'${data.id}/validate'
    ]
    
    for de in dynamic_endings:
        # We find `${apiUrl}/api/camera/${cameraId}`
        content = content.replace(f"{de}?`", f"{de}/?`")
        content = content.replace(f"{de}`", f"{de}/`")
        content = content.replace(f"{de}'", f"{de}/'")
        content = content.replace(f"{de}\"", f"{de}/\"")

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

search_dir = r"d:\Kuliah\Capstone\K3-capstone\kepston\src\**\*.jsx"
for filepath in glob.glob(search_dir, recursive=True):
    process_file(filepath)

print("Done")
