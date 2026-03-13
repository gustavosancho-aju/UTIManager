# Design System — UTI Manager

**Versão:** 1.0 | **Data:** 2026-03-12 | **Autor:** Uma (UX/UI Designer)

---

## 1. Filosofia de Design

**"Clinical Luxury"** — Uma interface clínica premium que transmite confiança e profissionalismo. Combina a seriedade exigida por um ambiente de UTI com a elegância de um produto SaaS moderno.

### Princípios

1. **Escaneabilidade** — Informações críticas visíveis em menos de 2 segundos
2. **Voice-first** — Priorizar entrada de dados por voz sobre digitação
3. **Contraste adaptativo** — Funcionar em iluminação variável (UTI, plantão noturno)
4. **Zero cognitive load** — Badges, cores e ícones comunicam estado sem leitura

---

## 2. Cores (Design Tokens)

Sistema de cores baseado em **oklch** para consistência perceptual. Duas variantes: dark (padrão) e light.

### 2.1 Tokens Semânticos

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `--background` | `oklch(0.13 0.005 260)` | `oklch(1 0 0)` | Fundo da página |
| `--foreground` | `oklch(0.95 0 0)` | `oklch(0.145 0 0)` | Texto principal |
| `--card` | `oklch(0.17 0.006 260)` | `oklch(1 0 0)` | Fundo de cards |
| `--primary` | `oklch(0.7 0.15 180)` | `oklch(0.55 0.15 180)` | Teal — ação principal |
| `--primary-foreground` | `oklch(0.13 0.005 260)` | `oklch(0.985 0 0)` | Texto sobre primary |
| `--secondary` | `oklch(0.22 0.008 260)` | `oklch(0.97 0 0)` | Fundo secundário |
| `--muted` | `oklch(0.22 0.008 260)` | `oklch(0.97 0 0)` | Fundo sutil/inativo |
| `--muted-foreground` | `oklch(0.6 0.01 260)` | `oklch(0.556 0 0)` | Texto secundário |
| `--destructive` | `oklch(0.65 0.2 25)` | `oklch(0.577 0.245 27.325)` | Vermelho — erro/perigo |
| `--border` | `oklch(1 0 0 / 8%)` | `oklch(0.922 0 0)` | Bordas |
| `--input` | `oklch(1 0 0 / 10%)` | `oklch(0.922 0 0)` | Fundo de inputs |
| `--ring` | `oklch(0.7 0.15 180)` | `oklch(0.55 0.15 180)` | Focus ring |

### 2.2 Tokens de Sidebar

| Token | Dark | Light |
|-------|------|-------|
| `--sidebar` | `oklch(0.11 0.008 260)` | `oklch(0.97 0.005 260)` |
| `--sidebar-foreground` | `oklch(0.95 0 0)` | `oklch(0.15 0 0)` |
| `--sidebar-primary` | `oklch(0.7 0.15 180)` | `oklch(0.55 0.15 180)` |
| `--sidebar-accent` | `oklch(0.18 0.01 260)` | `oklch(0.93 0.005 260)` |
| `--sidebar-border` | `oklch(1 0 0 / 6%)` | `oklch(0 0 0 / 8%)` |

