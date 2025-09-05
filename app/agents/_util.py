import os, json, re, tempfile, fcntl, shutil, time
from pathlib import Path
from typing import Iterable, Tuple

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def atomic_write(path: Path, content: str):
    path = path.expanduser().resolve()
    ensure_dir(path.parent)
    tmp = Path(tempfile.mkstemp(prefix=".tmp_", dir=str(path.parent))[1])
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(content)
        f.flush(); os.fsync(f.fileno())
    os.replace(tmp, path)

def write_if_changed(path: Path, content: str) -> bool:
    path = path.expanduser()
    if path.exists():
        try:
            if path.read_text(encoding="utf-8") == content:
                return False
        except Exception:
            pass
    atomic_write(path, content)
    return True

def file_lock(lock_path: Path):
    class _Lock:
        def __enter__(self):
            self.f = open(lock_path, "a+")
            fcntl.flock(self.f, fcntl.LOCK_EX)
            return self.f
        def __exit__(self, exc_type, exc, tb):
            fcntl.flock(self.f, fcntl.LOCK_UN); self.f.close()
    ensure_dir(lock_path.parent); return _Lock()

def list_docs(root: Path, patterns=("*.md","*.mdx","*.txt"), limit=50) -> list[Tuple[str,str]]:
    out=[]
    for pat in patterns:
        for p in root.rglob(pat):
            try:
                out.append((str(p), p.read_text(encoding="utf-8")[:200000]))
            except Exception:
                pass
            if len(out)>=limit: return out
    return out

def find_urls(text: str, limit=20) -> list[str]:
    rx = re.compile(r"https?://[^\s)>\"]+")
    urls = rx.findall(text or "")[:limit]
    # dedup mantendo ordem
    seen=set(); res=[]
    for u in urls:
        if u not in seen: seen.add(u); res.append(u)
    return res

# ==== SISTEMA HÍBRIDO CURSOR AI + OLLAMA NITRO + OFFLINE ====

def _check_internet() -> bool:
    """Verifica se há conectividade com internet"""
    import urllib.request
    try:
        urllib.request.urlopen('http://8.8.8.8', timeout=3)
        return True
    except:
        return False

def _check_cursor_ai_available() -> bool:
    """Verifica se Cursor AI está disponível (mock por enquanto)"""
    # TODO: Implementar verificação real da API do Cursor
    return True

def _offline_template_fallback(system: str, user: str) -> str:
    """Fallback offline com templates locais"""
    return f"""
TEMPLATE OFFLINE - {system}

ENTRADA: {user}

RESPONDA EM JSON VÁLIDO CONFORME O PROMPT ACIMA.
Se não conseguir gerar JSON válido, retorne um esqueleto básico.
"""

def cursor_ai_chat(system: str, user: str) -> str:
    """
    Cursor AI - Principal (sem sobrecarga)
    Durante desenvolvimento, retorna instruções para o desenvolvedor
    """
    return f"""
INSTRUÇÕES PARA CURSOR AI:
{system}

ENTRADA DO USUÁRIO:
{user}

RESPONDA EM JSON VÁLIDO CONFORME O PROMPT ACIMA.
"""

def _get_available_memory_gb() -> float:
    """Obtém memória disponível em GB"""
    try:
        import psutil
        memory = psutil.virtual_memory()
        return memory.available / (1024**3)
    except:
        return 2.0  # Fallback conservador

def _get_optimal_model_config() -> tuple[str, int]:
    """
    Retorna modelo e configurações otimizadas baseadas na memória disponível
    """
    memory_gb = _get_available_memory_gb()
    
    if memory_gb >= 6.0:
        return "llama3.1:8b", 2048
    elif memory_gb >= 4.0:
        return "llama3.1:8b", 1024  # NITRO mode
    elif memory_gb >= 2.0:
        return "llama3.1:8b", 512   # ULTRA NITRO mode
    else:
        return "llama3.1:8b", 256   # MINI NITRO mode

