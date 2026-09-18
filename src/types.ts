export type PageArchetype = 'portal' | 'landing' | 'guide' | 'technical' | 'dashboard';
export type DesignStyle = 'emerald' | 'indigo' | 'slate' | 'amber';
export type TargetAudience = 'colaboradores' | 'clientes' | 'desenvolvedores' | 'gestores';

export interface DocItem {
  id: string;
  title: string;
  category: 'beneficios' | 'api' | 'rh' | 'financeiro' | 'juridico' | 'custom';
  description: string;
  content: string;
  filename?: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'json';
  updatedAt: string;
  sizeKb: number;
  tags: string[];
  isPreset?: boolean;
}

export interface PageSection {
  id: string;
  type: 'hero' | 'metrics' | 'features' | 'table' | 'cards' | 'faq' | 'cta' | 'code_snippet';
  title: string;
  subtitle?: string;
  content: any; // Flexible section structure
}

export interface GeneratedPage {
  id: string;
  docId?: string;
  docTitle: string;
  pageTitle: string;
  tagline: string;
  archetype: PageArchetype;
  style: DesignStyle;
  audience: TargetAudience;
  sections: PageSection[];
  generatedHtml: string;
  createdAt: string;
  keyInsights: string[];
  suggestedApis: string[];
}

export interface ApiHeader {
  key: string;
  value: string;
  description?: string;
  required?: boolean;
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: any;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'beneficios' | 'documentos' | 'cartoes' | 'webhooks' | 'ai';
  description: string;
  headers: ApiHeader[];
  parameters?: ApiParameter[];
  defaultPayload?: any;
  defaultResponse?: any;
  docReference?: string;
}

export interface ApiTestResult {
  status: number;
  statusText: string;
  timeMs: number;
  headers: Record<string, string>;
  data: any;
  error?: string;
  timestamp: string;
}

export interface WebhookEvent {
  id: string;
  event: string;
  description: string;
  samplePayload: any;
  timestamp?: string;
  status?: 'delivered' | 'pending' | 'failed';
}
