#!/usr/bin/env python3
import argparse, json, sys
from pathlib import Path
from app.mcp import get_mcp_client

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--server", required=True, help="ex.: fs-context, fs-aurix, http, sqlite, git")
    ap.add_argument("--tool", required=True, help="ex.: readFile, fetch, query, list_files")
    ap.add_argument("--params", default="{}", help='JSON com params, ex.: {"path":"system_prompt.md"}')
    ap.add_argument("--timeout", type=int, default=30)
    args = ap.parse_args()

    try:
        params = json.loads(args.params)
    except Exception as e:
        print(f"Params inválidos (JSON): {e}", file=sys.stderr); sys.exit(2)

    client = get_mcp_client()
    res = client.call(args.server, args.tool, params, timeout_s=args.timeout)
    print(json.dumps(res, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
