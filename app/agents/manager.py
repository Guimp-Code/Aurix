from pathlib import Path
import json
import xml.etree.ElementTree as ET

from app.agents._util import ensure_dir, write_if_changed
from app.agents import dispatch_agent

def _load_project_standards() -> dict:
    """Carrega project_standards.xml para validação"""
    standards_path = Path.home() / "aurix" / "context" / "project_standards.xml"
    
    if not standards_path.exists():
        raise ValueError("PROJECT STANDARDS OBRIGATÓRIO: context/project_standards.xml não encontrado!")
    
    try:
        tree = ET.parse(standards_path)
        root = tree.getroot()
        
        standards = {
            "checklist": [item.text for item in root.findall("checklist/item")],
            "security": {
                "baseline": root.find("security/baseline").text if root.find("security/baseline") is not None else ""
            }
        }
        
        return standards
        
    except Exception as e:
        raise ValueError(f"ERRO ao carregar PROJECT STANDARDS: {e}")

def _validate_compliance(standards: dict) -> tuple[bool, list[str]]:
    """Valida compliance com project standards"""
    print("🔒 Validando compliance com PROJECT STANDARDS...")
    
    checklist = standards.get("checklist", [])
    violations = []
    
    # Verificações básicas de compliance
    if not Path.home().joinpath("aurix", "README.md").exists():
        violations.append("README.md obrigatório")
    
    if not Path.home().joinpath("aurix", "CHANGELOG.md").exists():
        violations.append("CHANGELOG.md obrigatório")
    
    # Verificar estrutura de pastas
    required_folders = ["src/core", "src/adapters", "src/infra", "src/tests", "docs"]
    for folder in required_folders:
        if not Path.home().joinpath("aurix", folder).exists():
            violations.append(f"Pasta obrigatória: {folder}")
    
    if violations:
        print(f"❌ VIOLAÇÕES DE COMPLIANCE: {violations}")
        return False, violations
    
    print("✅ Compliance validado")
    return True, []

def _sanitize_name(name: str) -> str:
    s = name.strip().replace("\\", "/").split("/")[-1]
    if not s.endswith(".md") and not s.endswith(".txt"):
        s = s + ".md"
    # evita nomes perigosos:
    s = s.replace("..", "_").replace(" ", "_")
    return s

def _merge_urls(urls_path: Path, new_urls: list[str]) -> list[str]:
    ensure_dir(urls_path.parent)
    existing = []
    if urls_path.exists():
        try:
            existing = [u.strip() for u in urls_path.read_text(encoding="utf-8").splitlines() if u.strip()]
        except Exception:
            existing = []
    seen = {u for u in existing}
    merged = existing[:]
    for u in new_urls or []:
        u = u.strip()
        if u and u not in seen:
            merged.append(u); seen.add(u)
    return merged

def run(task: dict) -> dict:
    """
    task = {
      "add_docs": [ {"name":"vision.md","content":"..."} ],   # opcional
      "add_urls": [ "https://doc.qt.io/...", "..."],          # opcional
      "start": true,                                          # default true
      "scrape": true                                          # default true (para Architect)
    }
    """
    # === COMPLIANCE GATE OBRIGATÓRIO ===
    try:
        standards = _load_project_standards()
        compliance_ok, violations = _validate_compliance(standards)
        
        if not compliance_ok:
            return {
                "ok": False, 
                "error": "COMPLIANCE FAILED", 
                "violations": violations,
                "message": "Pipeline bloqueado - padrões não atendidos"
            }
            
    except Exception as e:
        return {
            "ok": False, 
            "error": f"COMPLIANCE ERROR: {e}"
        }
    
    base = Path.home() / "aurix"
    docs_dir = base / "docs"
    urls_path = docs_dir / "research_urls.txt"
    ensure_dir(docs_dir)

    # 1) Registrar documentos
    registered = []
    add_docs = task.get("add_docs") or []
    for item in add_docs[:50]:
        name = _sanitize_name(item.get("name", "doc"))
        content = item.get("content", "")
        dest = (docs_dir / name).resolve()
        assert str(dest).startswith(str(base.resolve()))  # segurança de path
        changed = write_if_changed(dest, content)
        if changed:
            registered.append(str(dest.relative_to(base)))
        else:
            # já existia igual; considera registrado sem duplicar
            registered.append(str(dest.relative_to(base)))

    # 2) Mesclar URLs de pesquisa
    merged_urls = _merge_urls(urls_path, task.get("add_urls") or [])

    # 3) Iniciar desenvolvimento (Architect) - APENAS se compliance OK
    do_start = task.get("start", True)
    architect_result = None
    if do_start and compliance_ok:
        print("🚀 Iniciando desenvolvimento (compliance validado)")
        architect_result = dispatch_agent("architect", {"scrape": bool(task.get("scrape", True))})
    elif do_start and not compliance_ok:
        print("❌ Desenvolvimento bloqueado (compliance falhou)")

    return {
        "ok": True,
        "registered_docs": registered,
        "merged_urls": merged_urls,
        "started": bool(do_start and compliance_ok),
        "architect_result": architect_result,
        "compliance": "✅ VALIDADO" if compliance_ok else "❌ FALHOU",
        "violations": violations if not compliance_ok else []
    }
