import subprocess
import urllib.request
import json
import base64
import sys

# 1. Get credentials from git credential helper
print("--> Fetching GitHub credentials from Windows Credential Manager...")
p = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
stdout, _ = p.communicate(input="protocol=https\nhost=github.com\n\n")

username = ""
password = ""
for line in stdout.splitlines():
    if line.startswith("username="):
        username = line.split("=", 1)[1]
    elif line.startswith("password="):
        password = line.split("=", 1)[1]

if not username or not password:
    print("ERROR: Could not retrieve GitHub credentials.")
    sys.exit(1)

auth_header = "Basic " + base64.b64encode(f"{username}:{password}".encode()).decode()

# 2. Create the 'portfolio' repository on GitHub if it doesn't already exist
repo_name = "portfolio"
print(f"--> Checking if repository '{repo_name}' exists on GitHub...")

check_req = urllib.request.Request(f"https://api.github.com/repos/{username}/{repo_name}", headers={
    "Authorization": auth_header,
    "User-Agent": "Python"
})

repo_exists = False
try:
    with urllib.request.urlopen(check_req) as resp:
        if resp.status == 200:
            repo_exists = True
            print(f"Repository '{repo_name}' already exists.")
except urllib.error.HTTPError as e:
    if e.code == 404:
        repo_exists = False
    else:
        print(f"Check repo HTTP error: {e}")

if not repo_exists:
    print(f"--> Creating new public repository '{repo_name}' on GitHub...")
    create_payload = json.dumps({
        "name": repo_name,
        "description": "Lokesh Kumar — Forward Deployed Engineer & AI Systems Developer Portfolio",
        "private": False,
        "has_issues": True,
        "has_projects": True,
        "has_wiki": False
    }).encode("utf-8")

    create_req = urllib.request.Request("https://api.github.com/user/repos", data=create_payload, headers={
        "Authorization": auth_header,
        "User-Agent": "Python",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(create_req) as resp:
            data = json.loads(resp.read().decode())
            print(f"Successfully created repository: {data.get('html_url')}")
    except Exception as e:
        print(f"Error creating repository: {e}")
        sys.exit(1)

# 3. Add files and commit in git
print("--> Staging files in local git repository...")
subprocess.run(['git', 'add', '.'], check=True)

print("--> Checking git status...")
status_out = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True).stdout
if status_out.strip():
    print("--> Committing changes...")
    subprocess.run(['git', 'commit', '-m', 'Initial commit: Lokesh portfolio website with editorial theme, verified certifications, and interactive skills UI'], check=True)
else:
    print("Nothing to commit (already committed).")

# 4. Set remote origin
print("--> Configuring remote origin...")
remotes = subprocess.run(['git', 'remote'], capture_output=True, text=True).stdout.splitlines()
repo_url = f"https://github.com/{username}/{repo_name}.git"

if "origin" in remotes:
    subprocess.run(['git', 'remote', 'set-url', 'origin', repo_url], check=True)
else:
    subprocess.run(['git', 'remote', 'add', 'origin', repo_url], check=True)

# 5. Push to GitHub
print("--> Pushing main branch to GitHub...")
push_res = subprocess.run(['git', 'push', '-u', 'origin', 'main', '--force'], capture_output=True, text=True)
print("Push stdout:", push_res.stdout)
print("Push stderr:", push_res.stderr)
if push_res.returncode != 0:
    print("ERROR: Git push failed.")
    sys.exit(1)
print(f"SUCCESS: Pushed code to https://github.com/{username}/{repo_name}")

# 6. Enable GitHub Pages
print("--> Enabling GitHub Pages on 'main' branch...")
pages_payload = json.dumps({
    "source": {
        "branch": "main",
        "path": "/"
    }
}).encode("utf-8")

pages_req = urllib.request.Request(f"https://api.github.com/repos/{username}/{repo_name}/pages", data=pages_payload, headers={
    "Authorization": auth_header,
    "User-Agent": "Python",
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json"
})

try:
    with urllib.request.urlopen(pages_req) as resp:
        pages_data = json.loads(resp.read().decode())
        print(f"GitHub Pages enabled! Live URL: {pages_data.get('html_url')}")
except urllib.error.HTTPError as e:
    if e.code == 409: # Already enabled
        print(f"GitHub Pages is already active for this repository.")
    else:
        print(f"Note on Pages activation: {e}")
except Exception as e:
    print(f"Pages activation info: {e}")

print("=== ALL DONE SUCCESSFULLY ===")
