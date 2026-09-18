import { ApiEndpoint, WebhookEvent } from '../types';

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'api-benefits-calc',
    name: 'Cálculo de Vales & Benefícios Flexíveis',
    method: 'POST',
    path: '/api/v2/benefits/calculate',
    category: 'beneficios',
    description: 'Calcula proporcionalidade de vales (Alimentação, Refeição, Mobilidade), taxas de encargos zeradas e alocação por categoria de funcionário.',
    headers: [
      { key: 'Authorization', value: 'Bearer fv_live_9a8b7c6d5e4f3a2b1c0d', required: true, description: 'Chave de API Forma Vale' },
      { key: 'Content-Type', value: 'application/json', required: true }
    ],
    parameters: [
      { name: 'empresaCnpj', type: 'string', required: true, description: 'CNPJ da empresa contratante', example: '12.345.678/0001-90' },
      { name: 'mesReferencia', type: 'string', required: true, description: 'Ano e mês em formato YYYY-MM', example: '2026-04' },
      { name: 'diasUteis', type: 'number', required: false, description: 'Quantidade de dias úteis no mês (padrão: 22)', example: 22 },
      { name: 'colaboradores', type: 'array', required: true, description: 'Lista de colaboradores e proporcionalidade' }
    ],
    defaultPayload: {
      empresaCnpj: "12.345.678/0001-90",
      mesReferencia: "2026-04",
      diasUteis: 22,
      colaboradores: [
        {
          cpf: "123.456.789-00",
          nome: "Carlos Eduardo Silva",
          diasTrabalhados: 22,
          cargo: "Desenvolvedor Senior",
          alocacaoModalidade: {
            alimentacaoPercent: 40,
            refeicaoPercent: 40,
            mobilidadePercent: 20
          }
        },
        {
          cpf: "987.654.321-11",
          nome: "Mariana Costa Santos",
          diasTrabalhados: 18,
          cargo: "Analista de RH",
          alocacaoModalidade: {
            alimentacaoPercent: 50,
            refeicaoPercent: 50,
            mobilidadePercent: 0
          }
        }
      ]
    },
    defaultResponse: {
      status: "sucesso",
      resumo: {
        totalColaboradores: 2,
        totalAlimentacao: 1408.00,
        totalRefeição: 1408.00,
        totalMobilidade: 352.00,
        totalInvestido: 3168.00,
        economiaIsencaoPatEst: 912.38,
        cashbackGerado: 47.52
      },
      detalhesColaboradores: [
        {
          cpf: "123.456.789-00",
          nome: "Carlos Eduardo Silva",
          creditoTotal: 1760.00,
          distribuicao: {
            va: 704.00,
            vr: 704.00,
            mobilidade: 352.00
          }
        },
        {
          cpf: "987.654.321-11",
          nome: "Mariana Costa Santos",
          creditoTotal: 1408.00,
          distribuicao: {
            va: 704.00,
            vr: 704.00,
            mobilidade: 0.00
          }
        }
      ]
    }
  },
  {
    id: 'api-doc-parse',
    name: 'Processamento & Extração Inteligente de Documentos',
    method: 'POST',
    path: '/api/v2/documents/parse',
    category: 'documentos',
    description: 'Envia o texto ou imagem de um documento (comprovante de refeição, nota fiscal de combustível, contrato) e recebe estruturação JSON via IA.',
    headers: [
      { key: 'Authorization', value: 'Bearer fv_live_9a8b7c6d5e4f3a2b1c0d', required: true },
      { key: 'Content-Type', value: 'application/json', required: true }
    ],
    parameters: [
      { name: 'documentText', type: 'string', required: true, description: 'Texto bruto extraído do PDF ou comprovante', example: 'RESTAURANTE SABOR REAL LTDA - CNPJ 44.333.222/0001-10 - DATA: 15/03/2026 - VALOR TOTAL: R$ 48,50' },
      { name: 'extractType', type: 'string', required: false, description: 'Tipo de extração: "receipt", "policy", "contract"', example: 'receipt' }
    ],
    defaultPayload: {
      extractType: "receipt",
      documentText: "POSTO SHELL MARGINAL LTDA\nCNPJ: 01.234.567/0001-89\nData: 18/03/2026 14:32\nItem: Gasolina Aditivada 45.2L\nValor Total: R$ 280,00\nForma de Pagamento: Cartão Forma Vale Mobilidade"
    },
    defaultResponse: {
      status: "processado",
      confiancaIa: "98.5%",
      dadosExtraidos: {
        tipoDocumento: "Comprovante de Combustível",
        estabelecimento: "POSTO SHELL MARGINAL LTDA",
        cnpj: "01.234.567/0001-89",
        dataEmissao: "2026-03-18T14:32:00",
        valorTotal: 280.00,
        categoriaIdentificada: "Mobilidade & Combustível",
        elegivelReembolso: true,
        alertasInconsistencia: []
      }
    }
  },
  {
    id: 'api-cards-balance',
    name: 'Consulta de Saldo e Cartão Virtual',
    method: 'POST',
    path: '/api/v2/cards/balance',
    category: 'cartoes',
    description: 'Retorna o saldo acumulado por categoria de benefício e o status atual do cartão do colaborador.',
    headers: [
      { key: 'Authorization', value: 'Bearer fv_live_9a8b7c6d5e4f3a2b1c0d', required: true },
      { key: 'Content-Type', value: 'application/json', required: true }
    ],
    defaultPayload: {
      cpf: "123.456.789-00"
    },
    defaultResponse: {
      status: "ativo",
      cartaoId: "fv_card_8839210492",
      colaborador: "Carlos Eduardo Silva",
      statusCartao: "Ativo / Desbloqueado",
      saldos: {
        alimentacao: 412.50,
        refeicao: 285.00,
        mobilidade: 140.00,
        homeOffice: 95.00,
        totalGeral: 932.50
      },
      ultimasTransacoes: [
        { data: "2026-03-17 12:45", local: "Restaurante Estrela Ltda", valor: 38.50, categoria: "Refeição" },
        { data: "2026-03-16 19:10", local: "Supermercado Pão de Açúcar", valor: 184.20, categoria: "Alimentação" }
      ]
    }
  },
  {
    id: 'api-generate-page',
    name: 'AI Engine - Gerador de Página Web via IA',
    method: 'POST',
    path: '/api/generate-page',
    category: 'ai',
    description: 'Transforma qualquer texto de documento em uma página web completa e estilizada usando o Gemini API server-side.',
    headers: [
      { key: 'Content-Type', value: 'application/json', required: true }
    ],
    defaultPayload: {
      documentText: "POLÍTICA CORPORATIVA DE BENEFÍCIOS FLEXÍVEIS FORMA VALE 2026. Oferecemos R$ 850 de Vale Alimentação e R$ 950 de Vale Refeição com 0% de taxa de administração e cashback de 1.5%.",
      archetype: "portal",
      style: "emerald",
      audience: "colaboradores"
    },
    defaultResponse: {
      success: true,
      page: {
        pageTitle: "Portal de Benefícios Flexíveis Forma Vale 2026",
        tagline: "Transparência, autonomias e vantagens exclusivas no seu dia a dia.",
        keyInsights: [
          "Vale Alimentação de R$ 850/mês",
          "Vale Refeição de R$ 950/mês (22 dias)",
          "Isenção total de encargos fiscais PAT"
        ],
        sectionsCount: 6
      }
    }
  }
];

