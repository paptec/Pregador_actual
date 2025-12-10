import { GoogleGenAI, Type } from "@google/genai";
import { Sermon, SermonFormData, SuggestedTheme, Devotional, ServiceProgram } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models configuration
// Using Gemini 3.0 Pro for complex reasoning (Sermons, Themes)
const COMPLEX_MODEL = "gemini-3-pro-preview";
// Using Gemini 2.5 Flash for fast retrieval (Bible Text, Definitions)
const FAST_MODEL = "gemini-2.5-flash";

const SERMON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Um título cativante para a pregação" },
    keyVerse: { type: Type.STRING, description: "O texto do versículo chave (Versão Almeida Corrigida)" },
    keyVerseReference: { type: Type.STRING, description: "A referência do versículo (ex: João 3:16)" },
    introduction: { type: Type.STRING, description: "Introdução contendo: Abertura/Quebra-gelo, Contextualização, Tema/Tese e Relevância." },
    points: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título do ponto da pregação" },
          description: { type: Type.STRING, description: "Desenvolvimento contendo: Explicação, Ilustração e Aplicação (usando 'Nós')." },
          scriptureReference: { type: Type.STRING, description: "Versículos de apoio de OUTROS livros da Bíblia (Referências Cruzadas) que confirmam este ponto." }
        },
        required: ["title", "description", "scriptureReference"]
      }
    },
    conclusion: { type: Type.STRING, description: "Conclusão contendo: Recapitulação, Apelo/Desafio (usando 'Nós') e Fechamento Inspirador." }
  },
  required: ["title", "keyVerse", "keyVerseReference", "introduction", "points", "conclusion"]
};

const THEMES_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Título do tema sugerido" },
      reference: { type: Type.STRING, description: "Referência bíblica principal (ex: Salmos 23:1)" },
      context: { type: Type.STRING, description: "Breve explicação do porquê este tema é relevante" }
    },
    required: ["title", "reference", "context"]
  }
};

const DEVOTIONAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    readingPlan: { type: Type.STRING, description: "A referência completa usada (ex: Efésios 4:1-10)" },
    keyVerse: { type: Type.STRING, description: "Um versículo chave para memorizar dentro do texto" },
    meditation: { type: Type.STRING, description: "Uma reflexão profunda de 3 parágrafos sobre o texto" },
    prayer: { type: Type.STRING, description: "Uma oração guiada baseada no texto" },
    actionStep: { type: Type.STRING, description: "Um pequeno desafio prático para viver a palavra hoje" }
  },
  required: ["readingPlan", "keyVerse", "meditation", "prayer", "actionStep"]
};

const SERVICE_PROGRAM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Nome do Culto (Ex: Culto de Celebração)" },
    theme: { type: Type.STRING, description: "Tema do culto" },
    date: { type: Type.STRING, description: "Data sugestiva" },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Horário ou duração (Ex: 10:00 ou 15 min)" },
          activity: { type: Type.STRING, description: "Nome da atividade (Louvor, Palavra, Ofertório)" },
          description: { type: Type.STRING, description: "Detalhes do que fazer neste momento" },
          responsible: { type: Type.STRING, description: "Sugestão de quem dirige (Ministro, Pastor, Grupo de Louvor)" }
        },
        required: ["time", "activity", "description"]
      }
    }
  },
  required: ["title", "theme", "items"]
};

export const generateSermon = async (data: SermonFormData): Promise<Omit<Sermon, 'id' | 'createdAt' | 'theme'>> => {
  const prompt = `
    Atue como um teólogo experiente e pastor sábio pentecostal. Crie um esboço de pregação completo seguindo RIGOROSAMENTE a estrutura homilética abaixo.
    
    Tema/Assunto: ${data.topic}
    ${data.reference ? `Base Bíblica Principal: ${data.reference}` : ''}
    Público-alvo: ${data.audience}
    Estilo da Pregação: ${data.tone}
    
    ESTRUTURA OBRIGATÓRIA (Siga isto no conteúdo gerado):
    
    1. INTRODUÇÃO (Escreva um texto fluido cobrindo estes 4 elementos):
       a) Abertura/Quebra-gelo: Algo para captar a atenção.
       b) Contextualização: Onde estamos no texto/história.
       c) Tema e Tese: O que será pregado.
       d) Relevância: Por que ouvir isso hoje?
       
    2. DESENVOLVIMENTO (Gere pontos principais, onde CADA PONTO deve conter):
       a) Explicação/Exegese: O que o texto diz originalmente.
       b) Referências Cruzadas: Cite versículos de OUTROS livros da Bíblia que confirmam este ponto (A Bíblia explica a Bíblia).
       c) Ilustração: Um exemplo ou metáfora.
       d) Aplicação (IMPORTANTE): Como viver isso na prática.
       
    3. CONCLUSÃO (Escreva um texto fluido cobrindo estes 3 elementos):
       a) Recapitulação: Resumo breve dos pontos.
       b) Apelo/Desafio: Chamada à mudança.
       c) Fechamento Inspirador: Frase final marcante.

    Instruções Adicionais IMPORTANTES:
    1. O texto deve ser escrito estritamente em Português de Portugal / Angola (norma culta europeia).
    2. Use EXCLUSIVAMENTE a versão da Bíblia João Ferreira de Almeida Corrigida (ARC).
    3. A linguagem deve ser ungida, inspiradora e teologicamente ortodoxa.
    4. INCLUSÃO DO PREGADOR ("NÓS"): Ao falar com o povo, evite "Vocês devem". Use sempre "Nós devemos", "Nós precisamos", "Em nossas vidas". O pregador deve se incluir na mensagem, mostrando humildade e que a palavra também é para ele.
    5. REFERÊNCIAS EXTERNAS: Enriqueça o sermão citando outros textos bíblicos (Antigo e Novo Testamento) que não sejam o texto base, para dar peso teológico aos argumentos.
    
    Retorne APENAS o JSON conforme o schema definido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: COMPLEX_MODEL, // Using the best model for generation
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SERMON_SCHEMA,
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    } else {
      throw new Error("Não foi possível gerar o conteúdo.");
    }
  } catch (error) {
    console.error("Erro na geração:", error);
    throw error;
  }
};

export const generateBiblicalThemes = async (category: string): Promise<SuggestedTheme[]> => {
  const prompt = `
    Gere 5 sugestões de temas para pregações bíblicas profundas baseadas na categoria ou sentimento: "${category}".
    
    Requisitos:
    1. Baseie-se estritamente na Bíblia Almeida Corrigida (ARC).
    2. Português de Portugal/Angola.
    3. Seja criativo, profundo teologicamente e relevante para a igreja atual.
    
    Retorne uma lista JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: COMPLEX_MODEL, // Using the best model for creativity
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: THEMES_SCHEMA,
        temperature: 0.8,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    } else {
      throw new Error("Não foi possível gerar temas.");
    }
  } catch (error) {
    console.error("Erro ao gerar temas:", error);
    throw error;
  }
};

