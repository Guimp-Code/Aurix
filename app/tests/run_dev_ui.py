#!/usr/bin/env python3
"""
CLI para testar o agente Dev.UI Engineer
"""

import json
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

def test_dev_ui_agent():
    """Testa o agente Dev.UI Engineer"""
    try:
        from app.agents import dispatch_agent
        
        print("🎨 Testando Dev.UI Engineer...")
        
        # Task de teste: criar interface React
        test_task = {
            "framework": "react",
            "components": [
                {
                    "name": "Button",
                    "type": "atom",
                    "variants": ["primary", "secondary", "danger"],
                    "sizes": ["small", "medium", "large"],
                    "aria_label": "Botão de ação",
                    "role": "button"
                },
                {
                    "name": "Card",
                    "type": "molecule",
                    "atoms": ["Button", "Text"],
                    "props": {"elevation": "low|medium|high"},
                    "aria_label": "Card de conteúdo"
                }
            ],
            "pages": [
                {
                    "name": "Home",
                    "layout": "grid",
                    "components": ["Header", "Hero", "Features", "Footer"],
                    "breakpoints": {
                        "mobile": "320px",
                        "tablet": "768px",
                        "desktop": "1024px"
                    }
                }
            ],
            "styling": "tailwind",
            "responsive": True,
            "accessibility": {"wcag_level": "AA"}
        }
        
        print("📋 Task de teste:")
        print(json.dumps(test_task, indent=2, ensure_ascii=False))
        print("\n" + "="*50 + "\n")
        
        # Executar agente
        result = dispatch_agent("dev_ui", test_task)
        
        print("🎯 Resultado:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if result.get("ok"):
            print("\n✅ Dev.UI Engineer funcionando perfeitamente!")
            print(f"✅ Framework: {result.get('framework')}")
            print(f"✅ Componentes: {len(result.get('components', []))}")
            print(f"✅ Páginas: {len(result.get('pages', []))}")
            print(f"✅ Acessibilidade: {result.get('accessibility', {}).get('wcag_level')}")
        else:
            print(f"\n❌ Erro: {result.get('error')}")
            
    except ImportError as e:
        print(f"❌ Erro de import: {e}")
        print("💡 Execute de: ~/aurix")
    except Exception as e:
        print(f"❌ Erro: {e}")

def test_ui_standards_loading():
    """Testa carregamento dos UI Standards"""
    try:
        from app.agents.dev_ui_engineer import _load_ui_standards
        
        print("🔒 Testando carregamento de UI Standards...")
        
        standards = _load_ui_standards()
        
        if standards.get("ok"):
            print("✅ UI Standards carregados com sucesso!")
            print(f"✅ Objetivo: {standards['standards'].get('objective', 'N/A')}")
            print(f"✅ Checklist: {len(standards['standards'].get('checklist', []))} itens")
            print(f"✅ Princípios: {len(standards['standards'].get('principles', []))} itens")
        else:
            print(f"❌ Erro ao carregar UI Standards: {standards.get('error')}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    print("🚀 Dev.UI Engineer - Test Suite")
    print("="*50)
    
    # Teste 1: Carregamento de UI Standards
    test_ui_standards_loading()
    print("\n" + "-"*50 + "\n")
    
    # Teste 2: Agente completo
    test_dev_ui_agent()
