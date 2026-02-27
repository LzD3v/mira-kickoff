# MIRA — Kick-off (D0 a D+2)

Este repositório entrega **somente o Kick-off** do front-end do projeto MIRA:
- Setup Angular 17+ (standalone)
- Estrutura de pastas (core/shared/features/layouts)
- Rotas públicas/privadas (guards) + lazy-loading por feature
- UI Kit base (componentes reutilizáveis)
- Ambientes (dev/staging/prod) com placeholders
- Interceptors (token/erro), error handler global
- Placeholders navegáveis (Home/Marketing, Login, Dashboard, Tarefas, Insights, Settings, 404)
- Staging pronto (build config + deploy no Vercel)
- CI (GitHub Actions: lint/format/build staging)

> Fora do escopo: backend, banco, módulos completos (CRUD real, integrações externas, analytics, etc.). Tudo isso fica como TODO.

---

## Requisitos (recomendado)
- **Node 20** (ver `.nvmrc`)
- npm 10+
- Angular CLI 17+

---

## Como rodar local

```bash
npm install
npm start
Mock login: demo@mira.app / mira123