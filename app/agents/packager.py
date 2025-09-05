import shutil, subprocess, sys
from pathlib import Path

def run(task: dict) -> dict:
    """
    task = {"entry":"app/main.py","name":"Aurix","onefile":true}
    """
    root = Path.home()/ "aurix"
    entry = task.get("entry","app/main.py")
    name  = task.get("name","Aurix")
    onefile = bool(task.get("onefile", True))
    if shutil.which("pyinstaller") is None:
        return {"ok": False, "error":"pyinstaller não instalado", "hint":"pip install pyinstaller"}
    cmd = ["pyinstaller", entry, "--name", name, "--clean"]
    if onefile: cmd.append("--onefile")
    r = subprocess.run(cmd, cwd=str(root), text=True, capture_output=True)
    if r.returncode != 0:
        return {"ok": False, "error":"falha no build", "log": (r.stdout+r.stderr)[-3000:]}
    dist = root/ "dist"
    desktop = root/ "scripts"/ "aurix.desktop"
    desktop.parent.mkdir(parents=True, exist_ok=True)
    desktop.write_text(f"""[Desktop Entry]
Type=Application
Name={name}
Exec={dist}/{name}
Terminal=false
""", encoding="utf-8")
    return {"ok": True, "artifacts":[str(dist/ name), str(desktop)]}
