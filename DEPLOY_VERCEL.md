# 🚀 Deploy do Backend pepIA no Vercel

## 📋 Pré-requisitos
- Conta no GitHub (já tem - repositório: peperaioatual)
- Conta no Vercel (gratuita)

## 🎯 Passo a Passo Completo

### 1️⃣ Preparar o Repositório Git

```powershell
# Adicionar arquivos de configuração do Vercel
git add vercel.json .vercelignore DEPLOY_VERCEL.md

# Commit
git commit -m "Configurar backend para deploy no Vercel"

# Push para GitHub
git push origin main
```

### 2️⃣ Criar Conta no Vercel

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Autorize o Vercel a acessar seus repositórios
4. ✅ Conta criada!

### 3️⃣ Importar Projeto no Vercel

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Procure pelo repositório: **peperaioatual**
3. Clique em **"Import"**

### 4️⃣ Configurar Variáveis de Ambiente

Na tela de configuração do projeto:

1. Expanda **"Environment Variables"**
2. Adicione as 3 variáveis (copie os valores do arquivo `.env` na raiz do projeto):

| Name | Value |
|------|-------|
| `SUPABASE_URL` | Copie do `.env` → `SUPABASE_URL` |
| `SUPABASE_SERVICE_KEY` | Copie do `.env` → `SUPABASE_SERVICE_KEY` |
| `OPENAI_KEY` | Copie do `.env` → `OPENAI_KEY` |

**💡 Dica:** Abra o arquivo `.env` na raiz do projeto e copie os valores.

3. Clique em **"Deploy"**

### 5️⃣ Aguardar Deploy

- ⏱️ Tempo estimado: **1-2 minutos**
- ✅ Você verá: "Your project has been deployed"
- 🔗 URL do backend: `https://peperaioatual.vercel.app` (ou similar)

### 6️⃣ Testar o Backend

Após o deploy, teste a API:

```powershell
# Testar se está funcionando (substitua pela sua URL)
curl https://peperaioatual.vercel.app/api/pepia -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"userId":"test","messages":[{"role":"user","content":"olá"}]}'
```

### 7️⃣ Atualizar Frontend

Após obter a URL do Vercel, atualize o arquivo de configuração:

```powershell
# A URL será algo como: https://peperaioatual.vercel.app
# ou: https://seu-projeto-xyz.vercel.app
```

O arquivo `src/config/api.ts` já está configurado para usar a URL correta em produção!

Só precisa atualizar para:

```typescript
export const PEPIA_API_URL = import.meta.env.PROD 
  ? 'https://SUA-URL-DO-VERCEL.vercel.app'  // ← Coloque a URL aqui
  : 'http://localhost:3001';
```

### 8️⃣ Rebuild e Redeploy Frontend

```powershell
# Rebuild do frontend com a nova URL
npm run build

# Redeploy no Firebase Hosting
firebase deploy --only hosting
```

## ✅ Pronto!

Agora seu sistema está funcionando:
- 🌐 **Frontend:** Firebase Hosting (https://peperaio-3cf48.web.app)
- 🔧 **Backend:** Vercel (https://seu-projeto.vercel.app)
- 💾 **Banco:** Supabase (PostgreSQL)

## 🔄 Deploys Futuros

Quando fizer mudanças no backend:

```powershell
git add .
git commit -m "Atualizar backend"
git push
```

O Vercel detecta automaticamente e faz o deploy! 🚀

## 🐛 Troubleshooting

### Ver logs do Vercel:
1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Aba **"Deployments"**
4. Clique no deployment mais recente
5. Veja os logs em tempo real

### Testar localmente antes de deployar:
```powershell
node pepia-proxy.js
```

### Variáveis de ambiente não carregadas:
- Verifique se adicionou as 3 variáveis no dashboard do Vercel
- Aguarde alguns minutos e tente novamente
- Ou faça um novo deploy: **"Deployments"** → **"..."** → **"Redeploy"**
