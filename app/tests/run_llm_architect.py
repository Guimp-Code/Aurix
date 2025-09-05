#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste do agente llm_architect
"""
import json
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.agents.llm_architect import run

def test_llm_architect():
    """Testa o agente llm_architect com um spec de exemplo"""
    
    # Spec de exemplo para automação LLM
    spec = {
        "goal": "indexar docs do cliente e responder via RAG",
        "constraints": {
            "offline_ok": True, 
            "max_tokens": 4096,
            "max_iterations": 5
        },
        "agents": ["ingestor", "retriever", "orchestrator"],
        "framework": "langchain",
        "datasources": [
            {"type": "fs", "path": "./data"},
            {"type": "http", "url": "https://api.exemplo.com/docs"}
        ],
        "observability": {"log_level": "INFO"},
        "safety": {"human_review": True}
    }
    
    print("🧪 Testando llm_architect...")
    print(f"📋 Spec: {json.dumps(spec, indent=2, ensure_ascii=False)}")
    print("-" * 50)
    
    try:
        result = run(spec)
        print("✅ Resultado:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if result.get("status") == "ok":
            print(f"\n🎯 Plano gerado em: {result.get('artifact_dir')}")
            print(f"📋 Checklist: {len(result.get('checklist', []))} itens")
            print("✅ Teste PASSOU!")
        else:
            print("❌ Teste FALHOU!")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = test_llm_architect()
    sys.exit(0 if success else 1)
