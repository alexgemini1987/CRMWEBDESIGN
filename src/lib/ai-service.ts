export const AIService = {
  async generateIdeas(theme: string, audience: string, pillar: string, format: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Aqui estão 3 ideias para ${theme}:\n\n1. O maior mito sobre ${theme} que o público de ${audience} ainda acredita.\n2. Como resolver o problema X em 3 passos simples (Formato: ${format}).\n3. Minha jornada: Como comecei com ${pillar} e o que faria diferente hoje.`);
      }, 1500);
    });
  },

  async createReelScript(theme: string, objective: string, duration: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`**Hook (0-${duration === 'Curto' ? '3s' : '5s'}):**\n"Você está perdendo clientes todo dia por causa desse erro na sua bio..."\n\n**Desenvolvimento:**\nExplique o problema de forma clara focando em ${theme}. Mostre a solução rápida.\n\n**CTA:**\n"Comente 'EU QUERO' que te mando o passo a passo no direct." (${objective})`);
      }, 1500);
    });
  },

  async createCarousel(theme: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`**Slide 1 (Hook):**\nO segredo obscuro sobre ${theme} que ninguém te conta.\n\n**Slide 2:**\nA maioria das pessoas faz assim... (mostrar jeito errado)\n\n**Slide 3:**\nMas isso só gera frustração porque...\n\n**Slide 4:**\nA forma correta é esta (mostrar solução).\n\n**Slide 5 (CTA):**\nSalve este post para não esquecer!`);
      }, 1500);
    });
  },

  async createCaption(theme: string, tone: string, cta: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Essa é uma legenda gerada com tom ${tone} sobre o tema ${theme}.\n\nMuitas vezes esquecemos do básico, mas o básico bem feito é o que traz resultados extraordinários.\n\n${cta}`);
      }, 1000);
    });
  },

  async analyzeIdea(idea: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`**Potencial:** Alto, pois resolve uma dor muito comum.\n**Melhor Formato:** Carrossel (para detalhar os passos) ou Reel (para dicas rápidas).\n**Hook Sugerido:** "Você já tentou de tudo mas ainda sofre com isso?"\n**Estrutura:** Foque no problema -> Mostre que existe solução -> Entregue 1 dica prática -> Faça o CTA.\n**CTA Sugerido:** "Qual dessas dicas você vai aplicar hoje?"`);
      }, 1500);
    });
  }
};
