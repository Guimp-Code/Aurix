# 🚀 **AURIX FRAMEWORK** - Sistema Universal de Desenvolvimento com IA

> **Framework de desenvolvimento automatizado que combina Cursor AI + Ollama NITRO + MCP para criar QUALQUER tipo de software**

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![MCP](https://img.shields.io/badge/MCP-Protocol-green.svg)](https://modelcontextprotocol.io)
[![AI](https://img.shields.io/badge/AI-Hybrid-orange.svg)](https://cursor.sh)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 **O que é o Aurix Framework?**

O **Aurix Framework** é uma arquitetura de desenvolvimento universal que combina:

- 🤖 **Cursor AI** para desenvolvimento principal (sem sobrecarga)
- ⚡ **Ollama NITRO** como reforço local/offline
- 🔧 **MCP (Model Context Protocol)** para acesso a ferramentas externas
- 👥 **Sistema de Agentes** para automação de desenvolvimento
- 🧠 **Otimização automática** baseada na memória disponível
- �� **PROJECT STANDARDS** com compliance obrigatório

## 🎯 **Para que serve?**

**QUALQUER tipo de software!** Web, desktop, mobile, CLI, APIs, jogos, etc.

### ✅ **Funciona com:**
- 🌐 **Frontend**: React, Vue, Angular, Svelte
- 🖥️ **Backend**: Node.js, Python, Go, Rust, Java
- 📱 **Mobile**: React Native, Flutter, Xamarin
- 🖥️ **Desktop**: PySide6, Electron, JavaFX
- 🖥️ **CLI**: Python, Node.js, Go, Rust
- 🎮 **Jogos**: Unity, Godot, aplicações gráficas

## 🚀 **Instalação Rápida**

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/aurix-framework.git
cd aurix-framework

# 2. Configure o ambiente
./scripts/setup_ollama_nitro.sh

# 3. Ative as variáveis
source ~/.bashrc

# 4. Teste o sistema
python3 app/tests/test_complete_hybrid.py
```

## 🔒 **PROJECT STANDARDS (OBRIGATÓRIO)**

O framework implementa padrões de produção enterprise-grade:

- **🔒 Segurança**: ASVS Level 2, SCA, secrets scanning
- **📊 Observabilidade**: Logs JSON, métricas RED/USE, tracing
- **🏗️ Arquitetura**: 12-Factor App, SOLID, Clean Code
- **🚀 Produção**: SemVer, rollback, reprodutibilidade
- **✅ Compliance**: Gates automáticos, validação obrigatória

## 🔧 **Como Funciona**

### **1. Sistema Híbrido de IA:**
```
Cursor AI (Principal) → Ollama NITRO (Reforço) → Templates Offline (Fallback)
```

### **2. Agentes de Desenvolvimento:**
- 🏗️ **Architect**: Análise, arquitetura e planejamento
- 👨‍💻 **Dev Builder**: Implementação de código
- 🎨 **Dev.UI Engineer**: Desenvolvimento frontend e UI/UX
- 🤖 **LLM Architect**: Design de automações LLM e IA
- 🔍 **QA Tester**: Validação e testes
- 📦 **Packager**: Build e distribuição
- 📋 **Manager**: Orquestração e compliance

### **3. MCP (Model Context Protocol):**
- 🌐 **HTTP**: APIs, web scraping, downloads
- 🗄️ **SQLite**: Bancos de dados
- 📝 **Git**: Versionamento
- 📁 **Filesystem**: Operações de arquivo

## 📖 **Uso Básico**

### **Via Python:**
```python
from app.agents import dispatch_agent

# Registrar documentação e iniciar desenvolvimento
result = dispatch_agent("manager", {
    "add_docs": [{"name": "spec.md", "content": "Especificação..."}],
    "add_urls": ["https://api.docs.com"],
    "start": True,
    "scrape": True
})

# Executar agente específico
result = dispatch_agent("dev_builder", {
    "spec": "Criar API REST com Python FastAPI"
})
```

### **Via CLI:**
```bash
# Testar agente específico
python3 -m app.tests.run_agent --name architect --task '{"scrape": false}'

# Testar Manager
python3 -m app.tests/run_manager --docs '[{"name":"vision.md","content":"..."}]' --start
```

## 🏗️ **Arquitetura do Sistema**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cursor AI     │    │ Ollama NITRO    │    │  Templates      │
│   (Principal)   │◄──►│   (Reforço)     │◄──►│   (Offline)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Sistema de Agentes                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Architect│ │Dev Build│ │Dev.UI   │ │LLM      │ │QA Tester│  │
│  │         │ │         │ │Engineer │ │Architect│ │         │  │
│                                                                 │
│  ┌─────────┐ ┌─────────┐                                        │
│  │Packager │ │ Manager │                                        │
│  │         │ │         │                                        │
│  └─────────┘ └─────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Servers                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  HTTP   │ │ SQLite  │ │   Git   │ │fs-aurix │ │fs-context│  │
└─────────────────────────────────────────────────────────────────┘
```

## ⚡ **Otimização Automática de Memória**

O sistema detecta automaticamente a memória disponível e ajusta as configurações:

| Memória | Modo | Tokens | Uso |
|---------|------|--------|-----|
| ≥6GB | Normal | 2048 | Desenvolvimento completo |
| ≥4GB | NITRO | 1024 | Desenvolvimento otimizado |
| ≥2GB | ULTRA NITRO | 512 | Desenvolvimento básico |
| <2GB | MINI NITRO | 256 | Funcionalidades essenciais |

## 🔍 **Testes e Validação**

```bash
# Teste básico do sistema híbrido
python3 app/tests/test_hybrid_system.py

# Teste completo (recomendado)
python3 app/tests/test_complete_hybrid.py

# Teste individual de agentes
python3 app/tests/run_agent.py --name architect --task '{"scrape": false}'
```

## 📚 **Documentação Detalhada**

- 📖 **[Guia de Uso](docs/user_guide.md)** - Como usar o framework
- 🏗️ **[Arquitetura](docs/architecture.md)** - Detalhes técnicos
- �� **[Agentes](docs/agents.md)** - Documentação dos agentes
- 🔧 **[MCP](docs/mcp.md)** - Configuração dos servidores MCP
- 🚀 **[Exemplos](docs/examples.md)** - Casos de uso práticos

## 🌟 **Vantagens**

1. **🔄 Universal**: Funciona com qualquer tecnologia
2. **🚀 Produtivo**: Desenvolvimento automatizado
3. **🧠 Inteligente**: IA híbrida (Cursor + Ollama)
4. **⚡ Otimizado**: Ajuste automático de memória
5. **🌐 Offline**: Funciona sem internet
6. **🔧 Extensível**: Fácil adicionar novos agentes/MCPs
7. **🔒 Enterprise**: PROJECT STANDARDS com compliance

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 **Suporte**

- 📖 **Documentação**: [docs/](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/aurix-framework/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/aurix-framework/discussions)

---

**Desenvolvido com ❤️ para tornar o desenvolvimento de software mais inteligente e produtivo!**

[⬆️ Voltar ao topo](#-aurix-framework---sistema-universal-de-desenvolvimento-com-ia)
