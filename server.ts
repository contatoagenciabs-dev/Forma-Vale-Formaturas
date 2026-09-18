import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Serve files from subdata folder statically if requested
  const subdataDir = path.join(process.cwd(), "subdata");
  if (!fs.existsSync(subdataDir)) {
    fs.mkdirSync(subdataDir, { recursive: true });
  }
  app.use("/subdata", express.static(subdataDir));

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

  // 6. Save request, generated PDF proof, and attached contract into subdata folder
  app.post("/api/subdata/salvar-solicitacao", (req, res) => {
    try {
      const { protocol, formData, pdfBase64, contractBase64, contractName } = req.body;

      if (!protocol) {
        return res.status(400).json({ error: "Protocolo é obrigatório." });
      }

      const requestDir = path.join(process.cwd(), "subdata", protocol);
      if (!fs.existsSync(requestDir)) {
        fs.mkdirSync(requestDir, { recursive: true });
      }

      // Save JSON data
      const jsonPath = path.join(requestDir, `solicitacao-${protocol}.json`);
      const payload = {
        protocol,
        savedAt: new Date().toISOString(),
        formData,
        folderPath: `subdata/${protocol}`
      };
      fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf-8");

      // Save generated PDF proof
      if (pdfBase64) {
        const pdfClean = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
        const pdfBuffer = Buffer.from(pdfClean, "base64");
        const proofPath = path.join(requestDir, `comprovante-${protocol}.pdf`);
        fs.writeFileSync(proofPath, pdfBuffer);
      }

      // Save attached contract PDF/file
      let savedContractName = null;
      if (contractBase64) {
        const cleanContractName = (contractName || "contrato-anexado.pdf").replace(/[^a-zA-Z0-9._-]+/g, "-");
        const contractClean = contractBase64.replace(/^data:.*?;base64,/, "");
        const contractBuffer = Buffer.from(contractClean, "base64");
        const contractPath = path.join(requestDir, `contrato-${cleanContractName}`);
        fs.writeFileSync(contractPath, contractBuffer);
        savedContractName = `contrato-${cleanContractName}`;
      }

      console.log(`[subdata] Arquivos gravados com sucesso na pasta: subdata/${protocol}`);

      return res.json({
        success: true,
        protocol,
        message: `Arquivos salvos com sucesso na pasta /subdata/${protocol}`,
        folder: `subdata/${protocol}`,
        files: [
          `solicitacao-${protocol}.json`,
          pdfBase64 ? `comprovante-${protocol}.pdf` : null,
          savedContractName
        ].filter(Boolean)
      });
    } catch (err: any) {
      console.error("Erro ao salvar arquivos em subdata:", err);
      return res.status(500).json({ error: err.message || "Erro interno ao salvar arquivos em subdata." });
    }
  });

  // 7. List subdata folder contents with full URLs and metadata
  app.get("/api/subdata/listar", (req, res) => {
    try {
      const subdataRoot = path.join(process.cwd(), "subdata");
      if (!fs.existsSync(subdataRoot)) {
        return res.json({ items: [] });
      }

      const host = req.get("host") || "localhost:3000";
      const protocolScheme = req.protocol || "https";
      const baseUrl = `${protocolScheme}://${host}`;

      const folders = fs.readdirSync(subdataRoot);
      const items = folders.map(folderName => {
        const folderPath = path.join(subdataRoot, folderName);
        if (fs.statSync(folderPath).isDirectory()) {
          const files = fs.readdirSync(folderPath).map(fileName => {
            const filePath = path.join(folderPath, fileName);
            const stats = fs.statSync(filePath);
            const relativePath = `subdata/${folderName}/${fileName}`;
            return {
              name: fileName,
              path: relativePath,
              url: `${baseUrl}/${relativePath}`,
              sizeBytes: stats.size,
              createdAt: stats.birthtime || stats.mtime
            };
          });

          // Check if json info file exists
          let requestInfo: any = null;
          const jsonFile = files.find(f => f.name.endsWith(".json"));
          if (jsonFile) {
            try {
              const raw = fs.readFileSync(path.join(folderPath, jsonFile.name), "utf-8");
              requestInfo = JSON.parse(raw);
            } catch (e) {
              // ignore parse error
            }
          }

          return {
            protocol: folderName,
            folder: `subdata/${folderName}`,
            folderUrl: `${baseUrl}/subdata/${folderName}`,
            requestInfo: requestInfo?.formData || null,
            files
          };
        }
        return null;
      }).filter(Boolean);

      return res.json({ items });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 8. Dedicated Web Page to browse Subdata Online directly from any browser
  app.get("/subdata-online", (req, res) => {
    const subdataRoot = path.join(process.cwd(), "subdata");
    let folders: string[] = [];
    if (fs.existsSync(subdataRoot)) {
      folders = fs.readdirSync(subdataRoot);
    }

    const host = req.get("host") || "";
    const baseUrl = `${req.protocol}://${host}`;

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Forma Vale · Drive Subdata Online</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f4f7f8; color: #101820; margin: 0; padding: 24px; }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #dae2e8; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f4c5c; padding-bottom: 16px; margin-bottom: 24px; }
        .title { color: #0f4c5c; margin: 0; font-size: 22px; font-weight: 700; }
        .badge { background: #e8f4f6; color: #0f4c5c; padding: 4px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; }
        .folder-card { background: #f8fafb; border: 1px solid #e1e8ed; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .folder-title { font-weight: 700; font-size: 16px; color: #0f4c5c; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
        .file-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .file-btn { display: inline-flex; align-items: center; gap: 6px; background: white; border: 1px solid #0f4c5c; color: #0f4c5c; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .file-btn:hover { background: #0f4c5c; color: white; }
        .empty { text-align: center; padding: 40px; color: #61707d; font-size: 15px; }
        .btn-home { background: #0f4c5c; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1 class="title">📁 Drive Online · Pasta Subdata</h1>
            <p style="margin: 4px 0 0 0; color: #61707d; font-size: 13px;">Repositório online de solicitações, PDFs de contratos e comprovantes</p>
          </div>
          <a href="/" class="btn-home">⬅ Voltar para o App</a>
        </div>
    `;

    if (folders.length === 0) {
      htmlContent += `
        <div class="empty">
          Nenhuma solicitação gravada na pasta <strong>/subdata</strong> até o momento.<br/>
          Envie um formulário na aplicação para visualizar os arquivos online aqui.
        </div>
      `;
    } else {
      folders.forEach(protocol => {
        const folderPath = path.join(subdataRoot, protocol);
        if (fs.statSync(folderPath).isDirectory()) {
          const files = fs.readdirSync(folderPath);
          htmlContent += `
            <div class="folder-card">
              <div class="folder-title">
                <span>📂 Protocolo: ${protocol}</span>
                <span class="badge">${files.length} arquivo(s)</span>
              </div>
              <div class="file-list">
          `;
          files.forEach(file => {
            const fileUrl = `${baseUrl}/subdata/${protocol}/${file}`;
            htmlContent += `
              <a href="${fileUrl}" target="_blank" class="file-btn" download>
                📥 ${file}
              </a>
            `;
          });
          htmlContent += `
              </div>
            </div>
          `;
        }
      });
    }

    htmlContent += `
      </div>
    </body>
    </html>
    `;

    res.send(htmlContent);
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
    const distPath = path.join(process.cwd(), "dist");
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