### 2.3 Tokens de Chart

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--chart-1` | `oklch(0.7 0.15 180)` | `oklch(0.55 0.15 180)` | Primário |
| `--chart-2` | `oklch(0.65 0.18 160)` | `oklch(0.5 0.13 165)` | Secundário |
| `--chart-3` | `oklch(0.6 0.16 145)` | `oklch(0.45 0.11 150)` | Terciário |
| `--chart-4` | `oklch(0.72 0.12 200)` | `oklch(0.5 0.09 195)` | Quaternário |
| `--chart-5` | `oklch(0.55 0.2 280)` | `oklch(0.45 0.07 210)` | Quinário |

### 2.4 Cores Funcionais (Hardcoded, não variam por tema)

| Cor | Classe Tailwind | Uso |
|-----|----------------|-----|
| Verde | `bg-green-500` / `bg-emerald-600` | Sucesso, checklist "Sim", ativo |
| Vermelho | `bg-red-500` / `text-destructive` | Erro, checklist "Não", alerta crítico |
| Âmbar | `bg-amber-500/10` | Warning, atenção |
| Rose | `bg-rose-500/10` | Indicador PA (sinais vitais) |
| Orange | `bg-orange-500/10` | Indicador FC (sinais vitais) |

### 2.5 Regra de Ouro

> **NUNCA use cores hardcoded (`bg-white`, `bg-gray-*`, `bg-sky-*`, `bg-slate-*`) para backgrounds ou texto principal.** Use SEMPRE tokens semânticos (`bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`, etc.).
>
> Exceção: cores funcionais intencionais (verde/vermelho/âmbar) para indicadores de estado.

---

## 3. Tipografia

### 3.1 Font Stack

| Variável | Fonte | Peso | Uso |
|----------|-------|------|-----|
| `--font-display` | **Outfit** | 400–900 | Headings (h1-h6), títulos de seção, logo |
| `--font-sans` | **DM Sans** | 400–700 | Body text, labels, descriptions |
| `--font-mono` | **JetBrains Mono** | 400–600 | Dados numéricos, sinais vitais, leitos, códigos |

### 3.2 Escalas Tipográficas

| Elemento | Classe | Font | Peso |
|----------|--------|------|------|
| Page title | `text-2xl font-extrabold font-display` | Outfit | 800 |
| Section title | `text-base font-bold font-display` | Outfit | 700 |
| Section label | `text-[10px] font-semibold uppercase tracking-[0.15em]` | DM Sans | 600 |
| Body text | `text-sm` | DM Sans | 400 |
| Body bold | `text-sm font-semibold` | DM Sans | 600 |
| Data/numbers | `text-sm font-mono font-bold` | JetBrains Mono | 700 |
| KPI value | `text-3xl font-mono font-black` | JetBrains Mono | 900 |
| Micro label | `text-[11px] text-muted-foreground` | DM Sans | 400 |
| Badge | `text-[10px] font-bold` | DM Sans | 700 |

### 3.3 Regras

- Headings (h1-h6) usam `font-display` automaticamente via `@layer base`
- Dados numéricos e vitais **sempre** usam `font-mono`
- Labels de formulário: `text-xs font-medium text-muted-foreground`
- Sublabels de seção: `text-[10px] uppercase tracking-[0.15em] text-muted-foreground`

---

## 4. Espaçamento

### 4.1 Sistema de Grid

| Contexto | Padding | Gap |
|----------|---------|-----|
| Dashboard layout | `p-8` | — |
| Card interno | `p-5` | — |
| Form section | `p-6` | `gap-4` |
| Grid de cards | — | `gap-4` |
| Lista items | `px-3 py-2.5` | `space-y-1` |
| Header da sidebar | `px-5 h-16` | `gap-3` |

### 4.2 Margens entre Seções

| Entre | Classe |
|-------|--------|
| Título → conteúdo | `mb-7` ou `mb-9` |
| Card → card | `mb-4` ou `mb-6` |
| Form field → field | `gap-4` |
| Seção → seção | `space-y-6` |

---

## 5. Raio de Borda

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius` | `0.75rem` (12px) | Base |
| `rounded-sm` | `0.45rem` | Badges pequenos |
| `rounded-md` | `0.6rem` | Inputs, buttons pequenos |
| `rounded-lg` | `0.75rem` | Buttons, cards pequenos |
| `rounded-xl` | `1.05rem` | Cards padrão, seções |
| `rounded-2xl` | `1.35rem` | Cards grandes, modais |
| `rounded-full` | `9999px` | Avatars, badges circulares, dots |

### Regra

- **Cards e seções:** `rounded-xl`
- **Buttons:** `rounded-lg` (padrão shadcn)
- **Inputs:** `rounded-md`
- **Badges/pills:** `rounded-full`

---

## 6. Efeitos Visuais

### 6.1 Glass Card (`.glass-card`)

