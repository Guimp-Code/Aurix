#!/usr/bin/env python3
"""
Servidor HTTP MCP simples para o Aurix
Implementa funcionalidades básicas de HTTP como fetch e get
"""

import json
import sys
import time
import urllib.request
import urllib.error
from typing import Dict, Any

def http_fetch(url: str, method: str = "GET", headers: Dict[str, str] = None, data: str = None) -> Dict[str, Any]:
    """Faz uma requisição HTTP"""
    try:
        req = urllib.request.Request(url, method=method, headers=headers or {})
        if data:
            req.data = data.encode('utf-8')
        
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read().decode('utf-8')
            return {
                "status": response.status,
                "headers": dict(response.headers),
                "content": content,
                "url": url
            }
    except urllib.error.HTTPError as e:
        return {
            "status": e.code,
            "headers": dict(e.headers),
            "content": e.read().decode('utf-8'),
            "url": url,
            "error": str(e)
        }
    except Exception as e:
        return {
            "status": 0,
            "content": "",
            "url": url,
            "error": str(e)
        }

def main():
    """Loop principal do servidor MCP HTTP"""
    print("HTTP MCP Server running on stdio", file=sys.stderr)
    
    while True:
        try:
            line = input()
            if not line.strip():
                continue
                
            try:
                request = json.loads(line)
            except json.JSONDecodeError:
                continue
                
            if request.get("method") == "initialize":
                response = {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "aurix-http-server",
                            "version": "1.0.0"
                        }
                    }
                }
                print(json.dumps(response))
                
            elif request.get("method") == "tools/list":
                response = {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": {
                        "tools": [
                            {
                                "name": "fetch",
                                "description": "Faz uma requisição HTTP",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "url": {"type": "string"},
                                        "method": {"type": "string", "default": "GET"},
                                        "headers": {"type": "object"},
                                        "data": {"type": "string"}
                                    },
                                    "required": ["url"]
                                }
                            },
                            {
                                "name": "get",
                                "description": "Faz uma requisição HTTP GET",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "url": {"type": "string"}
                                    },
                                    "required": ["url"]
                                }
                            }
                        ]
                    }
                }
                print(json.dumps(response))
                
            elif request.get("method") == "tools/call":
                tool_name = request.get("params", {}).get("name")
                arguments = request.get("params", {}).get("arguments", {})
                
                if tool_name == "fetch":
                    result = http_fetch(
                        arguments.get("url"),
                        arguments.get("method", "GET"),
                        arguments.get("headers"),
                        arguments.get("data")
                    )
                elif tool_name == "get":
                    result = http_fetch(arguments.get("url"), "GET")
                else:
                    result = {"error": f"Tool '{tool_name}' não encontrada"}
                
                response = {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": result
                }
                print(json.dumps(response))
                
        except EOFError:
            break
        except Exception as e:
            error_response = {
                "jsonrpc": "2.0",
                "id": request.get("id") if 'request' in locals() else None,
                "error": {
                    "code": -32603,
                    "message": str(e)
                }
            }
            print(json.dumps(error_response))

if __name__ == "__main__":
    main()
