#!/usr/bin/env python3
import json, argparse
from app.agents import dispatch_agent

p = argparse.ArgumentParser()
p.add_argument("--docs", default="", help='JSON de lista [{"name":"file.md","content":"..."}]')
p.add_argument("--urls", default="", help='JSON de lista ["https://..."]')
p.add_argument("--start", action="store_true")
p.add_argument("--no-scrape", action="store_true")
a = p.parse_args()

add_docs = json.loads(a.docs) if a.docs else []
add_urls = json.loads(a.urls) if a.urls else []
task = {"add_docs": add_docs, "add_urls": add_urls, "start": bool(a.start), "scrape": (not a.no_scrape)}

res = dispatch_agent("manager", task)
print(json.dumps(res, ensure_ascii=False, indent=2))