export const SAMPLE_WEBHOOKS: WebhookEvent[] = [
  {
    id: 'wh-1',
    event: 'card.authorized',
    description: 'Disparado quando uma compra é aprovada no cartão multibenefícios Forma Vale.',
    samplePayload: {
      event: 'card.authorized',
      transactionId: 'tx_998822311',
      cpf: '123.456.789-00',
      valor: 45.00,
      categoria: 'Refeição',
      mcc: '5812',
      estabelecimento: 'RESTAURANTE PALADARES',
      saldoRestanteCategoria: 240.00,
      timestamp: '2026-03-18T12:30:00Z'
    }
  },
  {
    id: 'wh-2',
    event: 'recharge.completed',
    description: 'Notifica quando a empresa efetua o crédito mensal de benefícios.',
    samplePayload: {
      event: 'recharge.completed',
      loteId: 'lt_202604_001',
      empresaCnpj: '12.345.678/0001-90',
      totalColaboradoresBeneficiados: 45,
      valorTotalLote: 78500.00,
      timestamp: '2026-04-01T08:00:00Z'
    }
  },
  {
    id: 'wh-3',
    event: 'document.processed',
    description: 'Enviado assim que a IA conclui a verificação de um comprovante para reembolso.',
    samplePayload: {
      event: 'document.processed',
      documentId: 'doc_554110992',
      status: 'approved',
      valorAprovado: 120.00,
      motivo: 'Comprovante válido e dentro das regras da política de combustível.',
      timestamp: '2026-03-18T14:35:10Z'
    }
  }
];
