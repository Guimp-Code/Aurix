# -*- coding: utf-8 -*-
"""
Agente: llm_architect
Função: Projetar automações LLM seguras, observáveis e idempotentes a partir de um spec.
Lê padrões em: context/llm_automation_standards.xml e context/llm_references.xml
Saídas: plano, tickets e artefatos em docs_aurix/backlog/LLM-*
"""
from __future__ import annotations
import os, json, time, hashlib, uuid, re
from pathlib import Path
from typing import Any, Dict, List, Tuple
import xml.etree.ElementTree as ET

ROOT = Path(os.getenv("AURIX_WORKSPACE", "."))  # respeita workspace
CTX  = ROOT / "context"
DOCS = ROOT / "docs_aurix" / "backlog"
DOCS.mkdir(parents=True, exist_ok=True)

STDS = CTX / "llm_automation_standards.xml"
REFS = CTX / "llm_references.xml"

def _load_xml(p: Path) -> ET.Element:
    if not p.exists():
        raise FileNotFoundError(f"Missing XML: {p}")
    return ET.fromstring(p.read_text(encoding="utf-8"))

def _atomic_write(path: Path, data: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(data, encoding="utf-8")
    os.replace(tmp, path)

def _slug(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9\-]+", "-", s)
    return re.sub(r"-{2,}", "-", s).strip("-")

def _hash(data: Any) -> str:
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()[:10]

def _now() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")

def plan_from_spec(spec: Dict[str, Any]) -> Dict[str, Any]:
    """
    spec exemplo:
    {
      "goal": "indexar docs do cliente e responder via RAG",
      "constraints": {"offline_ok": true, "max_tokens": 4096},
      "agents": ["ingestor","retriever","orchestrator"],
      "framework": "langchain|autogen|metagpt|taskweaver|parlant|custom",
      "datasources": [{"type":"fs","path":"./data"}, {"type":"http","url": "..."}],
      "observability": {"log_level":"INFO"},
      "safety": {"human_review": true},
      "project_path": "./meu-projeto"  # NOVO: caminho do projeto
    }
    """
    std = _load_xml(STDS)
    refs = _load_xml(REFS)

    checklist = [i.text.strip() for i in std.findall(".//checklist/item")]
    sources   = [l.text.strip() for l in refs.findall(".//sources/link")]

    goal = spec.get("goal", "no-goal")
    framework = spec.get("framework", "langchain")
    agents = spec.get("agents", ["orchestrator"])
    constraints = spec.get("constraints", {})
    datasources = spec.get("datasources", [])
    safety = spec.get("safety", {"human_review": True})
    project_path = spec.get("project_path", ".")

    # NOVO: Criar estrutura de docs do projeto
    project_docs_path = Path(project_path) / "docs"
    project_docs_path.mkdir(parents=True, exist_ok=True)

    tickets: List[Dict[str, Any]] = []
    seq = 1
    def _t(title, desc, kind="task", owner="llmDevExecutor"):
        nonlocal seq
        tid = f"LLM-{seq:04d}"
        seq += 1
        tickets.append({"id": tid, "title": title, "desc": desc, "kind": kind, "owner": owner})
        return tid

    _t("Define framework e skeleton",
       f"Selecionar e fixar framework '{framework}'. Criar skeleton com pastas, env, providers e adapters.",
       owner="llmArchitect")
    _t("Modelar agentes",
       f"Projetar papéis e contratos para: {', '.join(agents)}. Definir entradas/saídas, limites de iteração e métricas.")
    _t("Conectar datasources", f"Configurar fontes: {json.dumps(datasources)} com validadores e limites.")
    _t("Observabilidade", "Implementar logs JSON, IDs de correlação e contadores de falha/latência.")
    _t("Segurança e prontidão", "Timeouts, retries/backoff, circuit breaker (se aplicável), rollback de artefatos.")
    _t("Testes", "Unit/integration para pipelines críticos + smoke E2E.")
    _t("Documentação", "Especificar prompts, limites, fallback, e rotas de rollback. Atualizar README/CHANGELOG.")
    
    # NOVO: Ticket específico para estrutura de docs do projeto
    _t("Estrutura de documentação do projeto",
       f"Criar pasta {project_docs_path} com subpastas: prompts/, specs/, api/, deployment/. Organizar documentação específica do projeto separada do framework.",
       owner="llmArchitect")

    plan = {
        "meta": {"created_at": _now(), "id": str(uuid.uuid4()), "spec_hash": _hash(spec)},
        "goal": goal,
        "framework": framework,
        "agents": agents,
        "constraints": constraints,
        "project_path": str(project_path),
        "project_docs_path": str(project_docs_path),
        "checklist": checklist,
        "sources": sources,
        "tickets": tickets,
    }
    return plan

def write_artifacts(plan: Dict[str, Any]) -> Dict[str, Any]:
    slug = _slug(plan.get("goal", "llm-automation"))
    base = DOCS / f"{slug}-{plan['meta']['spec_hash']}"
    base.mkdir(parents=True, exist_ok=True)

    # Plano
    _atomic_write(base / "PLAN.json", json.dumps(plan, indent=2, ensure_ascii=False))

    # Tickets
    tickets_md = ["# Backlog — LLM Automation", ""]
    for t in plan["tickets"]:
        tickets_md += [f"## {t['id']} — {t['title']}", "", t["desc"], f"- owner: {t['owner']}", ""]
    _atomic_write(base / "TICKETS.md", "\n".join(tickets_md))

    # Fonte de verdade (copiando refs para o pacote)
    refs_copy = (base / "REFERENCES.txt")
    _atomic_write(refs_copy, "\n".join(plan["sources"]))

    # NOVO: Criar estrutura de documentação do projeto
    project_docs_path = Path(plan.get("project_docs_path", "."))
    if project_docs_path != Path("."):
        # Criar subpastas organizadas para documentação do projeto
        subdirs = ["prompts", "specs", "api", "deployment", "examples"]
        for subdir in subdirs:
            (project_docs_path / subdir).mkdir(parents=True, exist_ok=True)
        
        # Criar README.md para a documentação do projeto
        project_readme = f"""# Documentação do Projeto — {plan.get('goal', 'LLM Automation')}

## Estrutura de Documentação

- **prompts/**: Prompts específicos do projeto
- **specs/**: Especificações técnicas e requisitos
- **api/**: Documentação da API (se aplicável)
- **deployment/**: Instruções de deploy e configuração
- **examples/**: Exemplos de uso e casos de teste

## Framework
- **Framework**: {plan.get('framework', 'langchain')}
- **Agentes**: {', '.join(plan.get('agents', []))}

## Metadados
- **Criado em**: {plan['meta']['created_at']}
- **ID do plano**: {plan['meta']['id']}
- **Hash da especificação**: {plan['meta']['spec_hash']}

---
*Documentação gerada automaticamente pelo LLM Architect do framework Aurix*
"""
        _atomic_write(project_docs_path / "README.md", project_readme)

    return {"artifact_dir": str(base), "project_docs_path": str(project_docs_path)}

def run(task: Dict[str, Any]) -> Dict[str, Any]:
    """
    Entrada: task/spec para automação LLM (ver plan_from_spec docstring).
    Saída: plano, caminhos de artefatos e checklist para Manager/QA.
    """
    plan = plan_from_spec(task or {})
    artifacts = write_artifacts(plan)
    return {
        "status": "ok",
        "message": "LLM plan generated with artifacts",
        "plan_meta": plan["meta"],
        "artifact_dir": artifacts["artifact_dir"],
        "project_docs_path": artifacts["project_docs_path"],
        "checklist": plan["checklist"]
    }

if __name__ == "__main__":
    import sys, json as _json
    spec = {}
    if not sys.stdin.isatty():
        try:
            spec = _json.loads(sys.stdin.read() or "{}")
        except Exception:
            spec = {}
    out = run(spec)
    print(json.dumps(out, ensure_ascii=False))
