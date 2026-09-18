import { DocItem } from '../types';

export const PRESET_DOCUMENTS: DocItem[] = [
  {
    id: 'doc-beneficios-2026',
    title: 'Política Oficial de Benefícios Flexíveis Forma Vale 2026',
    category: 'beneficios',
    description: 'Documento completo com regras do Vale Alimentação, Refeição, Mobilidade, Saúde e Cultura, com teto salarial e enquadramento PAT.',
    updatedAt: '2026-02-15',
    fileType: 'pdf',
    sizeKb: 342,
    tags: ['PAT', 'Vale Refeição', 'Vale Alimentação', 'Flexível', 'RH'],
    isPreset: true,
    content: `
# POLÍTICA CORPORATIVA DE BENEFÍCIOS FLEXÍVEIS FORMA VALE 2026
Data de Vigência: 01 de Janeiro de 2026
Versão: 3.2 | Departamento de Pessoas & Cultura

## 1. OBJETIVO E DIRETRIZES
A presente política define os critérios para concessão e utilização dos benefícios corporativos geridos através do Cartão Multibenefícios Forma Vale. O programa visa oferecer flexibilidade e autonomia aos colaboradores, mantendo conformidade com a legislação do Programa de Alimentação do Trabalhador (PAT - Lei nº 6.321/76 e Decreto nº 10.854/21).

## 2. CATEGORIAS DE BENEFÍCIOS E SALDOS

### 2.1. Vale Alimentação (VA - Nutrição)
- **Valor Padrão Mensal**: R$ 850,00 por colaborador.
- **Estabelecimentos Aceitos**: Supermercados, hipermercados, hortifrútis, açougues e mercearias credenciadas.
- **Portabilidade**: Permitida transferência mensal de até 30% para a carteira de Vale Refeição.

### 2.2. Vale Refeição (VR - Gastronomia)
- **Valor Padrão Mensal**: R$ 950,00 por colaborador (Cálculo base: 22 dias úteis a R$ 43,18/dia).
- **Estabelecimentos Aceitos**: Restaurantes, lanchonetes, padarias, e apps de delivery parceiros (iFood, Rappi).

### 2.3. Mobilidade & Combustível
- **Valor Padrão Mensal**: R$ 450,00.
- **Uso Aceito**: Postos de combustível, aplicativos de mobilidade (Uber, 99), transporte público e recargas de bilhete único.

### 2.4. Auxílio Home Office & Cultura
- **Valor Padrão Mensal**: R$ 300,00.
- **Uso Aceito**: Pagamento de contas de luz/internet, compra de livros, ingressos de cinema/teatro e cursos online.

## 3. CALENDÁRIO DE RECARGAS
- **Corte de Alterações de Saldo**: Todo dia 20 de cada mês.
- **Efetivação do Crédito**: Primeiro dia útil de cada mês até às 08h00.
- **Taxa de Administração**: 0% para a empresa contratante com cashback corporativo de 1.5% nas recargas pontuais.

## 4. INTEGRAÇÃO VIA API E AUTOMAÇÃO
Para departamentos de RH e ERPs corporativos (TOTVS, Senior, SAP), a liberação de benefícios e consulta de saldo deve ser feita via API REST no endpoint:
\`\`\`http
POST /api/v2/benefits/calculate
Authorization: Bearer <FORMA_VALE_API_KEY>
\`\`\`
`
  },
  {
    id: 'doc-api-spec-v2',
    title: 'Manual Técnico & Especificação da API REST Forma Vale v2.4',
    category: 'api',
    description: 'Documentação técnica de integrações para desenvolvedores, webhooks, geração de tokens e endpoints de processamento de documentos.',
    updatedAt: '2026-03-01',
    fileType: 'md',
    sizeKb: 185,
    tags: ['REST API', 'Webhooks', 'OAuth2', 'Swagger', 'JSON'],
    isPreset: true,
    content: `
# ESPECIFICAÇÃO TÉCNICA - API REST FORMA VALE (v2.4)
Servidor de Produção: \`https://api.formavale.com.br/v2\`
Servidor de Sandbox: \`https://sandbox.formavale.com.br/v2\`

## 1. AUTENTICAÇÃO E SEGURANÇA
Todas as requisições para a API do Forma Vale requerem autenticação via Header HTTP com API Key ou Bearer Token.

\`\`\`http
Authorization: Bearer fv_live_9a8b7c6d5e4f3a2b1c0d
Content-Type: application/json
\`\`\`

## 2. ENDPOINTS PRINCIPAIS

### 2.1. Cálculo e Distribuição de Benefícios
\`\`\`http
POST /api/v2/benefits/calculate
\`\`\`
**Payload de Exemplo:**
\`\`\`json
{
  "empresaCnpj": "12.345.678/0001-90",
  "mesReferencia": "2026-04",
  "colaboradores": [
    {
      "cpf": "123.456.789-00",
      "nome": "Ana Silva",
      "diasTrabalhados": 22,
      "categoriaBase": "pleno",
      "alocacaoModalidade": {
        "alimentacaoPercent": 50,
        "refeicaoPercent": 30,
        "mobilidadePercent": 20
      }
    }
  ]
}
\`\`\`

### 2.2. Processamento e Leitura Inteligente de Documentos
\`\`\`http
POST /api/v2/documents/parse
\`\`\`
Utiliza OCR e IA Gemini para extrair itens, valores, comprovantes de pagamento de notas fiscais de reembolso de refeição e abastecimento.

### 2.3. Consulta de Saldo do Cartão
\`\`\`http
GET /api/v2/cards/balance?cpf=123.456.789-00
\`\`\`

## 3. WEBHOOKS E EVENTOS EM TEMPO REAL
Subscreva para receber notificações instantâneas no seu sistema quando ocorrem autorizações ou recargas.
Eventos suportados:
- \`card.authorized\`: Compra efetuada com sucesso.
- \`recharge.completed\`: Benefício creditado.
- \`document.processed\`: Nota fiscal aprovada pelo leitor IA.
`
  },
  {
    id: 'doc-manual-onboarding',
    title: 'Guia de Onboarding & Manual do Novo Colaborador Forma Vale',
    category: 'rh',
    description: 'Guia visual e explicativo para novos funcionários sobre como utilizar o aplicativo Forma Vale, consultar saldos e usar os cartões.',
    updatedAt: '2026-01-10',
    fileType: 'docx',
    sizeKb: 512,
    tags: ['Onboarding', 'App', 'Cartão Virtual', 'Atendimento'],
    isPreset: true,
    content: `
# GUIA DO NOVO COLABORADOR FORMA VALE
Bem-vindo ao futuro da gestão de benefícios inteligentes!

## 1. SEU PRIMEIRO ACESSO
1. Baixe o aplicativo **Forma Vale** na App Store ou Google Play.
2. Digite seu CPF e o código de boas-vindas enviado pelo RH da sua empresa.
3. Ative seu **Cartão Virtual** em menos de 2 minutos para compras online e carteira digital (Apple Pay / Google Wallet).

## 2. VANTAGENS EXCLUSIVAS
- **Bandeira Elo / Visa Flex**: Aceita em mais de 4.5 milhões de estabelecimentos em todo o Brasil.
- **Desconto de até 45% em Farmácias**: Redes Drogasil, Raia, Pague Menos e Drogaria São Paulo.
- **Transferência Instantânea de Saldo**: Troque parte do seu saldo de refeição por alimentação direto no aplicativo.
- **Atendimento 24/7 via WhatsApp**: Tire dúvidas e bloqueie cartões instantaneamente.

## 3. PERGUNTAS FREQUENTES (FAQ)
- **O que fazer em caso de perda do cartão físico?**
  Acesse a aba 'Cartões' no app, clique em 'Bloquear Temporariamente' e solicite a 2ª via sem custo.
- **O saldo expira?**
  Não! Seu saldo acumulado não expira enquanto seu vínculo empregatício estiver ativo.
`
  },
  {
    id: 'doc-relatorio-financeiro',
    title: 'Relatório Executivo de Economia Fiscal & Isenção PAT',
    category: 'financeiro',
    description: 'Estudo demonstrativo sobre a economia com encargos trabalhistas (INSS e FGTS) ao adotar os benefícios Forma Vale com incentivo PAT.',
    updatedAt: '2026-02-28',
    fileType: 'txt',
    sizeKb: 120,
    tags: ['Fiscal', 'Economia', 'INSS', 'PAT', 'Contabilidade'],
    isPreset: true,
    content: `
RELATÓRIO DE IMPACTO FINANCEIRO E ECONOMIA FISCAL - FORMA VALE

1. RESUMO EXECUTIVO
Ao migrar o pagamento de adicionais em dinheiro para o programa de benefícios regulamentado Forma Vale PAT:
- Isenção total de encargos sociais (INSS ~20% e FGTS 8%) sobre os valores concedidos em vale alimentação e refeição.
- Dribles de contingência trabalhista, garantindo que o benefício não incorpore ao salário (Art. 457 da CLT).
- Dedução de até 4% no Imposto de Renda Pessoa Jurídica (IRPJ) para empresas no regime do Lucro Real.

2. SIMULAÇÃO DE ECONOMIA ANUAL (Empresa com 100 Colaboradores)
- Benefício Alimentação/Refeição médio por pessoa: R$ 1.200,00/mês
- Custo Total Anual em Benefícios: R$ 1.440.000,00
- Economia direta em Encargos Sociais (28.8%): R$ 414.720,00 / ano
- Cashback Corporativo Forma Vale (1.5%): R$ 21.600,00 / ano
- Economia Total Anual Estimada: R$ 436.320,00
`
  }
];
