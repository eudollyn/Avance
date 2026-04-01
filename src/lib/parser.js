export const parseChatGPTResponse = (text) => {
  // Procura por padrões como "1. Habilidade", "- Habilidade" ou ">>> Habilidade"
  const skillsRegex = /(?:>>>|[\d].|-)\s*([^\n:]+)/g;
  const matches = [...text.matchAll(skillsRegex)];
  
  // Limpa e extrai apenas o texto útil
  const skillsFound = matches.map(match => match[1].trim()).slice(0, 10);

  return {
    updatedAt: new Date(),
    skillsToLearn: skillsFound,
    rawResponse: text // Guardamos o original por segurança
  };
};