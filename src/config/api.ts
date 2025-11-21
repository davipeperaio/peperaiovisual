// Configuração da API do pepIA
// IMPORTANTE: Após o deploy no Vercel, atualize a URL abaixo com a URL do seu projeto
// Exemplo: 'https://peperaioatual.vercel.app' ou 'https://seu-projeto-xyz.vercel.app'
export const PEPIA_API_URL = import.meta.env.PROD 
  ? 'https://peperaioatual.vercel.app'  // ← ATUALIZE com sua URL do Vercel após o deploy
  : 'http://localhost:3001';

export const PEPIA_ENDPOINTS = {
  chat: `${PEPIA_API_URL}/api/pepia`,
  gerarEscopo: `${PEPIA_API_URL}/api/pepia/gerar-escopo`,
};
