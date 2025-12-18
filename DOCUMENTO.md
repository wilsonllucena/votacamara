# VotaCâmara
Sistema de Votação Eletrônica para Câmaras Municipais (Multi-tenant)

---

## 1. Descrição Geral

O **VotaCâmara** é um sistema web fullstack desenvolvido para **gestão e votação de projetos legislativos** em câmaras municipais, com foco em:

- Transparência
- Segurança
- Isolamento de dados
- Simplicidade operacional

O sistema é **multi-tenant**, onde cada **Câmara Municipal é um tenant**, com isolamento total de dados via banco de dados (RLS).

---

## 2. Stack Tecnológica

### Frontend / Fullstack
- Next.js (App Router)
- TypeScript
- React
- React Hook Form
- Zod
- UI: Shadcn/UI (ou componentes custom simples)

### Backend / Infraestrutura
- Supabase
  - Postgres
  - Auth (Email/Senha)
  - Row Level Security (RLS)
  - Realtime (Subscriptions)
- Deploy: Vercel

---

## 3. Multi-Tenant (Requisito Crítico)

### Conceito
- Cada **Câmara Municipal = 1 tenant**
- Todo dado de negócio deve conter `camara_id`
- Usuários pertencem a exatamente **uma câmara**
- Nenhum usuário pode acessar dados de outro tenant

### Resolução do Tenant
- Alternativa: Path  
  `/c/{slug}`

### Segurança
- RLS obrigatório em todas as tabelas
- `camara_id` do registro deve ser igual ao `camara_id` do usuário autenticado
- Nenhuma query sem filtro de tenant

---

## 4. Perfis de Usuário (Roles)

| Role        | Permissões |
|------------|-----------|
| ADMIN      | Gerenciar usuários, vereadores, projetos, visualizar painel público |
| PRESIDENTE | Criar sessões, abrir/encerrar votações, visualizar painel público |
| VEREADOR   | Visualizar pauta e votar , visualizar painel público|
| PUBLICO    | Visualizar painel público (read-only) |

---

## 5. Entidades do Sistema

### camaras
- id
- nome
- slug
- cidade
- uf
- created_at

### profiles
- user_id (auth.users)
- camara_id
- nome
- role
- created_at

### vereadores
- id
- camara_id
- nome
- partido
- foto_url
- ativo
- ordem
- created_at

### projetos
- id
- camara_id
- numero
- titulo
- ementa
- texto_url
- autor
- status (rascunho | em_pauta | votado)
- created_at

### sessoes
- id
- camara_id
- titulo
- tipo (ordinaria | extraordinaria)
- status (aberta | encerrada)
- iniciou_em
- encerrou_em
- created_at

### pauta_itens
- id
- camara_id
- sessao_id
- projeto_id
- ordem
- status

### votacoes
- id
- camara_id
- sessao_id
- projeto_id
- status (aberta | encerrada)
- abriu_em
- encerrou_em
- regra (maioria_simples)

### votos
- id
- camara_id
- votacao_id
- vereador_id
- valor (SIM | NAO | ABSTENCAO | AUSENTE)
- registrado_em

Constraint obrigatória:
- UNIQUE (votacao_id, vereador_id)

### auditoria
- id
- camara_id
- actor_user_id
- acao
- entidade
- entidade_id
- criado_em
- diff_json

---

## 6. Critérios de Aceitação

- Multi-tenant funcional e seguro
- Dados isolados entre câmaras
- Votação nominal correta
- Painel em tempo real funcional
- Nenhum voto editável após encerramento

---

## 6. Regras de Negócio

### Sessões
- Apenas ADMIN ou PRESIDENTE pode criar
- Sessão precisa estar aberta para permitir votações

### Votações
- Apenas PRESIDENTE pode abrir/encerrar
- Apenas uma votação aberta por projeto
- Após encerramento:
  - Nenhum voto pode ser alterado
  - Resultado é imutável

### Votos
- Um vereador vota apenas uma vez
- Voto é auditável
- Backend deve bloquear duplicidade

---

## 7. Fluxos Principais

### Cadastro Inicial
1. Criar Câmara
2. Criar usuários
3. Cadastrar vereadores

### Sessão e Pauta
1. Criar sessão
2. Adicionar projetos à pauta
3. Abrir sessão

### Votação
1. Abrir votação
2. Vereadores votam
3. Painel atualiza em tempo real
4. Encerrar votação
5. Calcular resultado

---

## 8. Telas do MVP

1. Login
2. Dashboard da Câmara
3. CRUD Vereadores
4. CRUD Projetos
5. Sessões e Pauta
6. Tela de Votação (Presidente)
7. Tela de Voto (Vereador)
8. Painel Público (Telão)
9. Resultado da Votação

---

## 9. Realtime (Tempo Real)

- Usar Supabase Realtime
- Subscribe na tabela `votos`
- Filtrar por `votacao_id`
- Atualizar:
  - Contadores
  - Lista nominal
  - Status visual

---

## 10. Estrutura de Rotas (Next.js)

/(auth)/login
admin/(tenant)/[slug]/
admin/(tenant)/[slug]/vereadores
admin/(tenant)/[slug]/projetos
admin/(tenant)/[slug]/sessoes
admin/(tenant)/[slug]/votacoes/[id]
admin/(tenant)/[slug]/painel/[id]

---

## 11. Validação de Dados

- Todos os formulários devem:
  - Usar React Hook Form
  - Validar com Zod
  - Revalidar no backend
- Erros devem ser exibidos claramente ao usuário

---

## 12. Segurança

- RLS ativo em 100% das tabelas
- Nenhum acesso cross-tenant
- Verificação de role no backend
- Auditoria obrigatória
- Voto imutável após encerramento

---

## 13. Critérios de Aceitação

- Multi-tenant funcional e seguro
- Dados totalmente isolados
- Votação nominal correta
- Painel em tempo real funcional
- UI estável e navegável

---

## 14. Fora de Escopo (MVP)

- Assinatura digital
- Certificação ICP-Brasil
- Integrações externas
- Aplicativo mobile nativo

---

## 15. Entregáveis Esperados da IA

- Estrutura do projeto Next.js
- SQL + RLS
- Schemas Zod
- Server Actions / APIs
- Painel Realtime
- Seeds de exemplo
- README de setup

---

## 16. Diretrizes de Design e UI

O sistema deve seguir rigorosamente a identidade visual definida nos arquivos de documentação:

### Theming Global
- **Arquivo**: `docs/global.css`
- **Padrão**: Shadcn UI com variáveis CSS.
- **Cores**: Baseadas no espaço de cor `oklch` (Navy Blue, Gold, Silver).

### Logotipo
- **Componente**: `docs/Logo.tsx`
- **Uso**: Deve ser usado em todas as telas (Login e Dashboards).
- **Variantes**: Suportar versões Full e Icon/Monochrome.