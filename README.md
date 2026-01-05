# SaaS ClubPiscina

Sistema SaaS multi-tenant para clubes com piscina: controle de entrada, socios, comandas digitais, cardapio e pagamentos.

## Estrutura
- `backend/` API Node.js + Express + Prisma
- `frontend/` React + Vite + Tailwind

## Requisitos
- Node.js 18+
- PostgreSQL (Neon)

## Setup rapido

### Backend
1) Copie o env:
```
cp backend/.env.example backend/.env
```
2) Ajuste `DATABASE_URL`, `JWT_SECRET` e o segredo do webhook.
2) Instale deps:
```
cd backend
npm install
```
3) Prisma:
```
npx prisma generate
npx prisma migrate dev --name init
```
4) Rode:
```
npm run dev
```

### Frontend
1) Instale deps:
```
cd frontend
npm install
```
2) Rode:
```
npm run dev
```

## Multi-tenant
- Todas as entidades possuem `club_id`.
- O `club_id` vem do JWT do usuario.
- Middleware bloqueia clubes com assinatura vencida.

## Fluxo inicial (primeiro uso)
1) Crie o Super Admin:
```
POST /api/auth/bootstrap
{
  "name": "Admin",
  "email": "admin@saas.com",
  "password": "123456"
}
```
2) Crie um plano SaaS:
```
POST /api/saas/plans
```
3) Cadastre um clube (gera admin do clube automaticamente):
```
POST /api/clubs
```
4) Faça login como Admin do Clube e use o painel.

## Portas e acessos
- Login SaaS: `http://localhost:5173/saas/login`
- Login Clube: `http://localhost:5173/club/login`

## Pagamentos
- Pix/cartao via provedor externo (ex: Mercado Pago, Pagar.me, Stripe).
- Webhook libera assinatura automaticamente.
 - Mercado Pago integrado via preapproval (assinatura recorrente).
 - Webhook: `POST /api/webhooks/payments`
 - Para integrar outro provider, ajuste `backend/src/routes/webhooks.js`.

## Cadastro publico de clube
- Landing page cria clube e administrador via `POST /api/public/club-signup`.
- O fluxo abre o checkout do Mercado Pago automaticamente.

## Observacao
Este projeto e uma base profissional pronta para evoluir. Complete as integracoes de pagamento e QR conforme o provedor escolhido.
