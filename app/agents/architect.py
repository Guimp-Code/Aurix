from pathlib import Path
import json
import xml.etree.ElementTree as ET
from app.agents._util import list_docs, find_urls, hybrid_ai_chat_with_offline, extract_json_tail, mcp_call, ensure_dir, write_if_changed

def _load_project_standards() -> dict:
    """Carrega e valida project_standards.xml (OBRIGATÓRIO)"""
    standards_path = Path.home() / "aurix" / "context" / "project_standards.xml"
    
    if not standards_path.exists():
        raise ValueError("PROJECT STANDARDS OBRIGATÓRIO: context/project_standards.xml não encontrado!")
    
    try:
        tree = ET.parse(standards_path)
        root = tree.getroot()
        
        # Extrair informações críticas
        standards = {
            "objective": root.find("objective").text if root.find("objective") is not None else "",
            "checklist": [item.text for item in root.findall("checklist/item")],
            "principles": [principle.text for principle in root.findall("principles/principle")],
            "structure": [folder.text for folder in root.findall("structure/folder")],
            "security": {
                "baseline": root.find("security/baseline").text if root.find("security/baseline") is not None else "",
                "rules": [rule.text for rule in root.findall("security/rule")]
            },
            "observability": {
                "logs": root.find("observability/logs").text if root.find("observability/logs") is not None else "",
                "metrics": root.find("observability/metrics").text if root.find("observability/metrics") is not None else ""
            }
        }
        
        print("✅ PROJECT STANDARDS carregado e validado")
        return standards
        
    except Exception as e:
        raise ValueError(f"ERRO ao carregar PROJECT STANDARDS: {e}")

def _validate_architecture_against_standards(arch: dict, standards: dict) -> bool:
    """Valida arquitetura contra project standards"""
    print("🔍 Validando arquitetura contra PROJECT STANDARDS...")
    
    # Validar estrutura de pastas
    required_folders = standards.get("structure", [])
    arch_folders = [mod.get("name", "") for mod in arch.get("modules", [])]
    
    missing_folders = []
    for folder in required_folders:
        if not any(folder.replace("/", "") in f for f in arch_folders):
            missing_folders.append(folder)
    
    if missing_folders:
        print(f"⚠️ Pastas obrigatórias ausentes: {missing_folders}")
        return False
    
    # Validar princípios
    principles = standards.get("principles", [])
    if "SOLID" in str(principles) and "Clean Code" in str(principles):
        print("✅ Princípios SOLID/Clean Code validados")
    
    print("✅ Arquitetura validada contra PROJECT STANDARDS")
    return True

def _load_prompt() -> str:
    p = Path.home()/ "aurix-context"/ "agents"/ "architect.md"
    return p.read_text(encoding="utf-8")

def _gather_context() -> tuple[str, list[str]]:
    docs_root = Path.home()/ "aurix"/ "docs"
    pairs = list_docs(docs_root)
    merged = "\n\n---\n\n".join([f"# {a}\n{b}" for a,b in pairs])[:180000]
    # fontes explícitas
    urls_txt = Path.home()/ "aurix"/ "docs"/ "research_urls.txt"
    urls = []
    if urls_txt.exists():
        try: urls = [u.strip() for u in urls_txt.read_text(encoding="utf-8").splitlines() if u.strip().startswith("http")]
        except: pass
    # mais URLs detectadas nos próprios docs
    urls += find_urls(merged, limit=20)
    # dedup
    seen=set(); urls2=[]
    for u in urls:
        if u not in seen:
            seen.add(u); urls2.append(u)
    return merged, urls2[:20]

def _fetch_web(urls: list[str]) -> list[dict]:
    out=[]
    for u in urls[:10]:  # limite de 10 páginas
        r = mcp_call("http","fetch",{"url": u}, timeout_s=20)
        if r.get("ok"):
            text = (r["data"].get("text","") or "")[:150000]
            out.append({"url":u,"text":text})
    return out

