# MIRA — Front-end

Este repositório entrega **o Kick-off do front-end do MIRA**: base do projeto, padrão visual premium, rotas e telas navegáveis com mocks, pronto para evoluir com backend e dados reais.

## O que já foi entregue (Kick-off — D0 a D+2 ✅)
Entregáveis previstos no cronograma (Setup/Kick-off): repositório Git, scaffolding, rotas, UI kit base, padrões e homologação/staging (quando aplicável). Critério de aceite: projeto compila/roda; estrutura validada; telas base navegáveis. :contentReference[oaicite:1]{index=1}

Inclui:
- Angular 17+ (standalone)
- Estrutura de pastas (core/shared/features/layouts)
- Rotas públicas/privadas + lazy-loading por feature
- UI Kit base (componentes reutilizáveis)
- Telas navegáveis (mock):
  - Public/Marketing (Home)
  - Login (mock)
  - App: Dashboard, Tarefas, Chat (MIRA), Insights, Settings, 404
- Responsividade (mobile-first) + ajustes de UI (premium)
- i18n com **ngx-translate**:
  - pt-BR, pt-PT, en, es
  - seletor de idioma no público e dentro do app
- Footer público com ícones de redes sociais
- CI/qualidade (quando configurado): lint/format/build

> Fora do escopo do Kick-off: backend, banco, CRUD real, integrações externas, analytics, regras finais de negócio. Tudo isso fica como TODO para os próximos marcos.


## Cronograma (ANEXO II — visão rápida)
- ✅ **Setup / Kick-off (D0 a D+2)** — base do projeto + telas navegáveis + estrutura validada. :contentReference[oaicite:2]{index=2}  
- ⏳ **Marco 1 (D+3 a D+12)** — 1º lote de funcionalidades do Anexo I (ex.: fluxos prioritários com UX/responsivo em staging). :contentReference[oaicite:3]{index=3}  
- ⏳ **Homologação final (D+13 a D+20)** — ajustes finais, refinamentos UX, entrega definitiva e suporte à publicação/validação. :contentReference[oaicite:4]{index=4}  


## Requisitos
- Node **20** (ver `.nvmrc`, se existir)
- npm 10+
- Angular CLI 17+


## Como rodar local
```bash
npm install
npm start
