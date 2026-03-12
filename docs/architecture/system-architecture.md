# Arquitetura do Sistema — UTI Manager

> Documento gerado por @architect (Aria) em 2026-03-12
> Versão: 1.0 | Sprint 1 Complete

---

## 1. Visão Geral

O **UTI Manager** é um sistema de gestão de UTI (Unidade de Terapia Intensiva) construído com arquitetura moderna de Server/Client Components. Permite captura de dados clínicos via voz com extração automática por IA, gestão de pacientes, sinais vitais, checklists diários e dashboard de KPIs.

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React + shadcn/ui (Base UI) | 19.2.3 |
| Estilização | Tailwind CSS | 4.0 |
| Linguagem | TypeScript (strict) | 5.x |
| Banco de Dados | PostgreSQL (Supabase) | — |
| Autenticação | Supabase Auth | SSR |
| IA | Google Gemini 3.1 Flash Lite | Preview |
| Áudio | Web Speech API | Browser |
| Deploy | Vercel | gru1 (São Paulo) |

### Otimizações

- **React Compiler** (Babel plugin) habilitado para memoização automática
- **Edge Middleware** para autenticação rápida
- **Region gru1** (São Paulo) para latência mínima

---

## 2. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  Pages   │  │   Client     │  │  Web Speech API   │ │
│  │  (SSR)   │  │  Components  │  │  (pt-BR)          │ │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘ │
└───────┼────────────────┼───────────────────┼────────────┘
        │                │                   │
        ▼                ▼                   ▼