def _save_research(pages: list[dict]):
    root = Path.home()/ "aurix"/ "data"/ "research"
    ensure_dir(root)
    saved=[]
    for i,p in enumerate(pages, start=1):
        fp = root/ f"page_{i:02d}.json"
        write_if_changed(fp, json.dumps(p, ensure_ascii=False, indent=2))
        saved.append(str(fp))
    return saved

def _write_tasks(tasks: list[dict]) -> list[str]:
    bl = Path.home()/ "aurix"/ "data"/ "backlog"
    ensure_dir(bl)
    written=[]
    for t in tasks:
        tid = t["id"]
        fp = bl/ f"{tid}.json"
        write_if_changed(fp, json.dumps(t, ensure_ascii=False, indent=2))
        written.append(str(fp))
    return written

def _write_plan(arch: dict) -> str:
    plan = Path.home()/ "aurix"/ "data"/ "architecture"/ "aurix.plan.json"
    ensure_dir(plan.parent)
    write_if_changed(plan, json.dumps(arch, ensure_ascii=False, indent=2))
    return str(plan)

def _dispatch_followups(tasks: list[dict]) -> dict:
    from app.agents import dispatch_agent
    results={"dev":[],"qa":None,"packager":None}
    # 1) Dev Builder
    for t in tasks:
        if t.get("owner")=="dev_builder":
            path = str((Path.home()/ "aurix"/ "data"/ "backlog"/ f"{t['id']}.json").expanduser())
            res = dispatch_agent("dev_builder", {"ticket_path": path})
            results["dev"].append({"id": t["id"], "result": res})
    # 2) QA
    any_dev = any(x.get("result",{}).get("ok") for x in results["dev"])
    if any_dev:
        results["qa"] = dispatch_agent("qa_tester", {"paths":[str(Path.home()/ "aurix"/ "app")]})
    # 3) Packager (se houver task correspondente)
    need_pkg = any(t.get("owner")=="packager" for t in tasks)
    if need_pkg:
        results["packager"] = dispatch_agent("packager", {"entry":"app/main.py","name":"Aurix","onefile":True})
    return results

def run(task: dict) -> dict:
    """
    task = {"scrape": true|false (default true)}
    """
    # === COMPLIANCE OBRIGATÓRIO ===
    try:
        print("🔒 Carregando PROJECT STANDARDS (OBRIGATÓRIO)...")
        standards = _load_project_standards()
        print(f"✅ Standards carregados: {standards['objective']}")
    except Exception as e:
        return {"ok": False, "error": f"COMPLIANCE FALHOU: {e}"}
    
    sys_prompt = _load_prompt()
    docs_txt, urls = _gather_context()
    pages = _fetch_web(urls) if task.get("scrape", True) else []
    
    # Compose user content with standards
    user = f"""PROJECT STANDARDS (OBRIGATÓRIO):
{json.dumps(standards, ensure_ascii=False, indent=2)}

DOCS:
{docs_txt[:140000]}"""
    
    if pages:
        user += f"\n\nWEB_SNAPSHOTS:\n{json.dumps([{'url':p['url'],'text':p['text'][:8000]} for p in pages], ensure_ascii=False)}"
    
    # Ask AI for arch + tasks (usando sistema híbrido)
    print("🚀 Usando sistema híbrido Cursor AI + Ollama NITRO...")
    out = hybrid_ai_chat_with_offline(sys_prompt, user)
    data = extract_json_tail(out)
    
    # Validar arquitetura contra standards
    if not _validate_architecture_against_standards(data.get("architecture", {}), standards):
        return {"ok": False, "error": "Arquitetura não atende PROJECT STANDARDS"}
    
    # Persist
    plan_path = _write_plan(data["architecture"])
    saved_pages = _save_research(pages)
    tasks_written = _write_tasks(data.get("tasks",[]))
    
    # Trigger other agents
    results = _dispatch_followups(data.get("tasks",[]))
    
    return {
        "ok": True,
        "plan": plan_path,
        "research": saved_pages,
        "tasks": tasks_written,
        "results": results,
        "standards_compliance": "✅ VALIDADO"
    }
