from pathlib import Path
import json
from app.agents._util import hybrid_ai_chat_with_offline, extract_json_tail, write_if_changed

def _sys() -> str:
    p = Path.home()/ "aurix-context"/ "agents"/ "dev_builder.md"
    return p.read_text(encoding="utf-8")

def run(task: dict) -> dict:
    """
    task = {"ticket_path":"~/aurix/data/backlog/AURIX-0001.json"} ou {"spec":"texto","base_dir":"~/aurix"}
    """
    base = Path(task.get("base_dir","~/aurix")).expanduser()
    if task.get("ticket_path"):
        t = Path(task["ticket_path"]).expanduser().read_text(encoding="utf-8")
        user = "TICKET:\n" + t
    else:
        user = "SPEC:\n" + task.get("spec","")
    
    # Usando sistema híbrido Cursor AI + Ollama NITRO
    print("🚀 Dev Builder usando sistema híbrido...")
    out = hybrid_ai_chat_with_offline(_sys(), user)
    data = extract_json_tail(out)
    files = data.get("files") or []
    written=[]
    for f in files[:10]:  # hard limit
        dest = (base/ f["path"]).resolve()
        # impedir escrita fora do repo
        assert str(dest).startswith(str(base.resolve()))
        changed = write_if_changed(dest, f.get("content",""))
        if changed: written.append(str(dest))
    notes = data.get("notes","")
    (base/ "data"/ "logs"/ "dev_builder.notes.txt").parent.mkdir(parents=True, exist_ok=True)
    (base/ "data"/ "logs"/ "dev_builder.notes.txt").write_text(notes, encoding="utf-8")
    return {"ok": True, "written": written, "notes_len": len(notes)}
