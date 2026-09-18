import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Check, 
  Copy, 
  RotateCcw, 
  Code2, 
  Zap, 
  ShieldCheck, 
  Server, 
  Clock, 
  HelpCircle,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { ApiEndpoint, ApiTestResult } from '../types';
import { API_ENDPOINTS } from '../data/apiEndpoints';

interface ApiHubProps {
  initialEndpointPath?: string;
}

export const ApiHub: React.FC<ApiHubProps> = ({ initialEndpointPath }) => {
  // Find initial endpoint or default to first
  const defaultEp = API_ENDPOINTS.find(e => e.path === initialEndpointPath) || API_ENDPOINTS[0];
  
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(defaultEp);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  
  // Request State
  const [requestHeaders, setRequestHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer fv_live_9a8b7c6d5e4f3a2b1c0d'
  });
  
  const [jsonPayload, setJsonPayload] = useState<string>(
    JSON.stringify(defaultEp.defaultPayload, null, 2)
  );
  
  // Execution State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'js' | 'python' | 'node'>('js');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Switch Selected Endpoint
  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setJsonPayload(JSON.stringify(ep.defaultPayload, null, 2));
    setTestResult(null);
  };

  // Execute Live API Request
  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      let parsedBody = null;
      if (selectedEndpoint.method !== 'GET' && jsonPayload.trim()) {
        parsedBody = JSON.parse(jsonPayload);
      }

      const response = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers: requestHeaders,
        body: parsedBody ? JSON.stringify(parsedBody) : undefined
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const responseData = await response.json().catch(() => ({ message: "Sem corpo de resposta JSON" }));

      // Extract response headers
      const resHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      setTestResult({
        status: response.status,
        statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
        timeMs: duration,
        headers: resHeaders,
        data: responseData,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
    } catch (err: any) {
      const endTime = performance.now();
      setTestResult({
        status: 500,
        statusText: 'Network / Client Error',
        timeMs: Math.round(endTime - startTime),
        headers: {},
        data: { error: err.message || "Erro ao conectar com o servidor da API" },
        error: err.message,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Filtered Endpoints
  const filteredEndpoints = selectedCategory === 'todos'
    ? API_ENDPOINTS
    : API_ENDPOINTS.filter(e => e.category === selectedCategory);

  // Code Snippet Generators
  const getCurlSnippet = () => {
    return `curl -X ${selectedEndpoint.method} "https://api.formavale.com.br/v2${selectedEndpoint.path}" \\
  -H "Authorization: ${requestHeaders['Authorization'] || 'Bearer YOUR_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonPayload.replace(/\n/g, '')}'`;
  };

  const getJsSnippet = () => {
    return `// Exemplo de integração JavaScript / Fetch
const response = await fetch('https://api.formavale.com.br/v2${selectedEndpoint.path}', {
  method: '${selectedEndpoint.method}',
  headers: {
    'Authorization': '${requestHeaders['Authorization'] || 'Bearer YOUR_TOKEN'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${jsonPayload})
});

const data = await response.json();
console.log('Resposta Forma Vale:', data);`;
  };

  const getPythonSnippet = () => {
    return `# Exemplo de integração Python
import requests

url = "https://api.formavale.com.br/v2${selectedEndpoint.path}"
headers = {
    "Authorization": "${requestHeaders['Authorization'] || 'Bearer YOUR_TOKEN'}",
    "Content-Type": "application/json"
}
payload = ${jsonPayload}

response = requests.request("${selectedEndpoint.method}", url, headers=headers, json=payload)
print(response.json())`;
  };

  const getNodeSnippet = () => {
    return `// Exemplo Node.js (Axios)
import axios from 'axios';

const { data } = await axios.${selectedEndpoint.method.toLowerCase()}('https://api.formavale.com.br/v2${selectedEndpoint.path}', ${jsonPayload}, {
  headers: {
    'Authorization': '${requestHeaders['Authorization'] || 'Bearer YOUR_TOKEN'}'
  }
});

console.log(data);`;
  };

  const getActiveCodeSnippet = () => {
    switch (activeCodeTab) {
      case 'curl': return getCurlSnippet();
      case 'js': return getJsSnippet();
      case 'python': return getPythonSnippet();
      case 'node': return getNodeSnippet();
      default: return getJsSnippet();
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getActiveCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Terminal className="w-3.5 h-3.5" /> API Integration Hub & Live Sandbox v2.4
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Central de APIs & Testador de Requisições Forma Vale
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Execute requisições reais para os endpoints de <strong>Cálculo de Benefícios</strong>, <strong>Processamento de Documentos</strong> e <strong>Consulta de Cartões</strong>. Visualize payloads, tempos de resposta e código pronto em Node.js, Python e cURL.
          </p>
        </div>
      </div>

      {/* Main Grid: API Navigation Sidebar & Live Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Endpoints Catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" /> Catalog da API
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {API_ENDPOINTS.length} Endpoints
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'beneficios', label: 'Benefícios' },
                { id: 'documentos', label: 'Documentos' },
                { id: 'cartoes', label: 'Cartões' },
                { id: 'ai', label: 'AI Engine' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Endpoints List */}
            <div className="space-y-2">
              {filteredEndpoints.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {ep.path}
                      </span>
                    </div>

                    <div className="font-bold text-white line-clamp-1">
                      {ep.name}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {ep.description}
                    </p>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Area: Interactive Request Playground (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
            
            {/* Selected Endpoint Banner & Method Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Playground Ativo
                </span>
                <span className="text-[11px] text-slate-400">
                  Base URL: <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">http://0.0.0.0:3000</code>
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${
                  selectedEndpoint.method === 'GET' ? 'bg-blue-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <input
                  type="text"
                  readOnly
                  value={selectedEndpoint.path}
                  className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                />
                <button
                  onClick={handleExecuteRequest}
                  disabled={isExecuting}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shrink-0 transition ${
                    isExecuting
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  {isExecuting ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-950 rounded-full animate-spin"></div>
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isExecuting ? 'Enviando...' : 'Enviar Requisição'}</span>
                </button>
              </div>
            </div>

            {/* Request Payload Editor */}
            {selectedEndpoint.method !== 'GET' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Corpo da Requisição (JSON Payload):
                  </label>
                  <button
                    onClick={() => setJsonPayload(JSON.stringify(selectedEndpoint.defaultPayload, null, 2))}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Redefinir Exemplo
                  </button>
                </div>
                <textarea
                  value={jsonPayload}
                  onChange={(e) => setJsonPayload(e.target.value)}
                  rows={9}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500/60 resize-y"
                />
              </div>
            )}

            {/* Response Area */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" /> Resposta da API
                </h3>
                {testResult && (
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-bold font-mono ${
                      testResult.status < 300 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
                    }`}>
                      Status: {testResult.status} {testResult.statusText}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {testResult.timeMs} ms
                    </span>
                  </div>
                )}
              </div>

              {testResult ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden space-y-3">
                  <pre className="text-xs font-mono text-slate-200 overflow-x-auto max-h-80 leading-relaxed">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-8 text-center text-slate-500 text-xs space-y-2">
                  <Terminal className="w-8 h-8 text-slate-700 mx-auto" />
                  <p>Clique em <strong>"Enviar Requisição"</strong> para executar a API contra o servidor de desenvolvimento.</p>
                </div>
              )}
            </div>

            {/* Code Snippet Generator Tabs */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" /> Gerador de Código de Integração
                </label>
                <button
                  onClick={handleCopySnippet}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copiado!' : 'Copiar Snippet'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {[
                  { id: 'js', label: 'JavaScript / Fetch' },
                  { id: 'node', label: 'Node.js (Axios)' },
                  { id: 'python', label: 'Python (requests)' },
                  { id: 'curl', label: 'cURL Command' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveCodeTab(lang.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      activeCodeTab === lang.id
                        ? 'bg-slate-800 text-emerald-400 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
                {getActiveCodeSnippet()}
              </pre>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
