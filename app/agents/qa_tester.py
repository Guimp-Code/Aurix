import os, subprocess, sys
from pathlib import Path

def run(task: dict) -> dict:
    """
    task = {"paths":["~/aurix/app"], "run_pytest": false}
    """
    paths = [Path(p).expanduser() for p in task.get("paths", ["~/aurix/app"])]
    issues=[]
    for root in paths:
        for d,_,fs in os.walk(root):
            for f in fs:
                if f.endswith(".py"):
                    p=str(Path(d)/f)
                    r = subprocess.run([sys.executable, "-m", "py_compile", p], capture_output=True, text=True)
                    if r.returncode != 0:
                        issues.append({"file":p, "msg":r.stderr.strip()[:500]})
    if task.get("run_pytest", False):
        r = subprocess.run([sys.executable, "-m", "pytest", "-q"], cwd=str(Path.home()/ "aurix"), capture_output=True, text=True)
        if r.returncode != 0:
            issues.append({"file":"(pytest)", "msg": (r.stdout+r.stderr)[-2000:]})
    return {"ok": len(issues)==0, "summary": f"{len(issues)} issue(s)", "issues": issues}