O componente principal de superfície. Adapta-se automaticamente ao tema.

```css
/* Dark mode */
.dark .glass-card {
  background: oklch(1 0 0 / 5%);
  backdrop-filter: blur(12px);
  border: 1px solid oklch(1 0 0 / 8%);
}

/* Light mode */
:root .glass-card {
  background: oklch(1 0 0);
  border: 1px solid oklch(0 0 0 / 8%);
  box-shadow: 0 1px 3px oklch(0 0 0 / 5%);
}
```

**Uso:** Todos os cards de conteúdo, seções de formulário, painéis.

```tsx
<div className="glass-card rounded-xl p-5">
  {/* conteúdo */}
</div>
```

### 6.2 Glow Teal (`.glow-teal`)

Box-shadow teal sutil para elementos de destaque.

```css
.glow-teal {
  box-shadow: 0 0 20px oklch(0.7 0.15 180 / 15%),
              0 0 60px oklch(0.7 0.15 180 / 5%);
}
```

**Uso:** Logo na sidebar, KPI cards em hover.

### 6.3 Pulse Alert (`.pulse-alert`)

Animação pulsante para alertas críticos.

```css
.pulse-alert {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

**Uso:** Badge de contagem de alertas no dashboard.

### 6.4 Page Enter (`.page-enter`)

Transição suave de entrada de página.

```css
.page-enter {
  animation: fadeSlideUp 0.3s ease-out;
}
```

**Uso:** Wrapper do conteúdo principal no layout do dashboard.

### 6.5 Scrollbar

Scrollbar customizada: 6px, transparente, thumb semi-transparente.

---

## 7. Componentes

### 7.1 Componentes shadcn/ui (Base)

| Componente | Uso no sistema |
|-----------|---------------|
| `Button` | Ações primárias/secundárias/outline |
| `Input` | Campos de formulário |
| `Textarea` | Campos de texto multilinha |
| `Badge` | Status, tags |
| `Card` | Base (preferir `glass-card` para visual premium) |
| `Dialog` | Confirmações de exclusão |
| `Table` | Lista de pacientes |
| `Tabs` | Navegação contextual |
| `Tooltip` | Informação adicional on hover |
| `ScrollArea` | Listas com scroll |
| `Separator` | Divisores visuais |
| `Avatar` | Foto/iniciais do paciente |
| `Sheet` | Painel lateral mobile |

### 7.2 Componentes Customizados

| Componente | Arquivo | Uso |
|-----------|---------|-----|
| `StatusBadge` | `shared/status-badge.tsx` | Status do paciente (Internado, Alta, etc.) |
| `GenderBadge` | `shared/gender-badge.tsx` | Indicador M/F |
| `VitalCard` | `shared/vital-card.tsx` | Card de sinal vital individual |
| `DeviceCard` | `shared/device-card.tsx` | Card de dispositivo médico |
| `MiniInfo` | `shared/mini-info.tsx` | Label + valor inline |
| `CheckIcon` | `shared/check-icon.tsx` | Ícone de check com estados |
| `Sidebar` | `dashboard/sidebar.tsx` | Navegação lateral com collapse |

### 7.3 Padrões de Componente

#### Card de Conteúdo
```tsx
<div className="glass-card rounded-xl p-5">
  <h2 className="text-sm font-bold font-display text-foreground uppercase tracking-wider mb-4">
    Título da Seção
  </h2>
  {/* conteúdo */}
</div>
```

#### KPI Card
```tsx
<div className="glass-card rounded-xl p-5">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
      Label
    </span>
  </div>
  <div className="text-3xl font-mono font-black text-foreground">42</div>
</div>
```

#### Botão Primário
```tsx
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
  <Icon className="w-4 h-4" />
  Ação
</Button>
```

#### Erro/Alerta
```tsx
<div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
  <p className="text-sm text-destructive">{error}</p>
</div>
```

#### Warning
```tsx
<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
  <p className="text-sm text-foreground">{warning}</p>
