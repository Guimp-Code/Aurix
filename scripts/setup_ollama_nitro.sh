#!/bin/bash

echo "🚀 Configurando Ollama NITRO para Aurix..."

# Verificar se Ollama está instalado
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama não encontrado. Instalando..."
    curl -fsSL https://ollama.ai/install.sh | sh
else
    echo "✅ Ollama já instalado"
fi

# Verificar modelos disponíveis
echo "📊 Modelos disponíveis:"
ollama list

# Tentar baixar modelo mais leve (se disponível)
echo "📥 Tentando baixar modelo mais leve..."
if ollama pull llama3.1:1b 2>/dev/null; then
    echo "✅ Modelo llama3.1:1b instalado!"
elif ollama pull llama3.1:3b 2>/dev/null; then
    echo "✅ Modelo llama3.1:3b instalado!"
else
    echo "⚠️ Usando modelo disponível (llama3.1:8b) com configurações NITRO"
fi

# Configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."
echo 'export LLM_MODEL="llama3.1:8b"' >> ~/.bashrc
echo 'export OLLAMA_BASE="http://localhost:11434/v1"' >> ~/.bashrc

echo ""
echo "🎉 Configuração NITRO completa!"
echo ""
echo "📋 Para usar:"
echo "   source ~/.bashrc"
echo "   ollama serve"
echo "   python3 app/tests/test_hybrid_system.py"
echo ""
echo "💡 Sistema NITRO otimiza qualquer modelo disponível"
echo "🚀 Funciona offline como reforço para Cursor AI"
echo "⚡ Configurações otimizadas: max_tokens=1024, temperature=0.1"
