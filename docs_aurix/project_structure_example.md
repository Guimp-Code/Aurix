# Exemplo de Estrutura de Projeto com Documentação

## Como usar o LLM Architect para criar projetos com documentação

### 1. Especificação do Projeto
```json
{
  "goal": "Sistema de Chatbot para E-commerce",
  "constraints": {"offline_ok": false, "max_tokens": 8192},
  "agents": ["chatbot", "product_search", "order_processor"],
  "framework": "langchain",
  "datasources": [
    {"type": "fs", "path": "./products"},
    {"type": "http", "url": "https://api.ecommerce.com"}
  ],
  "observability": {"log_level": "INFO"},
  "safety": {"human_review": true},
  "project_path": "./ecommerce-chatbot"
}
```

### 2. Estrutura Gerada Automaticamente

```
ecommerce-chatbot/
├── docs/
│   ├── README.md
│   ├── prompts/
│   ├── specs/
│   ├── api/
│   ├── deployment/
│   └── examples/
├── src/
├── tests/
└── requirements.txt
```

### 3. Documentação do Projeto vs Framework

#### Framework (`docs/` raiz)
- Padrões de desenvolvimento
- Regras do time
- Prompts padrão
- Checklist de qualidade

#### Projeto (`projeto/docs/`)
- Prompts específicos do projeto
- Especificações técnicas
- Documentação da API
- Instruções de deploy
- Exemplos de uso

### 4. Execução

```bash
# Via linha de comando
echo '{"goal": "Meu Projeto", "project_path": "./meu-projeto"}' | python app/agents/llm_architect.py

# Via Python
from app.agents.llm_architect import run
result = run({
    "goal": "Meu Projeto",
    "project_path": "./meu-projeto"
})
print(result["project_docs_path"])
```

### 5. Benefícios da Separação

- **Framework**: Documentação reutilizável e padrões consistentes
- **Projeto**: Documentação específica e contextual
- **Organização**: Estrutura clara e navegável
- **Manutenção**: Separação de responsabilidades
- **Escalabilidade**: Fácil adição de novos projetos
