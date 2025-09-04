#!/usr/bin/env python3
import argparse, json
from app.agents import dispatch_agent
p = argparse.ArgumentParser()
p.add_argument("--name", required=True)
p.add_argument("--task", default="{}")
a = p.parse_args()
res = dispatch_agent(a.name, json.loads(a.task))
print(json.dumps(res, ensure_ascii=False, indent=2))
