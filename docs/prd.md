# UTI Manager — Product Requirements Document (PRD)

## 1. Objetivos e Contexto

### 1.1 Objetivos

- Digitalizar o registro de evolução diária de pacientes internados na UTI do Hospital HUSE (Sergipe)
- Permitir captura de dados clínicos por voz ou texto, com extração estruturada via IA
- Fornecer visão consolidada do estado da UTI em tempo real (dashboard, mapa de leitos, alertas)
- Padronizar checklists diários de boas práticas em terapia intensiva
- Rastrear sinais vitais com visualização temporal e alertas por faixa crítica
- Reduzir tempo de documentação clínica para médicos e enfermeiros

### 1.2 Contexto

O Hospital de Urgências de Sergipe (HUSE) opera uma Unidade de Terapia Intensiva onde médicos e enfermeiros registram diariamente a evolução clínica dos pacientes. O processo tradicional depende de anotações manuais em papel ou formulários digitais genéricos que não capturam a complexidade dos dados de UTI — dispositivos, ventilação mecânica, sedação, antibióticos, hemodinâmica e diurese — de forma estruturada e consultável.

O UTI Manager resolve esse problema oferecendo um sistema web especializado para gestão de UTI. O profissional pode ditar a evolução do paciente por voz (Web Speech API) ou digitar texto livre; a IA (Google Gemini) extrai automaticamente os dados clínicos em formato estruturado. O sistema complementa com checklists padronizados (9 seções de boas práticas), monitoramento de sinais vitais com alertas visuais, e um dashboard operacional com KPIs, mapa de leitos e identificação de pacientes críticos.

### 1.3 Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-03-12 | 1.0 | PRD inicial — Sprint 1 completo (53 pontos) | @pm |
| 2026-03-12 | 1.1 | Redesign premium (dark/light mode, nova paleta, tipografia) + segurança API | @sm |

---

## 2. Requisitos

### 2.1 Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| FR-1 | O sistema deve autenticar usuários via Supabase Auth com email e senha |
| FR-2 | Rotas protegidas devem redirecionar usuários não autenticados para `/login` via middleware |
| FR-3 | O dashboard deve exibir 4 KPIs: total de pacientes, tempo médio de internação, pacientes em ventilação mecânica, pacientes em DVA |
| FR-4 | O dashboard deve exibir Mapa de Leitos com card por paciente contendo leito, iniciais, gênero, dias internado, diagnóstico, status, sinais vitais e dispositivos |
| FR-5 | O dashboard deve exibir painel de Dispositivos em Uso com contagem e barras de progresso por tipo |
| FR-6 | O dashboard deve exibir painel de Alertas e Atenções destacando pacientes críticos e internações prolongadas |
| FR-7 | O sistema deve permitir criar paciente com dados demográficos e clínicos (nome, leito, gênero, diagnóstico, status, etc.) |
| FR-8 | O sistema deve listar pacientes com busca e filtro |
| FR-9 | O sistema deve exibir detalhes do paciente com histórico de relatórios (evoluções) |
| FR-10 | O sistema deve permitir editar dados do paciente |
| FR-11 | O sistema deve permitir excluir paciente com confirmação |
| FR-12 | O sistema deve oferecer gravação de voz via Web Speech API (pt-BR) para captura de evolução clínica |
| FR-13 | O sistema deve oferecer entrada manual de texto como alternativa à gravação de voz |
| FR-14 | O sistema deve enviar transcrição para a API Gemini e extrair dados estruturados: gênero, leito, sinais vitais, dispositivos, ventilação, sedação, antibióticos, hemodinâmica, diurese |
| FR-15 | O sistema deve permitir revisão e edição dos dados extraídos pela IA antes de salvar |
| FR-16 | O sistema deve salvar relatório (evolução) vinculado ao paciente no Supabase |
| FR-17 | O checklist diário deve conter 9 seções: Analgesia/Sedação, Dieta, Prevenção de Complicações, Prevenção de Pneumonia, Prevenção de IPCS, Antibióticos, Exames, Planejamento, Conformidades |
| FR-18 | Cada item do checklist deve suportar tri-state: Sim, Não, N/A |
| FR-19 | O checklist deve exibir barras de progresso por seção |
| FR-20 | O checklist deve fazer upsert por paciente (um checklist ativo por paciente) |
| FR-21 | O sistema deve exibir timeline de sinais vitais agrupada por data |
| FR-22 | O sistema deve permitir registrar novos sinais vitais via formulário |
| FR-23 | Sinais vitais fora da faixa normal devem ser destacados em vermelho (FC >120 ou <50, Temp >38, SatO2 <94) |
| FR-24 | O sistema deve permitir excluir registro de sinais vitais com confirmação |
| FR-25 | A sidebar deve ser colapsável e exibir lista de pacientes para navegação rápida |
| FR-26 | O fluxo de áudio deve permitir selecionar o paciente antes de iniciar gravação |
| FR-27 | Componentes compartilhados: StatusBadge, CheckIcon, GenderBadge, VitalCard, MiniInfo, DeviceCard |
| FR-28 | O sistema deve permitir alternar entre tema escuro (dark) e claro (light) com persistência via localStorage |
| FR-29 | A API `/api/ai/extract` deve exigir autenticação (retornar 401 se não autenticado) e limitar input a 50.000 caracteres |

