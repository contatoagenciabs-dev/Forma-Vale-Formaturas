import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Helper for Lazy Gemini AI initialization
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        aiClient = new GoogleGenAI({ apiKey });
      }
    }
    return aiClient;
  }

  // --- API ROUTES ---

  // 1. Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "Forma Vale Platform",
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY")
    });
  });

  // 2. Generate Web Page from Document using Gemini AI
  app.post("/api/generate-page", async (req, res) => {
    try {
      const { documentText, archetype = "portal", style = "emerald", audience = "colaboradores" } = req.body;

      if (!documentText || typeof documentText !== "string") {
        return res.status(400).json({ error: "O texto do documento é obrigatório." });
      }

      const gemini = getGeminiClient();

      let pageData: any = null;

      if (gemini) {
        try {
          const prompt = `Você é um Engenheiro de UX e Desenvolvedor Fullstack especialista da plataforma Forma Vale.
Sua missão é analisar o documento a seguir e transformá-lo em uma página Web moderna, atraente e funcional em formato JSON.

INFORMAÇÕES DE CONTEXTO:
- Arquétipo de Página: ${archetype} (portal, landing, guide, technical, ou dashboard)
- Estilo Visual: ${style} (emerald, indigo, slate, ou amber)
- Público Alvo: ${audience} (colaboradores, clientes, desenvolvedores, ou gestores)

TEXTO DO DOCUMENTO FORMA VALE:
"""
${documentText.slice(0, 8000)}
"""

Responda ESTRITAMENTE em formato JSON válido com a seguinte estrutura sem marcações de código markdown extras fora do JSON:
{
  "pageTitle": "Título impactante para a página web",
  "tagline": "Subtítulo explicativo e moderno",
  "keyInsights": ["Insight principal 1", "Insight principal 2", "Insight principal 3"],
  "suggestedApis": ["/api/v2/benefits/calculate", "/api/v2/documents/parse"],
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "title": "Título Principal da Seção Hero",
      "subtitle": "Descrição clara dos benefícios e propostas de valor contidas no documento.",
      "content": {
        "ctaPrimary": "Acessar Portal",
        "ctaSecondary": "Ver Regras & APIs",
        "badgeText": "Forma Vale 2026"
      }
    },
    {
      "id": "metrics-1",
      "type": "metrics",
      "title": "Números e Destaques em Evidência",
      "content": [
        {"label": "Vale Alimentação", "value": "R$ 850,00", "description": "Mensal garantido"},
        {"label": "Vale Refeição", "value": "R$ 950,00", "description": "22 dias úteis"},
        {"label": "Economia PAT", "value": "Zero Taxa", "description": "Isenção fiscal total"}
      ]
    },
    {
      "id": "features-1",
      "type": "features",
      "title": "Principais Regras e Diretrizes do Documento",
      "subtitle": "Principais pontos extraídos automaticamente pelo leitor inteligente de documentos",
      "content": [
        {"title": "Flexibilidade Multibenefícios", "description": "Livre escolha entre alimentação, refeição e mobilidade."},
        {"title": "Incentivo Fiscal PAT", "description": "Zero encargos trabalhistas de INSS e FGTS sobre benefícios."},
        {"title": "Cartão Virtual Instantâneo", "description": "Ativação no app para uso em carteiras virtuais."}
      ]
    },
    {
      "id": "table-1",
      "type": "table",
      "title": "Tabela Demonstrativa Extraída",
      "subtitle": "Valores e faixas de benefícios",
      "content": {
        "headers": ["Categoria", "Valor Base", "Regra de Uso", "Integração API"],
        "rows": [
          ["Alimentação (VA)", "R$ 850,00", "Mercados & Hortifrúti", "Automática"],
          ["Refeição (VR)", "R$ 950,00", "Restaurantes & Delivery", "Automática"],
          ["Mobilidade", "R$ 450,00", "Postos & Aplicativos", "Sob Demanda"]
        ]
      }
    },
    {
      "id": "faq-1",
      "type": "faq",
      "title": "Perguntas Frequentes do Documento",
      "content": [
        {"question": "Quando é efetuada a recarga?", "answer": "As recargas ocorrem no primeiro dia útil de cada mês até às 08h."},
        {"question": "Como integrar com o sistema da minha empresa?", "answer": "Utilize nossa API REST no endpoint /api/v2/benefits/calculate."}
      ]
    },
    {
      "id": "cta-1",
      "type": "cta",
      "title": "Pronto para ativar esta política na sua empresa?",
      "subtitle": "Integre os documentos e conecte suas APIs corporativas com a Forma Vale.",
      "content": {
        "buttonText": "Testar Integração de API Agora",
        "link": "#api-playground"
      }
    }
  ],
  "generatedHtml": "<div class='p-8 bg-slate-900 text-white rounded-2xl'><h1>Página Gerada</h1></div>"
}`;

          const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            pageData = parsed;
          }
        } catch (geminiError) {
          console.warn("Gemini API direct generation failed or timed out, using fallback parser:", geminiError);
        }
      }

      // Fallback parser if Gemini key is absent or failed
      if (!pageData) {
        const lines = documentText.split("\n").map(l => l.trim()).filter(Boolean);
        const titleCandidate = lines.find(l => l.startsWith("#") || l.startsWith("POLÍTICA") || l.startsWith("RELATÓRIO") || l.length < 80) || "Página Gerada a partir de Documento Forma Vale";
        const cleanTitle = titleCandidate.replace(/^#+\s*/, '');

        pageData = {
          pageTitle: cleanTitle,
          tagline: `Documento extraído e estruturado para público: ${audience}`,
          keyInsights: [
            "Regras e valores extraídos diretamente do documento original.",
            "Pronto para consulta rápida e disponibilização aos colaboradores.",
            "Estruturado com suporte total a integração de APIs Forma Vale."
          ],
          suggestedApis: ["/api/v2/benefits/calculate", "/api/v2/documents/parse", "/api/v2/cards/balance"],
          sections: [
            {
              id: "hero-1",
              type: "hero",
              title: cleanTitle,
              subtitle: lines.slice(1, 4).join(" ") || "Documento oficial processado pela plataforma Forma Vale para geração de portal de serviços e integração de sistemas.",
              content: {
                ctaPrimary: "Acessar Portal do Beneficiário",
                ctaSecondary: "Testar APIs no Playground",
                badgeText: "Forma Vale Document AI"
              }
            },
            {
              id: "metrics-1",
              type: "metrics",
              title: "Métricas Extraídas do Documento",
              content: [
                { label: "Linhas Processadas", value: `${lines.length}`, description: "Conteúdo estruturado" },
                { label: "Status da Política", value: "Ativa 2026", description: "Conformidade PAT" },
                { label: "Integração API", value: "Pronta", description: "Endpoints v2.4" }
              ]
            },
            {
              id: "features-1",
              type: "features",
              title: "Seções Principais Identificadas",
              subtitle: "Pontos de atenção destacados na análise do documento",
              content: lines.filter(l => l.length > 20 && !l.startsWith("#")).slice(0, 4).map((line, idx) => ({
                title: `Tópico ${idx + 1}`,
                description: line
              }))
            },
            {
              id: "faq-1",
              type: "faq",
              title: "Dúvidas Frequentes & Diretrizes",
              content: [
                { question: "Como aplicar estas regras na minha empresa?", answer: "Você pode utilizar o endpoint /api/v2/benefits/calculate para importar a folha e disparar o cálculo automaticamente." },
                { question: "Onde consultar os detalhes das APIs?", answer: "Acesse a aba Central de APIs para testar requisições em tempo real com dados de sandbox." }
              ]
            },
            {
              id: "cta-1",
              type: "cta",
              title: "Inicie a integração das APIs Forma Vale agora",
              subtitle: "Conecte seu ERP ou sistema de RH para automatizar a distribuição de benefícios.",
              content: {
                buttonText: "Ir para Central de APIs",
                link: "#api-playground"
              }
            }
          ],
          generatedHtml: ""
        };
      }

      return res.json({
        success: true,
        page: pageData,
        documentProcessedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Erro na geração de página:", err);
      return res.status(500).json({ error: err.message || "Erro interno ao processar documento." });
    }
  });

  // 3. Executable API Route: Calculate Benefits
  app.post("/api/v2/benefits/calculate", (req, res) => {
    const { empresaCnpj, mesReferencia = "2026-04", colaboradores = [] } = req.body;

    let totalAlimentacao = 0;
    let totalRefeicao = 0;
    let totalMobilidade = 0;

    const detalhesColaboradores = colaboradores.map((colab: any) => {
      const dias = colab.diasTrabalhados || 22;
      const baseDiariaVR = 43.18;
      const baseVA = 850.00;
      const baseMob = 450.00;

      const va = Math.round((baseVA * ((colab.alocacaoModalidade?.alimentacaoPercent ?? 50) / 100)) * 100) / 100;
      const vr = Math.round(((dias * baseDiariaVR) * ((colab.alocacaoModalidade?.refeicaoPercent ?? 50) / 100)) * 100) / 100;
      const mob = Math.round((baseMob * ((colab.alocacaoModalidade?.mobilidadePercent ?? 0) / 100)) * 100) / 100;

      totalAlimentacao += va;
      totalRefeicao += vr;
      totalMobilidade += mob;

      return {
        cpf: colab.cpf || "000.000.000-00",
        nome: colab.nome || "Colaborador Forma Vale",
        creditoTotal: Math.round((va + vr + mob) * 100) / 100,
        distribuicao: { va, vr, mobilidade: mob }
      };
    });

    const totalInvestido = Math.round((totalAlimentacao + totalRefeicao + totalMobilidade) * 100) / 100;
    const economiaIsencaoPatEst = Math.round((totalInvestido * 0.288) * 100) / 100;
    const cashbackGerado = Math.round((totalInvestido * 0.015) * 100) / 100;

    res.json({
      status: "sucesso",
      protocolo: `FV-${Date.now()}`,
      empresaCnpj: empresaCnpj || "12.345.678/0001-90",
      mesReferencia,
      resumo: {
        totalColaboradores: colaboradores.length || 1,
        totalAlimentacao,
        totalRefeicao,
        totalMobilidade,
        totalInvestido,
        economiaIsencaoPatEst,
        cashbackGerado
      },
      detalhesColaboradores
    });
  });

  // 4. Executable API Route: Document Parser
  app.post("/api/v2/documents/parse", (req, res) => {
    const { documentText = "", extractType = "receipt" } = req.body;

    res.json({
      status: "processado",
      protocoloId: `DOC-PARSER-${Math.floor(Math.random() * 899999 + 100000)}`,
      confiancaIa: "98.9%",
      tipoDetectado: extractType,
      dadosExtraidos: {
        documentLength: documentText.length,
        estabelecimentoIdentificado: documentText.includes("SHELL") ? "POSTO SHELL MARGINAL LTDA" : "RESTAURANTE PALADARES LTDA",
        cnpjExtraido: "44.333.222/0001-10",
        valorCalculado: 280.00,
        categoriaRecomendada: documentText.toLowerCase().includes("posto") || documentText.toLowerCase().includes("combustível") ? "Mobilidade & Combustível" : "Vale Refeição",
        elegivelEfetivacao: true
      },
      timestamp: new Date().toISOString()
    });
  });

  // 5. Executable API Route: Cards Balance
  app.post("/api/v2/cards/balance", (req, res) => {
    const { cpf = "123.456.789-00" } = req.body;

    res.json({
      status: "ativo",
      cartaoId: `fv_card_${cpf.replace(/\D/g, '').slice(-6) || '883921'}`,
      cpf,
      statusCartao: "Ativo / Desbloqueado",
      saldos: {
        alimentacao: 412.50,
        refeicao: 285.00,
        mobilidade: 140.00,
        homeOffice: 95.00,
        totalGeral: 932.50
      },
      limitesDisponiveis: {
        transferenciaMensalEntreSaldos: 300.00
      },
      dataConsulta: new Date().toISOString()
    });
  });

  // Vite middleware for development / static server for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Forma Vale] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
