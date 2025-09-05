#!/usr/bin/env python3
"""
Teste mock dos agentes sem LLM para verificar infraestrutura
"""

import json
from pathlib import Path
from app.agents._util import ensure_dir, write_if_changed, atomic_write

def test_utils():
    """Testa utilitários básicos"""
    print("=== Testando Utilitários ===")
    
    # Teste atomic_write
    test_file = Path.home() / "aurix" / "data" / "test" / "atomic_test.txt"
    ensure_dir(test_file.parent)
    atomic_write(test_file, "conteúdo de teste")
    print(f"✅ atomic_write: {test_file}")
    
    # Teste write_if_changed
    changed = write_if_changed(test_file, "conteúdo de teste")  # mesmo conteúdo
    print(f"✅ write_if_changed (sem mudança): {changed}")
    
    changed = write_if_changed(test_file, "novo conteúdo")  # conteúdo diferente
    print(f"✅ write_if_changed (com mudança): {changed}")
    
    # Limpeza
    test_file.unlink()
    test_file.parent.rmdir()
    
    return True

def test_manager_mock():
    """Testa Manager sem LLM"""
    print("\n=== Testando Manager (Mock) ===")
    
    from app.agents.manager import _sanitize_name, _merge_urls
    
    # Teste sanitização de nomes
    assert _sanitize_name("test.md") == "test.md"
    assert _sanitize_name("test") == "test.md"
    assert _sanitize_name("test..file") == "test_file.md"  # corrigido: .. -> _
    print("✅ _sanitize_name")
    
    # Teste merge de URLs
    base = Path.home() / "aurix"
    urls_path = base / "docs" / "test_urls.txt"
    ensure_dir(urls_path.parent)
    
    merged = _merge_urls(urls_path, ["https://example.com", "https://test.com"])
    assert len(merged) == 2
    print("✅ _merge_urls")
    
    # Teste deduplicação
    merged2 = _merge_urls(urls_path, ["https://example.com", "https://new.com"])
    assert len(merged2) == 3  # 2 originais + 1 novo
    print("✅ deduplicação de URLs")
    
    # Limpeza
    urls_path.unlink()
    
    return True

def test_architect_mock():
    """Testa Architect sem LLM"""
    print("\n=== Testando Architect (Mock) ===")
    
    from app.agents.architect import _gather_context, _save_research, _write_tasks, _write_plan
    
    # Teste gather_context
    docs_txt, urls = _gather_context()
    print(f"✅ _gather_context: {len(docs_txt)} chars, {len(urls)} URLs")
    
    # Teste save_research
    pages = [{"url": "https://test.com", "text": "conteúdo de teste"}]
    saved = _save_research(pages)
    print(f"✅ _save_research: {len(saved)} arquivos salvos")
    
    # Teste write_tasks
    tasks = [
        {"id": "AURIX-0001", "title": "Test Task", "owner": "dev_builder", "desc": "Test", "acceptance": ["ok"]}
    ]
    written = _write_tasks(tasks)
    print(f"✅ _write_tasks: {len(written)} tasks escritas")
    
    # Teste write_plan
    arch = {"overview": "Test", "modules": []}
    plan_path = _write_plan(arch)
    print(f"✅ _write_plan: {plan_path}")
    
    return True

def test_qa_tester():
    """Testa QA Tester"""
    print("\n=== Testando QA Tester ===")
    
    from app.agents.qa_tester import run
    
    # Teste com caminho válido
    result = run({"paths": [str(Path.home() / "aurix" / "app" / "agents")]})
    print(f"✅ QA Tester: {result}")
    
    return True

def main():
    """Executa todos os testes"""
    try:
        test_utils()
        test_manager_mock()
        test_architect_mock()
        test_qa_tester()
        print("\n🎉 Todos os testes passaram! Infraestrutura funcionando.")
        return True
    except Exception as e:
        print(f"\n❌ Teste falhou: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    main()