### 2.2 Requisitos Não-Funcionais

| ID | Requisito |
|----|-----------|
| NFR-1 | Row Level Security (RLS) habilitado em todas as tabelas do Supabase |
| NFR-2 | Chave de API do Gemini deve ser mantida exclusivamente no servidor (variável de ambiente), nunca exposta ao cliente |
| NFR-3 | Middleware de autenticação deve proteger todas as rotas exceto `/login` |
| NFR-4 | Interface em português brasileiro (pt-BR) |
| NFR-5 | Deploy na Vercel com região gru1 (São Paulo) para baixa latência |
| NFR-6 | Banco de dados PostgreSQL gerenciado pelo Supabase com UUIDs como PKs, colunas JSONB, índices e timestamps auto-atualizados |
| NFR-7 | Interface responsiva (mobile-first para uso em tablets na beira do leito) |
| NFR-8 | Tempo de carregamento da página inicial < 3 segundos |
| NFR-9 | Tipagem completa com TypeScript (database types gerados do Supabase) |
| NFR-10 | Proxy server-side para API de IA em `/api/ai/extract` (cliente nunca chama Gemini diretamente) |

---

## 3. Design de Interface

### 3.1 Visão UX

Interface clínica premium otimizada para uso rápido durante rounds de UTI. Estética "Clinical Luxury" com tema escuro como padrão e alternância para modo claro. Prioriza escaneabilidade visual (badges coloridos, glass cards, indicadores de status, glow effects) e entrada de dados por voz para minimizar digitação.

### 3.2 Paradigmas de Interação

- **Voice-first:** Gravação de voz como modo primário de entrada de dados clínicos
- **Card-based:** Informações de pacientes apresentadas em glass cards com indicadores visuais
- **Color-coded alerts:** Vermelho para valores críticos, badges coloridos por status e gênero
- **Progressive disclosure:** Sidebar colapsável, detalhes expandidos sob demanda
- **Tri-state controls:** Checklists com Sim/Não/N/A para captura rápida
- **Dark/Light toggle:** Alternância de tema persistida via localStorage com dark mode como padrão
- **Glassmorphism:** Cards com backdrop-blur (dark) ou sombras sutis (light) para profundidade visual

### 3.3 Telas Principais

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard — KPIs, Mapa de Leitos, Dispositivos em Uso, Alertas e Atenções |
| `/login` | Tela de autenticação (email + senha) |
| `/pacientes` | Lista de pacientes com busca |
| `/pacientes/novo` | Formulário de criação de paciente |
| `/pacientes/[id]` | Detalhes do paciente com histórico de evoluções/relatórios |
| `/pacientes/[id]/editar` | Formulário de edição de paciente |
| `/pacientes/[id]/checklist` | Checklist diário (9 seções, tri-state, progresso) |
| `/pacientes/[id]/vitais` | Timeline de sinais vitais com formulário de registro |
| `/audio` | Seleção de paciente para fluxo de áudio |
| `/audio/gravar` | Gravação de voz ou entrada de texto |
| `/audio/revisar` | Revisão e edição dos dados extraídos pela IA |
| `/api/ai/extract` | API Route — proxy server-side para Gemini |

### 3.4 Acessibilidade

- Contraste adequado para ambiente hospitalar (iluminação variável)
- Componentes shadcn/ui com suporte a teclado e screen readers
- Badges e indicadores visuais com significado semântico (não apenas cor)

### 3.5 Branding & Design System

- **Paleta primária:** Teal/Emerald (oklch 0.7 0.15 180 dark / oklch 0.55 0.15 180 light) — transmite confiança e ambiente clínico
- **Tipografia:** Outfit (display/headings), DM Sans (body), JetBrains Mono (dados numéricos/vitais)
- **Tema padrão:** Dark mode com backgrounds em oklch deep blue-gray e cards glass
- **Tema alternativo:** Light mode com fundos brancos, sombras sutis e teal mais escuro para contraste
- **Efeitos visuais:** Glass cards (backdrop-blur), glow-teal (box-shadow sutil), pulse-alert (animação para alertas), fade-slide-up (transições de página)
- **Scrollbar customizada:** 6px, transparente com thumb semi-transparente
- **Ícone:** Activity (pulso cardíaco) como marca do sistema com glow teal
- **Identificação:** **UTI Manager — HUSE Sergipe**

