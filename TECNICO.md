# Documentação Técnica: VotaCâmara

Este documento serve como guia de arquitetura e contexto para desenvolvedores e IAs que atuam no projeto VotaCâmara.

---

## 🏗️ Arquitetura Geral

O VotaCâmara é um sistema **Multi-tenant** utilizando **Next.js 15 (App Router)** e **Supabase**.

-   **Frontend**: React + Tailwind CSS + Shadcn/UI.
-   **Backend**: Next.js Server Actions + Supabase Database (PostgreSQL).
-   **Segurança**: Row Level Security (RLS) no banco de dados para isolamento de tenants.
-   **Realtime**: Supabase Realtime para atualizações dinâmicas do painel de votação.

---

## 📁 Organização de Pastas

```text
/
├── app/                  # Rotas e Layouts (Next.js App Router)
│   ├── (auth)/           # Fluxo de login e autenticação
│   └── admin/            # Painel administrativo principal
│       └── (tenant)/     # Rotas que dependem do slug da Câmara
│           └── [slug]/   # Identificador único de cada cliente (tenant)
├── components/           # Componentes React reutilizáveis
│   ├── admin/            # Componentes específicos do dashboard
│   ├── ui/               # Componentes base (Shadcn/UI)
│   └── landing/          # Componentes do site público
├── lib/                  # Bibliotecas externas e configurações
├── utils/                # Funções auxiliares e clientes Supabase
│   └── supabase/         # Configurações do cliente client-side e server-side
└── DOCUMENTO.md          # Documento de requisitos original
```

---

## 🔐 Multi-tenancy e Segurança

O isolamento é baseado no `camara_id` e no `slug`.

1.  **Resolvido via URL**: O `[slug]` na rota identifica a Câmara.
2.  **RLS (Row Level Security)**: Crítico. Todas as tabelas (exceto as públicas) devem ter políticas de RLS ativas. O banco de dados garante que um usuário só lê/escreve dados da `camara_id` associada ao seu `profile`.
3.  **Roles (Perfis)**:
    -   `ADMIN`: Gestão total do tenant.
    -   `PRESIDENTE`: Gestão de sessões e votações.
    -   `VEREADOR`: Acesso à pauta e execução de voto.
    -   `PUBLICO`: Visualização read-only.

---

## 📊 Modelo de Dados Principal

-   **`camaras`**: Dados da instituição (nome, slug, cnpj).
-   **`profiles`**: Ligação entre `auth.users` e `camaras`, armazena nome e `role`.
-   **`vereadores`**: Entidade parlamentar (nome, partido, foto, status).
-   **`sessoes`**: Encontros parlamentares (ordinárias/extraordinárias).
-   **`projetos`**: Matéria legislativa a ser votada.
-   **`votacoes`**: Instância de uma votação de um projeto em uma sessão.
-   **`votos`**: Registro individual de cada voto (voto nominal).

---

## ⚡ Padrões de Desenvolvimento

Para adicionar novas funcionalidades ou corrigir bugs, siga estas regras:

1.  **Tipagem**: Utilize TypeScript rigorosamente.
2.  **Formulários**: Use sempre `react-hook-form` com validação `Zod`.
3.  **UI**: Prefira os componentes do `components/ui`. As cores seguem o tema Navy Blue, Gold e Silver definido em `global.css`.
4.  **Ações de Banco**: Utilize **Server Actions** (`_actions.ts`) localizadas dentro das pastas de rota ou centralizadas em `app/admin/_actions`.
5.  **Filtro de Tenant**: SEMPRE inclua o `camara_id` ou filtre baseado no perfil do usuário autenticado no servidor. Nunca confie apenas em parâmetros vindos do cliente para segurança.
6.  **Realtime**: Para o painel de votação, utilize as assinaturas do Supabase (`supabase.channel('votos').on(...)`).

---

## 🤖 Guia para IA (LLM)

Ao me ajudar a desenvolver, considere:
-   O projeto é **mobile-first** no design, mas focado em desktops para o admin.
-   Ao criar uma nova tabela, lembre-se de sugerir o SQL com as políticas de **RLS**.
-   Utilize o `slug` vindo dos `params` das rotas para contexto de navegação.
-   O tema visual é "premium/institucional" (Navy, Gold).
