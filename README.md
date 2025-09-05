### **2. Agentes de Desenvolvimento:**
- 🏗️ **Architect**: Análise, arquitetura e planejamento
- 👨‍💻 **Dev Builder**: Implementação de código
- 🎨 **Dev.UI Engineer**: Desenvolvimento frontend e UI/UX
- 🤖 **LLM Architect**: Design de automações LLM e IA
- 🔍 **QA Tester**: Validação e testes
- 📦 **Packager**: Build e distribuição
- 📋 **Manager**: Orquestração e compliance

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
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
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
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🤖 **Agentes Especializados**

### **🎨 Dev.UI Engineer**
- **Foco**: Desenvolvimento frontend e UI/UX profissional
- **Recursos**: Atomic Design, Design Systems, WCAG 2.1 AA
- **Padrões**: UI Standards XML, acessibilidade, responsividade
- **Uso**: `dispatch_agent("dev_ui", {...})`

### **🤖 LLM Architect**
- **Foco**: Design de automações LLM e sistemas de IA
- **Recursos**: LLM Automation Standards, safety policies
- **Padrões**: Enterprise-grade, observabilidade, compliance
- **Uso**: `dispatch_agent("llm_architect", {...})`

### **📋 Manager**
- **Foco**: Orquestração e compliance de projetos
- **Recursos**: Separação docs_aurix vs docs do projeto
- **Padrões**: Project Standards, estrutura organizacional
- **Uso**: `dispatch_agent("manager", {...})`

## 📚 **Documentação Detalhada**

## 🌟 **Vantagens**

1. **🔄 Universal**: Funciona com qualquer tecnologia
2. **🚀 Produtivo**: Desenvolvimento automatizado
3. **🧠 Inteligente**: IA híbrida (Cursor + Ollama)
4. **⚡ Otimizado**: Ajuste automático de memória
5. **🌐 Offline**: Funciona sem internet
6. **🔧 Extensível**: Fácil adicionar novos agentes/MCPs
7. **🔒 Enterprise**: PROJECT STANDARDS com compliance
8. **🎨 UI/UX Especializado**: Dev.UI Engineer para frontend profissional
9. **🤖 IA Avançada**: LLM Architect para automações inteligentes
10. **📚 Padrões Separados**: Framework vs Projeto documentação