### 3.6 Plataformas

- Web responsivo (desktop, tablet, mobile)
- Otimizado para Chrome (requisito do Web Speech API)
- Tablets na beira do leito como dispositivo primário de uso

---

## 4. Premissas Técnicas

### 4.1 Estrutura do Repositório

Monorepo — aplicação Next.js única em `/home/gustavo/rafabastos/uti-manager`

### 4.2 Arquitetura

- **Framework:** Next.js 16 com App Router (Server Components + Client Components)
- **Estilização:** Tailwind CSS 4 + shadcn/ui + design system oklch (dark/light)
- **Backend-as-a-Service:** Supabase (PostgreSQL, Auth, RLS)
- **IA:** Google Gemini 3.1 Flash Lite Preview via API Route server-side
- **Speech:** Web Speech API (navegador, pt-BR)
- **Database:** 4 tabelas — `patients`, `reports`, `vitals`, `checklists` (UUID PKs, JSONB, índices, timestamps automáticos)

### 4.3 Testes

Estado atual: nenhum teste automatizado implementado. Planejado para Sprint 2 (Epic 4).

### 4.4 Premissas Adicionais

- **Supabase project ID:** `qfikhxlackqxrjizvkfm`
- **Vercel region:** `gru1` (São Paulo, Brasil)
- **AI model:** `gemini-3.1-flash-lite-preview`
- **Speech recognition:** Web Speech API (Chrome recomendado)
- **Usuário admin inicial:** `admin@utimaster.com`

---

## 5. Épicos

### Epic 1: Fundação e Infraestrutura Core (DONE)

| Story | Título | Pontos | Status |
|-------|--------|--------|--------|
| 1.1 | Setup do projeto (Next.js, TypeScript, Tailwind, shadcn/ui) | 5 | Done |
| 1.2 | Configuração Supabase (tabelas, types, clients, RLS) | 8 | Done |
| 1.3 | Componentes compartilhados (StatusBadge, VitalCard, Sidebar, etc.) | 5 | Done |
| 1.4 | API proxy de extração IA (Gemini) | 5 | Done |

### Epic 2: Gestão de Pacientes e Dados Clínicos (DONE)

| Story | Título | Pontos | Status |
|-------|--------|--------|--------|
| 1.5 | CRUD completo de pacientes | 8 | Done |
| 1.6 | Fluxo de áudio (gravação + texto + extração IA + revisão + salvar) | 8 | Done |
| 1.7 | Checklist diário (9 seções, tri-state, progresso, upsert) | 5 | Done |
| 1.8 | Sinais vitais (timeline, formulário, alertas, exclusão) | 5 | Done |

### Epic 3: Segurança e Dashboard (DONE)

| Story | Título | Pontos | Status |
|-------|--------|--------|--------|
| 1.9 | Autenticação (Supabase Auth, login, middleware) | 2 | Done |
| 1.10 | Dashboard (KPIs, Mapa de Leitos, Dispositivos, Alertas) | 2 | Done |

### Epic 3.1: Redesign Premium e Segurança API (DONE)

| Story | Título | Pontos | Status |
|-------|--------|--------|--------|
| 1.11 | Redesign premium: paleta teal/oklch, tipografia (Outfit/DM Sans/JetBrains Mono), glass cards, efeitos visuais | 8 | Done |
| 1.12 | Dark/Light mode toggle com persistência localStorage | 3 | Done |
| 1.13 | Proteção da API de IA (auth obrigatória + limite 50k chars) | 2 | Done |

### Epic 4: Melhorias e Qualidade (PLANNED)

- Testes automatizados (unit, integration, E2E)
- Logout e gestão de sessão
- Perfil do usuário (nome do autor automático nos relatórios)
- Exportação de relatórios em PDF
- Notificações de alertas (pacientes críticos)
- Histórico de alterações (audit log)
- PWA / modo offline para uso sem conectividade

---

## 6. Próximos Passos

- **@ux-design-expert:** Revisar design system, consistência visual e acessibilidade (WCAG 2.1 AA)
- **@architect:** Definir estratégia de testes (Jest + Testing Library + Playwright) e pipeline CI/CD
- **@devops:** Configurar Vercel production com variáveis de ambiente e domínio
- **@qa:** Definir plano de testes para Sprint 2
- **@pm:** Priorizar backlog do Epic 4 e definir Sprint 2
