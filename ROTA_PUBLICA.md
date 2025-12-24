# Rota Pública de Acompanhamento de Votações

## Descrição

Foi criada uma rota pública que permite aos cidadãos acompanharem as votações em tempo real das sessões legislativas da câmara municipal, sem necessidade de autenticação.

## Acesso

A rota pública está disponível em:
```
/public/[slug]/
```

Onde `[slug]` é o identificador único da câmara municipal (ex: `camara-sao-paulo`).

## Funcionalidades

### 🎯 Principais Features

1. **Acompanhamento em Tempo Real**
   - Visualização de sessões em andamento
   - Monitoramento de votações abertas
   - Atualização automática via Supabase Realtime

2. **Interface Pública**
   - Design responsivo e acessível
   - Identificação visual da câmara
   - Status em tempo real (aberta/encerrada)

3. **Resultados de Votação**
   - Contagem parcial de votos (Sim/Não/Abstenção/Ausente)
   - Percentual de participação
   - Lista de vereadores com seus votos

4. **Informações do Projeto**
   - Número e título do projeto em votação
   - Ementa/descrição
   - Status atual

### 🔄 Atualizações em Tempo Real

O sistema utiliza Supabase Realtime para:
- Detectar mudanças no status das sessões
- Atualizar votações quando abertas/encerradas
- Monitorar registro de votos individuais
- Recalcular resultados automaticamente

### 🎨 Interface Visual

- **Header**: Nome da câmara, status da sessão, indicador visual
- **Área Principal**: Informações do projeto em votação
- **Resultados**: Contagem visual com cores diferenciadas
- **Painel Lateral**: Lista de vereadores e seus votos

## Componentes Criados

### 1. `app/public/[slug]/page.tsx`
- Server component que carrega dados iniciais
- Busca informações da câmara, sessão ativa e votação
- Renderiza o client component

### 2. `components/public/PublicVotingClient.tsx`
- Client component com lógica de real-time
- Gerencia estado de votações e votos
- Interface responsiva com atualizações automáticas

### 3. `app/public/[slug]/layout.tsx`
- Layout simples para a rota pública

## Fluxo de Dados

```
1. Acesso público → /public/[slug]/
2. Carrega dados da câmara (slug → camara_id)
3. Verifica sessão ativa (status = "aberta")
4. Busca votação aberta (status = "aberta")
5. Lista vereadores ativos
6. Inicia subscriptions Realtime
7. Atualiza interface automaticamente
```

## Estados da Interface

### 🟢 Sessão Aberta + Votação Ativa
- Mostra projeto em votação
- Exibe contagem parcial de votos
- Lista vereadores com status individual

### 🟡 Sessão Aberta + Sem Votação
- Indica sessão em andamento
- Aguarda abertura da próxima votação
- Mantém monitoramento ativo

### 🔴 Sessão Encerrada
- Mostra mensagem de sessão finalizada
- Não exibe votações ativas
- Interface aguardando próxima sessão

## Segurança

- **Acesso Público**: Sem autenticação necessária
- **Isolamento Multi-tenant**: Dados filtrados por `camara_id`
- **RLS Aplicado**: Row Level Security mantém isolamento
- **Read-Only**: Apenas consulta, sem capacidade de modificação

## Próximos Melhorias

1. **Histórico de Votações**
   - Exibir resultados de votações encerradas
   - Estatísticas históricas

2. **Notificações**
   - Alertas quando votação começa
   - Push notifications para dispositivos

3. **Filtros e Busca**
   - Filtrar por tipo de projeto
   - Buscar projetos específicos

4. **Exportação**
   - PDF com resultados completos
   - Dados em formatos abertos

## Como Testar

1. Inicie uma sessão no painel administrativo
2. Abra uma votação para um projeto
3. Acesse `/public/[slug]/` em outra aba/anônimo
4. Observe as atualizações em tempo real

---

A rota pública está pronta para uso e oferece transparência total sobre o processo legislativo municipal! 🎉