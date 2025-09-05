from pathlib import Path
import json

from app.agents._util import ensure_dir, write_if_changed
from app.agents import dispatch_agent

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
    write_if_changed(urls_path, "\n".join(merged) + ("\n" if merged else ""))
    return merged

def run(task: dict) -> dict:
    """
    task = {
      "add_docs": [ {"name":"vision.md","content":"..."} ],   # opcional
      "add_urls": [ "https://doc.qt.io/...", "..."],          # opcional
      "start": true,                                          # default true
      "scrape": true,                                         # default true (para Architect)
      "project_name": "nome_do_projeto"                       # opcional - para criar projeto separado
    }
    """
    base = Path.home() / "aurix"
    docs_dir = base / "docs_aurix"
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

    # 3) Criar projeto separado se especificado
    project_result = None
    project_name = task.get("project_name")
    if project_name:
        project_dir = Path.home() / project_name
        project_docs = project_dir / "docs"
        project_src = project_dir / "src"
        project_readme = project_dir / "README.md"
        
        # Criar estrutura do projeto
        ensure_dir(project_docs)
        ensure_dir(project_src)
        
        # Criar README básico do projeto
        if not project_readme.exists():
            basic_readme = f"# {project_name}\n\nProjeto desenvolvido com Aurix Framework.\n\n## Estrutura\n- `docs/` - Documentação do projeto\n- `src/` - Código fonte\n\n## Desenvolvimento\nEste projeto foi criado automaticamente pelo Aurix Framework."
            write_if_changed(project_readme, basic_readme)
        
        project_result = {
            "project_path": str(project_dir),
            "docs_path": str(project_docs),
            "src_path": str(project_src),
            "readme_path": str(project_readme)
        }

    # 4) Iniciar desenvolvimento (Architect)
    do_start = task.get("start", True)
    architect_result = None
    if do_start:
        architect_result = dispatch_agent("architect", {"scrape": bool(task.get("scrape", True))})

    return {
        "ok": True,
        "registered_docs": registered,
        "merged_urls": merged_urls,
        "project_created": project_result is not None,
        "project_result": project_result,
        "started": bool(do_start),
        "architect_result": architect_result
    }