</div>
```

---

## 8. Ícones

**Biblioteca:** Lucide React

### Ícones Padrão por Contexto

| Contexto | Ícone | Import |
|----------|-------|--------|
| Dashboard | `LayoutDashboard` | lucide-react |
| Pacientes | `Users` | lucide-react |
| Áudio/Voz | `Mic` | lucide-react |
| Leitos | `BedDouble` | lucide-react |
| Sinais vitais | `Activity` | lucide-react |
| PA | `Heart` | lucide-react |
| FC | `Activity` | lucide-react |
| Temperatura | `Thermometer` | lucide-react |
| SatO2 | `Droplets` | lucide-react |
| Salvar | `Save` | lucide-react |
| Excluir | `Trash2` | lucide-react |
| Voltar | `ArrowLeft` | lucide-react |
| Novo | `Plus` | lucide-react |
| Fechar | `X` | lucide-react |
| Loading | `Loader2` (animate-spin) | lucide-react |
| Tema dark | `Moon` | lucide-react |
| Tema light | `Sun` | lucide-react |
| Logout | `LogOut` | lucide-react |
| Collapse | `PanelLeftClose` / `PanelLeft` | lucide-react |

---

## 9. Tema Dark/Light

### 9.1 Implementação

- **Hook:** `useTheme()` em `src/hooks/useTheme.ts`
- **Persistência:** `localStorage` com chave `uti-theme`
- **Padrão:** Dark mode
- **Toggle:** Botão Sun/Moon no footer da sidebar
- **Mecanismo:** Classe `dark` no `<html>` element

### 9.2 Regras para Desenvolvedores

1. **Sempre use tokens semânticos** — nunca hardcode cores
2. **Teste em ambos os temas** antes de commitar
3. **Glass-card** adapta automaticamente — não precisa de variantes
4. **Cores funcionais** (green, red, amber) são OK hardcoded, mas use opacidade para backgrounds: `bg-green-500` para fill, `bg-green-500/10` para background sutil

---

## 10. Responsividade

### Breakpoints

| Breakpoint | Valor | Uso |
|-----------|-------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / Desktop small |
| `xl` | 1280px | Desktop |

### Padrões

- **Sidebar:** 280px expandida / 68px colapsada
- **Content area:** `max-w-2xl` para forms, `max-w-3xl` para revisão, `max-w-5xl` para checklist
- **Grid:** `grid-cols-1 md:grid-cols-2` para forms, `grid-cols-2 md:grid-cols-4` para vitais
- **Cards:** Full width em mobile, grid em desktop

---

## 11. Acessibilidade

### 11.1 Contraste

- Texto principal sobre background: ratio ≥ 4.5:1 (WCAG AA)
- Primary teal: `oklch(0.55 ...)` no light mode para contraste suficiente sobre branco
- Dados críticos (sinais vitais fora da faixa) usam `text-red-500` que mantém contraste em ambos os temas

### 11.2 Semântica

- Todos os inputs possuem `<label>` com `htmlFor`
- Badges usam significado semântico além da cor (texto + ícone)
- Botões de ação com `title` attribute
- Loading states com `aria-busy` implícito via Loader2 animate-spin

### 11.3 Interação

- Focus ring visível: `--ring` teal em ambos os temas
- Componentes shadcn/ui com suporte a teclado nativo (Radix UI)
- Touch targets ≥ 44px para uso em tablets (UTI beira-leito)

---

## 12. Arquivos de Referência

| Arquivo | Conteúdo |
|---------|----------|
| `src/app/globals.css` | Tokens CSS, utility classes, efeitos |
| `src/app/layout.tsx` | Font loading (Outfit, DM Sans, JetBrains Mono) |
| `src/hooks/useTheme.ts` | Hook de tema dark/light |
| `src/components/dashboard/sidebar.tsx` | Sidebar com toggle de tema |
| `src/components/shared/` | Componentes customizados do design system |
| `src/components/ui/` | Componentes shadcn/ui |

---

*Design System v1.0 — UTI Manager HUSE Sergipe*
*Criado por Uma (UX/UI Designer) — Synkra AIOS*
