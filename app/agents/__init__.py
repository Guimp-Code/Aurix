from importlib import import_module

_REGISTRY = {
  "architect":   "app.agents.architect:run",
  "dev_builder": "app.agents.dev_builder:run",
  "qa_tester":   "app.agents.qa_tester:run",
  "packager":    "app.agents.packager:run",
  "manager":     "app.agents.manager:run",
  "dev_ui":      "app.agents.dev_ui_engineer:run",
}

def dispatch_agent(name: str, task: dict) -> dict:
  if name not in _REGISTRY:
    return {"ok": False, "error": f"agent '{name}' não encontrado"}
  modpath, func = _REGISTRY[name].split(":")
  mod = import_module(modpath)
  return getattr(mod, func)(task)
