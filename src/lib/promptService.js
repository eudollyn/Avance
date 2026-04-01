export const generateCareerPrompt = (userData) => {
  return `
Atue como um Especialista em Carreira e Estrategista de RH. 
Analise meu perfil e crie um plano de ação detalhado.

DADOS DO USUÁRIO:
- Objetivo: ${userData.goal}
- Cargo Atual: ${userData.currentRole}
- Habilidades Atuais: ${userData.skills}
- Tempo disponível para estudo: ${userData.timePerWeek} horas/semana

SOLICITAÇÃO:
1. Liste as 5 principais competências que me faltam.
2. Crie um cronograma de estudos de 4 semanas.
3. Sugira 3 cargos intermediários para alcançar meu objetivo.

IMPORTANTE: Formate sua resposta começando cada item com ">>>" para que eu possa processar os dados.
  `.trim();
};