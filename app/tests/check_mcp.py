#!/usr/bin/env python3
import json, sys, time, pathlib, yaml
from app.mcp import get_mcp_client

YAML_PATH = pathlib.Path.home() / "aurix" / "app" / "mcp" / "servers.yaml"

def main():
    client = get_mcp_client(YAML_PATH)
    cfg = yaml.safe_load(YAML_PATH.read_text(encoding="utf-8"))["servers"]
    for name in cfg.keys():
        print(f"== {name} ==")
        try:
            if name == "git":
                # Git server tem problemas com tools/list, vamos testar diretamente
                print(f"[OK] {name} - testando inicialização...")
                try:
                    # Testar se o servidor inicia
                    client.ensure_started(name)
                    print(f"[OK] {name} inicializado com sucesso")
                    # Tentar uma operação simples
                    call = client.call(name, "status", {}, timeout_s=10)
                    print("[CALL git]", "ok" if call["ok"] else call["error"])
                except Exception as e:
                    print(f"[ERRO] {name} -> {e}")
                continue
                
            res = client.call(name, "tools/list", {}, timeout_s=8)  # muitos servers aceitam tools/list como tool
            # se falhar, forçamos list via método interno:
            if not res["ok"]:
                tools = client._list_tools(name)
            else:
                tools = res.get("data", {}).get("tools") or res.get("data") or []
            print(f"[OK] {name} tools: {len(tools)}")
            sample = [t["name"] for t in tools if isinstance(t, dict) and "name" in t][:5]
            print("   ex:", ", ".join(sample) if sample else "(sem nomes)")

            # Chamada segura por tipo
            if name.startswith("fs-aurix"):
                # tenta listar diretório raiz
                call = client.call(name, "readDirectory", {"path": "."}, timeout_s=10)
                if not call["ok"]:
                    call = client.call(name, "listDirectory", {"path": "."}, timeout_s=10)
                print("[CALL fs-aurix]", "ok" if call["ok"] else call["error"])
            elif name.startswith("fs-context"):
                call = client.call(name, "readFile", {"path": "system_prompt.md"}, timeout_s=10)
                print("[CALL fs-context]", "ok" if call["ok"] else call["error"])
            elif name == "http":
                call = client.call(name, "fetch", {"url": "https://example.com"}, timeout_s=12)
                if not call["ok"]:
                    call = client.call(name, "get", {"url": "https://example.com"}, timeout_s=12)
                print("[CALL http]", "ok" if call["ok"] else call["error"])
            elif name == "sqlite":
                call = client.call(name, "query", {"sql": "SELECT 1 AS ok;"}, timeout_s=10)
                print("[CALL sqlite]", "ok" if call["ok"] else call["error"])
        except Exception as e:
            print(f"[ERRO] {name} -> {e}")
    print("\nPronto.")

if __name__ == "__main__":
    main()
