import React, { useState } from 'react';
import { 
  Webhook, 
  Send, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Copy, 
  Check, 
  RotateCcw, 
  Terminal, 
  AlertCircle
} from 'lucide-react';
import { WebhookEvent } from '../types';
import { SAMPLE_WEBHOOKS } from '../data/apiEndpoints';

export const WebhookPlayground: React.FC = () => {
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEvent>(SAMPLE_WEBHOOKS[0]);
  const [customPayload, setCustomPayload] = useState<string>(
    JSON.stringify(SAMPLE_WEBHOOKS[0].samplePayload, null, 2)
  );
  const [webhookUrl, setWebhookUrl] = useState<string>('https://seu-sistema-rh.empresa.com.br/webhooks/formavale');
  const [logs, setLogs] = useState<WebhookEvent[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleSelectWebhook = (wh: WebhookEvent) => {
    setSelectedWebhook(wh);
    setCustomPayload(JSON.stringify(wh.samplePayload, null, 2));
  };

  const handleTriggerWebhook = () => {
    setIsSending(true);

    setTimeout(() => {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(customPayload);
      } catch {
        parsedPayload = { error: "Payload malformado" };
      }

      const newLog: WebhookEvent = {
        id: `wh-evt-${Date.now()}`,
        event: selectedWebhook.event,
        description: selectedWebhook.description,
        samplePayload: parsedPayload,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        status: 'delivered'
      };

      setLogs(prev => [newLog, ...prev]);
      setIsSending(false);
    }, 600);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Webhook className="w-3.5 h-3.5" /> Real-time Webhook Playground
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Central de Webhooks & Notificações de Eventos
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Simule o envio de eventos de compra no cartão, recarga de benefícios e aprovação de notas fiscais diretamente para a URL do seu sistema de RH ou ERP.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Event Types (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Eventos Suportados
            </h3>

            <div className="space-y-2">
              {SAMPLE_WEBHOOKS.map((wh) => {
                const isSelected = selectedWebhook.id === wh.id;
                return (
                  <button
                    key={wh.id}
                    onClick={() => handleSelectWebhook(wh)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-mono text-emerald-400 font-bold">{wh.event}</span>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{wh.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Simulator & Logs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Simulator Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">URL de Destino do seu Webhook:</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Payload do Evento ({selectedWebhook.event}):</label>
                <button
                  onClick={() => setCustomPayload(JSON.stringify(selectedWebhook.samplePayload, null, 2))}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar Payload
                </button>
              </div>
              <textarea
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleTriggerWebhook}
              disabled={isSending}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>Simular Disparo de Webhook Agora</span>
            </button>
          </div>

          {/* Execution Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Histórico de Disparos em Tempo Real
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                {logs.length} Notificações
              </span>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="font-mono font-bold text-white">{log.event}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded font-semibold border border-emerald-500/20">
                          DELIVERED 200 OK
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg overflow-x-auto">
                      {JSON.stringify(log.samplePayload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800/60">
                Nenhum webhook disparado nesta sessão. Clique no botão acima para testar.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