def ollama_nitro_chat(system: str, user: str) -> str:
    """
    Ollama NITRO - Configuração automática baseada na memória disponível
    Funciona offline como reforço para Cursor AI
    """
    # Detectar configuração ótima
    model, max_tokens = _get_optimal_model_config()
    memory_gb = _get_available_memory_gb()
    
    print(f"⚡ NITRO: Memória disponível: {memory_gb:.1f}GB, Modelo: {model}, Tokens: {max_tokens}")
    
    base = os.environ.get("OLLAMA_BASE", "http://localhost:11434/v1")
    
    try:
        from openai import OpenAI
        client = OpenAI(base_url=base, api_key="ollama")
        
        # Configuração otimizada para NITRO
        r = client.chat.completions.create(
            model=model, 
            temperature=0.1,  # Determinístico
            max_tokens=max_tokens,  # Ajustado automaticamente
            messages=[
                {"role": "system", "content": f"NITRO MODE ({max_tokens}t): {system}"},
                {"role": "user", "content": user}
            ]
        )
        return r.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"⚠️ Ollama NITRO falhou: {e}")
        
        # Se falhar por memória, tentar com configuração mais conservadora
        if "memory" in str(e).lower():
            print("🔄 Tentando configuração ULTRA NITRO (256 tokens)...")
            try:
                r = client.chat.completions.create(
                    model=model, 
                    temperature=0.1,
                    max_tokens=256,  # ULTRA conservador
                    messages=[
                        {"role": "system", "content": f"ULTRA NITRO: {system}"},
                        {"role": "user", "content": user}
                    ]
                )
                return r.choices[0].message.content.strip()
            except:
                pass
        
        # Fallback para template offline
        return _offline_template_fallback(system, user)

def hybrid_ai_chat_with_offline(system: str, user: str) -> str:
    """
    Sistema Híbrido Inteligente: Cursor AI + Ollama NITRO + Modo Offline
    """
    try:
        # 1. Verificar conectividade
        if not _check_internet():
            print("🌐 Sem internet - Ativando Ollama NITRO Offline...")
            return ollama_nitro_chat(system, user)
        
        # 2. Tentar Cursor AI (online)
        try:
            cursor_response = cursor_ai_chat(system, user)
            if _validate_cursor_response(cursor_response, system, user):
                return cursor_response
        except Exception as e:
            print(f"⚠️ Cursor AI falhou: {e}")
        
        # 3. Fallback para Ollama NITRO (local)
        print("🚀 Ativando Ollama NITRO local...")
        return ollama_nitro_chat(system, user)
        
    except Exception as e:
        print(f"🔄 Fallback final para Ollama NITRO: {e}")
        return ollama_nitro_chat(system, user)

def _validate_cursor_response(response: str, system: str, user: str) -> bool:
    """
    Valida se a resposta do Cursor AI é confiável
    """
    # 1. JSON válido?
    try:
        json.loads(response)
    except:
        return False
    
    # 2. Respondeu ao prompt?
    if "INSTRUÇÕES PARA CURSOR AI:" in response:
        return False
    
    # 3. Tamanho razoável?
    if len(response) < 50 or len(response) > 10000:
        return False
    
    return True

def auto_detect_mode() -> str:
    """
    Detecta automaticamente o melhor modo
    """
    if _check_internet():
        if _check_cursor_ai_available():
            return "HYBRID"  # Cursor + NITRO
        else:
            return "NITRO_ONLY"  # Apenas NITRO
    else:
        return "OFFLINE_NITRO"  # NITRO offline

# ==== FUNÇÕES LEGADAS (mantidas para compatibilidade) ====

def ollama_chat(system: str, user: str, model: str|None=None) -> str:
    """
    Função legada - agora usa sistema híbrido
    """
    print("🔄 Usando sistema híbrido em vez de Ollama direto...")
    return hybrid_ai_chat_with_offline(system, user)

def extract_json_tail(s: str) -> dict:
    m = re.search(r"\{.*\}\s*$", s, re.S)
    if not m:
        raise ValueError("LLM não retornou JSON")
    return json.loads(m.group(0))

# MCP helpers
def mcp_call(server: str, tool: str, params: dict, timeout_s: int = 30) -> dict:
    from app.mcp import get_mcp_client
    client = get_mcp_client()
    return client.call(server, tool, params, timeout_s=timeout_s)