┌───────────────────────────────────────────────────────┐
│                   NEXT.JS SERVER                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Middleware   │  │  API Routes  │  │  Server      │ │
│  │ (Auth Edge) │  │  /api/ai/*   │  │  Components  │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼────────────────┼─────────────────┼─────────┘
          │                │                 │
          ▼                ▼                 ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│  Supabase Auth   │  │ Google       │  │ Supabase DB  │
│  (Cookies SSR)   │  │ Gemini API   │  │ (PostgreSQL) │
└──────────────────┘  └──────────────┘  └──────────────┘
```

---

## 3. Fluxo de Autenticação

```
Requisição → Edge Middleware → Supabase SSR (cookie check)
                │
    ┌───────────┴──────────┐
    ▼                      ▼
 [Autenticado]        [Não Autenticado]
    │                      │
    ▼                      ▼
 Dashboard            Redirect /login
```

**Detalhes:**
- Supabase Auth com email/senha
- Sessão via cookies httpOnly (gerenciados bidirecionalmente)
- Middleware permite: rotas API, assets estáticos, `_next/*`
- Usuários autenticados em `/login` são redirecionados ao dashboard

---

## 4. Modelo de Dados

### Schema PostgreSQL

```
┌──────────────┐     ┌──────────────┐
│   patients   │────<│   reports    │
├──────────────┤     ├──────────────┤
│ id (UUID PK) │     │ id (UUID PK) │
│ initials     │     │ patient_id FK│
│ name         │     │ date         │
│ gender (M/F) │     │ time         │
│ birth_date   │     │ author       │
│ registration │     │ transcription│
│ bed          │     │ devices JSON │
│ unit         │     │ ventilation  │
│ admission_*  │     │ sedation     │
│ main_diag    │     │ antibiotics  │
│ clinical_st  │     │ hemodynamics │
│ created_at   │     │ vital_signs  │
│ updated_at   │     │ created_at   │
└──────┬───────┘     └──────────────┘
       │
       ├────<┌──────────────┐
       │     │   vitals     │
       │     ├──────────────┤
       │     │ id (UUID PK) │
       │     │ patient_id FK│
       │     │ date / time  │
       │     │ pa, fc, temp │
       │     │ sato2, author│
       │     │ created_at   │
       │     └──────────────┘
       │
       └────<┌──────────────┐
             │  checklists  │
             ├──────────────┤
             │ id (UUID PK) │
             │ patient_id FK│  UNIQUE
             │ analgesia    │  (JSON)
             │ dieta        │  (JSON)
             │ prev_*       │  (JSON)
             │ antibioticos │  (JSON)
             │ exames       │  (JSON)
             │ planejamento │  (JSON)
             │ conformidades│  (JSON)
             │ updated_at   │
             └──────────────┘
```

### Constraints & Segurança

- **RLS habilitado** em todas as tabelas — acesso apenas para `auth.role() = 'authenticated'`
- **Cascade delete**: reports e vitals são removidos ao deletar paciente
- **Unique**: `patients.registration`, `checklists.patient_id` (1 checklist por paciente, upsert)
- **Índices**: `reports(patient_id)`, `reports(date DESC)`, `vitals(patient_id)`, `vitals(date DESC, time DESC)`

---

## 5. Integração com IA

### Pipeline de Extração Médica

```
Áudio/Texto → POST /api/ai/extract → Gemini 3.1 Flash Lite → JSON Estruturado
                                          │
                                          ▼
                                    ┌─────────────┐
                                    │ Dados:      │
                                    │ • gender    │
                                    │ • bed       │
                                    │ • devices   │
                                    │ • ventilação│
                                    │ • sedação   │
                                    │ • vitais    │
                                    └──────┬──────┘
                                           ▼
                                    sessionStorage
                                    "audio-review-data"
                                           ▼
                                    Revisão Humana
                                           ▼
                                    Salvar no Supabase
```

**Configuração Gemini:**
- Temperatura: **0.1** (determinístico para dados médicos)
- Max tokens: 1000
- System prompt em português com regras de normalização médica
- Limpeza de markdown no JSON de resposta

**Padrão de Segurança:** Toda extração passa por revisão humana antes de persistir.

---

## 6. Estrutura de Rotas

```
/
├── /login                          # Autenticação (pública)
└── /(dashboard)/                   # Rotas protegidas
    ├── /                           # Dashboard (KPIs, alertas, leitos)
    ├── /pacientes                  # Lista de pacientes
    │   ├── /novo                   # Criar paciente
    │   └── /[id]                   # Detalhe do paciente
    │       ├── /editar             # Editar dados
    │       ├── /vitais             # Sinais vitais (timeline)
    │       └── /checklist          # Checklist diário UTI
    └── /audio                      # Captura de áudio
        ├── /gravar                 # Gravação/transcrição
        └── /revisar                # Revisão da extração IA
```

---

## 7. Camada de Acesso a Dados

Módulos em `src/lib/supabase/`:

| Módulo | Responsabilidade |
|--------|-----------------|
| `server.ts` | Cliente Supabase server-side (cookies SSR) |
| `client.ts` | Cliente Supabase browser-side |
| `patients.ts` | CRUD pacientes + relações |
| `reports.ts` | Laudos/evoluções médicas |
| `vitals.ts` | Timeline de sinais vitais |
| `checklists.ts` | Checklists diários (upsert) |
| `dashboard.ts` | Dados agregados para KPIs |

**Padrão:** Acesso direto via Supabase SDK (sem camada API intermediária para CRUD). Apenas a integração com IA usa API Route.

---

## 8. Arquitetura de Componentes

### Camadas

| Camada | Tipo | Exemplos |
|--------|------|---------|
| **Pages** | Server Components | Layouts, route pages |
| **Features** | Client Components (`use client`) | Sidebar, Dashboard, Forms, Audio |
| **Shared** | Componentes reutilizáveis | GenderBadge, StatusBadge, VitalCard, DeviceCard |
| **UI Primitives** | shadcn/ui (Base UI + Tailwind) | Button, Card, Input, Table, Dialog, Tabs |

### Design System

- **Cores primárias:** Sky blue (`sky-500`/`600`/`700`)
- **Status:** Vermelho (crítico), Âmbar (atenção), Verde (estável)
- **Backgrounds:** Gradientes suaves (`from-sky-50 via-slate-100 to-purple-50/30`)
- **Tipografia:** Geist Sans (default), Geist Mono (tabelas)
- **Bordas:** Rounded xl/2xl, sombras sm/lg

---

## 9. Hooks Customizados

| Hook | Função |
|------|--------|
| `useSpeechRecognition()` | Wrapper da Web Speech API (pt-BR, modo contínuo, resultados interim) |

**Utilitários:**
- `cn()` — clsx + tailwind-merge para classes condicionais

---

## 10. Decisões Arquiteturais (ADRs)

| # | Decisão | Rationale | Trade-off |
|---|---------|-----------|-----------|
| 1 | Server/Client Components híbrido | SSR + interatividade | Complexidade de patterns de dados |
| 2 | Middleware Edge para auth | Check rápido antes do render | Apenas lógica simples (sem redirect interativo) |
| 3 | Supabase (PostgreSQL) | Realtime, auth built-in, serverless | Vendor lock-in |
| 4 | Gemini para extração | Custo-benefício, suporte pt-BR, controle fino | Dependência externa, latência |
| 5 | Web Speech API no browser | Sem upload de áudio, privacy-first | Depende de Chrome/Edge |
| 6 | sessionStorage para review | Estado temporário sem DB | Perde dados em refresh |
| 7 | Tailwind + shadcn/ui | Desenvolvimento rápido, consistente | Payload CSS, curva de aprendizado |
| 8 | React 19 Compiler | Memoização automática | Experimental |
| 9 | Acesso direto Supabase (sem API layer) | Simplicidade, menos latência | Menos controle centralizado |
| 10 | Deploy Vercel gru1 | Latência mínima para Brasil | Single-region |

---

## 11. Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxx...
GEMINI_API_KEY=AIza...  # Server-side only
```

---

## 12. Funcionalidades do Dashboard

| Feature | Descrição |
|---------|-----------|
| **KPIs** | Total pacientes, média dias internação, em ventilação, em vasopressores |
| **Alertas** | Cor-codificados: choque, status grave, SatO2 <94%, >14 dias |
| **Mapa de Leitos** | Cards por paciente (leito, iniciais, diagnóstico, status) |
| **Uso de Dispositivos** | Barras de progresso (TOT, DVA, CVC, SVD, SNG, SNE) |

---

*Documento mantido por @architect (Aria) — Synkra AIOS*