export const getBibleText = async (reference: string): Promise<string> => {
  const prompt = `
    Forneça o texto bíblico completo para a referência: "${reference}".
    
    Requisitos:
    1. Use EXCLUSIVAMENTE a versão João Ferreira de Almeida Corrigida (ARC).
    2. Português de Portugal/Angola.
    3. Não adicione comentários, apenas o texto com os números dos versículos.
    4. Se a referência for inválida, responda educadamente que não foi encontrada.
  `;

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL, // Fast model for retrieval
      contents: prompt,
    });
    return response.text || "Texto não encontrado.";
  } catch (error) {
    console.error(error);
    return "Erro ao buscar o texto bíblico.";
  }
};

export const getResourceContent = async (query: string): Promise<string> => {
  const prompt = `
    Aja como um Dicionário Bíblico, Teológico, Grego e Hebraico Completo.
    
    Defina o termo ou explique o conceito: "${query}".
    
    Requisitos:
    1. Forneça a etimologia (origem da palavra) se relevante (Hebraico/Grego).
    2. Explique o contexto histórico e cultural.
    3. Forneça referências bíblicas onde o termo aparece.
    4. Use Português de Portugal/Angola.
    5. Seja acadêmico mas acessível a pregadores.
  `;

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL, // Fast model for retrieval
      contents: prompt,
    });
    return response.text || "Conteúdo não encontrado.";
  } catch (error) {
    console.error(error);
    return "Erro ao buscar conteúdo.";
  }
};

export const generateDailyDevotional = async (manualReference?: string): Promise<Devotional> => {
  const prompt = `
    Crie um Guia de Devocional e Leitura Bíblica.
    ${manualReference ? `ATENÇÃO: Baseie o devocional ESPECIFICAMENTE neste texto: "${manualReference}".` : 'O objetivo é sugerir uma leitura para o usuário criar o hábito. Sugira 1 capítulo bíblico variado.'}
    
    Estrutura:
    1. Plano de Leitura: Indique o texto usado.
    2. Versículo Chave: O texto principal desse capítulo.
    3. Meditação: Uma reflexão profunda, consoladora e motivadora sobre o texto (aprox. 200 palavras). Use linguagem inclusiva ("Nós").
    4. Oração: Uma oração curta baseada no texto.
    5. Passo Prático: Uma pequena ação para praticar o ensino hoje.

    Idioma: Português de Portugal/Angola.
    Bíblia: Almeida Corrigida (ARC).
    
    Retorne apenas JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: COMPLEX_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: DEVOTIONAL_SCHEMA,
        temperature: 0.8,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        date: new Date().toLocaleDateString()
      };
    } else {
      throw new Error("Falha ao gerar devocional.");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateServiceProgram = async (serviceType: string, theme: string, duration: string, customSegments: string): Promise<ServiceProgram> => {
    const prompt = `
      Crie um Programa de Culto / Liturgia detalhado e organizado para uma igreja evangélica/pentecostal.
      
      Tipo de Culto: ${serviceType}
      Tema: ${theme}
      Duração Total: ${duration}
      ${customSegments ? `Segmentos obrigatórios a incluir: ${customSegments}` : ''}
      
      Gere uma lista sequencial de itens (do início ao fim) com horários sugeridos ou duração de cada parte.
      Inclua: Abertura, Louvores (sugira hinos da Harpa ou Corinhos se apropriado), Leitura da Palavra, Ofertório, Pregação, Avisos e Bênção Apostólica.
      
      Idioma: Português de Portugal/Angola.
      
      Retorne JSON.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: COMPLEX_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: SERVICE_PROGRAM_SCHEMA,
          temperature: 0.7,
        },
      });
  
      if (response.text) {
        return JSON.parse(response.text);
      } else {
        throw new Error("Falha ao gerar programa.");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };