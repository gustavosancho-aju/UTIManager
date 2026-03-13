# Análise Competitiva — UTI Manager

**Data:** 2026-03-12 | **Analista:** Atlas (Business Analyst) | **Produto:** UTI Manager — HUSE Sergipe

---

## 1. Mapa de Concorrentes

| Nome | País | Tipo | Foco Principal | Modelo de Negócio |
|------|------|------|----------------|-------------------|
| EPIMED Monitor | Brasil | Direto | Benchmarking e gestão de qualidade em UTI | SaaS (assinatura por leito/mês) |
| Philips ICCA | Holanda | Direto | Documentação clínica + integração dispositivos UTI | Licença + manutenção (enterprise) |
| GE CARESCAPE | EUA | Direto | Monitoramento e documentação em terapia intensiva | Licença + hardware bundle |
| Oracle Cerner CriticalCare | EUA | Direto | Módulo UTI integrado ao EHR Millennium | Licença enterprise |
| iMDsoft MetaVision | Israel | Direto | PDMS (Patient Data Management System) para UTI | Licença + manutenção |
| MV Sistemas (Soul MV) | Brasil | Indireto | PEP/ERP hospitalar completo | Licença + implantação + manutenção |
| Tasy (Philips) | Brasil | Indireto | ERP/PEP hospitalar | Licença + implantação |
| Wareline | Brasil | Indireto | PEP hospitalar (hospitais médios) | Licença + SaaS |
| ProntHospital | Brasil | Indireto | Gestão hospitalar integrada | Licença + implantação |
| TOTVS Saúde | Brasil | Indireto | ERP hospitalar e clínico | Licença + SaaS |
| Ampere (Laura) | Brasil | Indireto | IA para detecção precoce de deterioração clínica | SaaS (complementar) |

---

## 2. Concorrentes Diretos

### 2.1 EPIMED Monitor (Brasil)

**Empresa:** EPIMED Solutions, Rio de Janeiro
**Presença:** ~1.723 UTIs em 763 hospitais de 10 países. No Brasil, cobre ~50% dos leitos UTI adulto em 25/27 estados (dados dez/2023: 23.852 leitos)
**Foco:** Benchmarking de indicadores de qualidade em terapia intensiva

**Funcionalidades principais:**
- Coleta estruturada de dados de admissão, alta e óbito
- Cálculo automático de scores: SAPS 3, APACHE II/IV, SOFA, Charlson
- Benchmarking nacional — SMR (Standardized Mortality Ratio) comparado à média brasileira
- Dashboard de indicadores: mortalidade, tempo de internação, reinternação
- Relatórios de qualidade para acreditação (ONA, JCI)
- Monitoramento de infecções (IRAS) com integrações CCIH
- Exportação de dados para pesquisa acadêmica

**Pontos fortes:** Referência em benchmarking de UTI no Brasil; base de dados nacional robusta; aceito como padrão pela AMIB.

**Limitações:** Não é sistema de beira-leito (point-of-care); não captura sinais vitais em tempo real; não tem mapa de leitos interativo; sem entrada por voz; foco em dados retrospectivos, não em workflow diário.

**Preço estimado:** R$ 50-150/leito/mês

Fontes: [EPIMED Solutions](https://www.epimedsolutions.com/en/monitor-icu-system/), [SciELO/RBTI](https://www.scielo.br/j/rbti/a/hGVD6MPzdnbMPSV9YtLFNjb/), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11463981/)

---

### 2.2 Philips ICCA (IntelliSpace Critical Care and Anesthesia)

**Empresa:** Philips Healthcare, Holanda
**Presença:** Global, >2.000 UTIs em >45 países
**Classe:** SaMD Classe IIb — software como dispositivo médico

**Funcionalidades principais:**
- Integração nativa com monitores e ventiladores Philips (IntelliVue)
- Flowsheet eletrônico detalhado (sinais vitais, balanço hídrico, medicações)
- Prescrição eletrônica com alertas de interação
- Scores automáticos (APACHE, SOFA, SAPS, GCS)
- Clinical Decision Support (CDSS) com bundles configuráveis (sepse, VAP, DVT)
- Integração HL7 v2 e FHIR com sistemas hospitalares
- Módulo de anestesia integrado
- Plataforma DAR (Data Analysis and Reporting)

**Pontos fortes:** Integração profunda com ecossistema Philips; maturidade clínica; certificações regulatórias globais (FDA, CE, ANVISA).

**Limitações:** Custo muito elevado (centenas de milhares de dólares); dependência do ecossistema Philips; implantação complexa (6-18 meses); interface desktop tradicional; requer infraestrutura on-premise.

**Preço estimado:** US$ 200.000-1.000.000+ (implantação) + manutenção anual 15-20%

Fontes: [Philips ICCA](https://www.usa.philips.com/healthcare/product/HCNOCTN332/intellispace-critical-care-and-anesthesia), [IntuitionLabs](https://intuitionlabs.ai/software/intensive-care-critical-care/critical-care-documentation/philips-intellispace-critical-care)

---

### 2.3 iMDsoft MetaVision

**Empresa:** iMDsoft (Israel)
**Presença:** >400 hospitais globalmente
**Foco:** PDMS especializado em UTI (adulto, neonatal, pediátrica)

**Funcionalidades principais:**
- Coleta automática de dados de >180 tipos de equipamentos
- Flowsheets configuráveis com validação de dados
- Prescrição e administração de medicamentos
- Balanço hídrico automatizado
- Scores calculados (APACHE, SOFA, TISS)
- Alertas clínicos configuráveis
- Interface touch-friendly para beira-leito
- Integração com HIS via HL7 v2 e FHIR

**Pontos fortes:** Especializado em UTI; ampla integração multi-vendor; maturidade.

**Limitações:** Custo elevado; on-premise; interface datada vs padrões web modernos.

Fontes: [iMDsoft](https://imd-soft.com/), [iMDsoft MetaVision ICU](https://imd-soft.com/metavision/icu/), [IntuitionLabs](https://intuitionlabs.ai/software/intensive-care-critical-care/critical-care-documentation/imdsoft-metavision-icu)

---

### 2.4 Oracle Cerner CriticalCare

**Empresa:** Oracle Health (anteriormente Cerner, adquirida em 2022)
**Presença:** Global, forte nos EUA e Europa
**Foco:** Módulo UTI integrado ao EHR Millennium

**Funcionalidades:** Documentação completa, integração via CareAware, CPOE, scores automatizados, CDS, dashboard UTI, integração FHIR R4.

**Limitações para Brasil:** Custo proibitivo para hospitais públicos; implantação de anos; presença limitada no Brasil.

---

## 3. Concorrentes Indiretos (PEP/EMR Brasileiros)

### 3.1 MV Sistemas — Soul MV

**Empresa:** MV Informática (Recife, PE) — maior empresa de TI em saúde do Brasil
**Presença:** >2.200 instituições. Desde 2011 impulsionando transformação digital de centenas de hospitais.

**Funcionalidades para UTI:** Módulo de internação/leitos, prescrição eletrônica, prontuário eletrônico, painel de indicadores, integração lab/imagem, módulo enfermagem, compatibilidade TISS/SUS.

**Limitações para UTI:** Não especializado em terapia intensiva; sem integração automática com monitores; interface generalista; sem benchmarking; sem voz; mapa de leitos básico.

**Preço:** R$ 500.000-2.000.000+ implantação + mensalidade

Fontes: [MV](https://mv.com.br/solucao/soul-mv-hospitalar), [MV Hospitalar 2025](https://mv.com.br/imprensa/mv-na-hospitalar-2025-lider-na-transformacao-digital-apresenta-o-proximo-nivel-do-uso-de-ia-na-saude)

### 3.2 Tasy (Philips)

**Presença:** >1.800 instituições na América Latina. Primeiro PEP certificado pela SBIS no Brasil.

**Limitações para UTI:** Generalista; interface clássica; alto custo de implantação.

### 3.3 Wareline

**Presença:** >370 instituições em 24 estados. 60+ módulos integrados.

**Limitações para UTI:** Sem módulo UTI especializado; sem integração com dispositivos.

Fontes: [Wareline](https://www.wareline.com.br/)

---

## 4. Matriz Comparativa de Funcionalidades

| Funcionalidade | UTI Manager | EPIMED Monitor | Philips ICCA | MV Soul | Tasy |
|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard UTI com KPIs** | ✅ Tempo real | ✅ Retrospectivo | ✅ | ⚠️ Parcial | ⚠️ Parcial |
| **Mapa de leitos interativo** | ✅ Visual | ❌ | ⚠️ Parcial | ⚠️ Básico | ⚠️ Básico |
| **Entrada por voz + IA** | ✅ Web Speech + Gemini | ❌ | ❌ | ❌ | ❌ |
| **Checklist boas práticas** | ✅ 9 seções, tri-state | ⚠️ Indicadores | ⚠️ Configurável | ⚠️ Enfermagem | ⚠️ Básico |
| **Sinais vitais com alertas** | ✅ Visual | ❌ | ✅ Nativo | ❌ | ❌ |
| **Integração equipamentos** | ❌ | ❌ | ✅ Nativo Philips | ❌ | Via ICCA |
| **Prescrição eletrônica** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Scores (SAPS/APACHE/SOFA)** | ❌ | ✅ Referência | ✅ | ❌ | ❌ |
| **Interoperabilidade HL7/FHIR** | ❌ | ⚠️ Export | ✅ HL7 v2 + FHIR | HL7 v2 | HL7 v2 |
| **Mobile/Tablet** | ✅ Responsive | Web | Desktop | App | Web |
| **Cloud-native** | ✅ Vercel + Supabase | ✅ SaaS | ❌ On-premise | ⚠️ Parcial | ⚠️ Parcial |
| **Preço acessível hosp. público** | ✅ Custo mínimo | ⚠️ Moderado | ❌ | ❌ | ❌ |
| **Benchmarking nacional** | ❌ | ✅ Referência | ❌ | ❌ | ❌ |
| **Dark/Light mode** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Análise SWOT do UTI Manager

### Forças (Strengths)

- **Voice-first com IA generativa:** Único no mercado brasileiro. Reduz 20-40% do tempo de documentação
- **Cloud-native serverless:** Custo de infraestrutura ~R$ 0-200/mês vs R$ 5.000-50.000+ dos concorrentes
- **UI moderna:** Dark/light mode, glassmorphism, design responsivo — UX superior
- **Mapa de leitos em tempo real:** Visualização intuitiva que concorrentes não oferecem
- **Checklist estruturado:** 9 seções tri-state alinhado a protocolos AMIB
- **Custo de adoção mínimo:** Ideal para hospitais públicos — só precisa de Chrome
- **Stack moderna:** Next.js 16, React 19, Supabase — evolução rápida

### Fraquezas (Weaknesses)

- **Sem integração com equipamentos médicos:** Dependência de entrada manual
- **Sem prescrição eletrônica:** Funcionalidade crítica ausente
- **Sem scores de gravidade:** SAPS, APACHE, SOFA não calculados
- **Sem interoperabilidade (HL7/FHIR):** Sistema isolado
- **Sem certificação ANVISA (SaMD):** Barreira para adoção formal
- **Produto novo, equipe pequena:** Risco de sustentabilidade
- **Sem benchmarking:** Não compara indicadores entre UTIs
- **Validação clínica limitada:** Sem estudos publicados

### Oportunidades (Opportunities)

- **Mercado sub-atendido:** Hospitais públicos do Nordeste com pouca informatização
- **RNDS/Decreto 12.560/2025:** Governo exigindo digitalização — 80%+ estados já integrados
- **IA em saúde crescendo:** Ambient AI scribes reduzem charting em 20-40% (ANA California 2025)
- **Modelo SaaS B2G:** Licitações de TI em saúde crescendo
- **Parcerias acadêmicas:** HUSE como hospital-escola → publicações e validação
- **Open-source como estratégia:** Acelera adoção e cria comunidade
- **Integração com EPIMED:** Parceria em vez de competição em benchmarking

### Ameaças (Threats)

- **Concorrentes com recursos:** Philips, Oracle, MV têm equipes e orçamentos massivos
- **Resistência à mudança:** Médicos intensivistas podem resistir novo sistema
- **Regulamentação IA em saúde:** LGPD classifica dados de saúde como sensíveis (Art. 11)
- **Dependência de terceiros:** Supabase, Vercel, Google Gemini — risco de preços/políticas
- **MV expandindo em IA:** MV na Hospitalar 2025 apresentou "próximo nível do uso de IA na Saúde"

---

## 6. Diferenciais Competitivos do UTI Manager

### 6.1 Voice-First com IA Generativa (Diferencial Único)

Nenhum concorrente no mercado brasileiro oferece captura de evolução clínica por voz com extração estruturada via IA generativa.

| Sistema | Modo de entrada de evolução |
|---------|---------------------------|
| EPIMED | Formulários manuais |
| Philips ICCA | Digitação + dados automáticos de dispositivos |
| MV Soul | Digitação em formulários |
| Tasy | Digitação em formulários |
| **UTI Manager** | **Voz → IA extrai dados estruturados** |

**Impacto estimado:** Em UTI com 20 leitos, economia de 3-5 horas/dia em documentação médica.

### 6.2 Cloud-Native com Custo Mínimo

| Aspecto | UTI Manager | Concorrentes |
|---------|-------------|-------------|
| Infraestrutura | Vercel serverless + Supabase | Servidores on-premise |
| Custo infra/mês | ~R$ 0-200 | R$ 5.000-50.000+ |
| Tempo de deploy | Minutos (CI/CD) | Semanas a meses |
| Manutenção | Zero | Equipe TI dedicada |

### 6.3 UI/UX Moderna

Design system contemporâneo (shadcn/ui, Tailwind CSS 4, glassmorphism, dark/light mode) vs interfaces de 10-15 anos dos concorrentes.

### 6.4 Acessibilidade para Hospital Público

Potencialmente o único sistema de gestão de UTI implantável em hospital público sem licitação complexa, investimento inicial ou equipe de TI. Basta um navegador Chrome.

---

## 7. Gaps e Roadmap Sugerido

### Prioridade Alta (bloqueiam adoção)

| Gap | Esforço | Recomendação |
|-----|---------|-------------|
| Scores (SOFA, SAPS 3, APACHE II) | Médio | SOFA primeiro (mais simples, uso diário) |
| Prescrição eletrônica básica | Alto | Começar simplificado (medicamento + dose + via + frequência) |
| Interoperabilidade mínima | Médio | Exportação CSV/JSON → API REST → FHIR R4 |
| Registro ANVISA (SaMD) | Alto | Mapear RDC 657/2022; classificar risco |

### Prioridade Média (aumentam valor)

| Gap | Esforço | Recomendação |
|-----|---------|-------------|
| Balanço hídrico | Médio | Formulário entradas/saídas com totalização |
| Integração EPIMED | Médio | API de exportação no formato EPIMED |
| Relatórios acreditação | Baixo-Médio | Templates com indicadores já coletados |
| PWA / modo offline | Médio | Service Worker com sync |
| Notificações push | Baixo | Web Push API |

### Roadmap Sugerido

| Trimestre | Entregas |
|-----------|---------|
| **Q2 2026** | SOFA score + balanço hídrico + exportação CSV |
| **Q3 2026** | SAPS 3 + APACHE II + prescrição simplificada + PWA offline |
| **Q4 2026** | API REST + integração EPIMED + notificações push |
| **Q1 2027** | FHIR R4 básico + relatórios acreditação + início processo ANVISA |

---

## Fontes

- [EPIMED Solutions](https://www.epimedsolutions.com/en/monitor-icu-system/)
- [EPIMED Monitor — SciELO/RBTI](https://www.scielo.br/j/rbti/a/hGVD6MPzdnbMPSV9YtLFNjb/)
- [EPIMED 15 Years — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11463981/)
- [Philips ICCA](https://www.usa.philips.com/healthcare/product/HCNOCTN332/intellispace-critical-care-and-anesthesia)
- [iMDsoft MetaVision](https://imd-soft.com/metavision/icu/)
- [MV Soul Hospitalar](https://mv.com.br/solucao/soul-mv-hospitalar)
- [MV na Hospitalar 2025](https://mv.com.br/imprensa/mv-na-hospitalar-2025-lider-na-transformacao-digital-apresenta-o-proximo-nivel-do-uso-de-ia-na-saude)
- [Wareline](https://www.wareline.com.br/)
- [Clinical AI Report — Critical Care 2026](https://clinicalaireport.com/specialties/critical-care)
- [AI in Critical Care — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0883944125002497)
- [Voice AI Healthcare Trends 2025](https://spsoft.com/tech-insights/top-voice-ai-healthcare-trends-2025/)

---

*Relatório gerado em 2026-03-12 por Atlas (Business Analyst) — Synkra AIOS*
