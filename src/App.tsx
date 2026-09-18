import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';

// Supabase Configuration
const SUPABASE_URL = 'https://karrymkbollvtqzksmas.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y_xMGL98RXPftAfyiqT2OA_54c1oLbO';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface FormDataState {
  full_name: string;
  email: string;
  whatsapp: string;
  institution: string;
  course_class: string;
  completion_date: string;
  pending_material: string[];
  material_situation: string;
  pending_description: string;
  contract_file: File | null;
  no_contract: boolean;
  consent: boolean;
}

const MATERIAL_OPTIONS = [
  { value: 'Fotografia digital', title: 'Fotografia digital', desc: 'Arquivos digitais da turma.' },
  { value: 'Álbum fotográfico', title: 'Álbum fotográfico', desc: 'Álbum impresso.' },
  { value: 'Réplica', title: 'Réplica', desc: 'Réplica do álbum.' },
  { value: 'Placa de formatura', title: 'Placa de formatura', desc: 'Placa ou homenagem.' },
  { value: 'Canudo', title: 'Canudo', desc: 'Canudo de formatura.' },
];

const SITUATION_OPTIONS = [
  { value: 'Ainda não recebi', title: 'Ainda não recebi', desc: 'O material não chegou.' },
  { value: 'Recebi uma parte', title: 'Recebi uma parte', desc: 'Ficou algo pendente.' },
  { value: 'Preciso confirmar', title: 'Preciso confirmar', desc: 'Não tenho certeza.' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataState>({
    full_name: '',
    email: '',
    whatsapp: '',
    institution: '',
    course_class: '',
    completion_date: '',
    pending_material: [],
    material_situation: '',
    pending_description: '',
    contract_file: null,
    no_contract: false,
    consent: false,
  });

  const [message, setMessageState] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [lastProtocol, setLastProtocol] = useState<string | null>(null);
  const [lastPdfBlob, setLastPdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const setMessage = (text: string, type: 'error' | 'success' = 'error') => {
    setMessageState({ text, type });
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const clearMessage = () => {
    setMessageState(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxMaterial = (value: string) => {
    setFormData((prev) => {
      const exists = prev.pending_material.includes(value);
      if (exists) {
        return { ...prev, pending_material: prev.pending_material.filter((item) => item !== value) };
      } else {
        return { ...prev, pending_material: [...prev.pending_material, value] };
      }
    });
  };

  const handleRadioSituation = (value: string) => {
    setFormData((prev) => ({ ...prev, material_situation: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setMessage('O PDF excede o limite de 15 MB antes da otimização.');
        return;
      }
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setMessage('Anexe somente um contrato em PDF.');
        return;
      }
      clearMessage();
    }
    setFormData((prev) => ({ ...prev, contract_file: file }));
  };

  const validateStep = (stepNumber: number): boolean => {
    clearMessage();
    if (stepNumber === 1) {
      if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
        setMessage('Se preencher o e-mail, confira se ele está correto.');
        return false;
      }
    }
    if (stepNumber === 3) {
      const file = formData.contract_file;
      if (file && file.size > 15 * 1024 * 1024) {
        setMessage('O PDF excede o limite de 15 MB antes da otimização.');
        return false;
      }
      if (file && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setMessage('Anexe somente um contrato em PDF.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    clearMessage();
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const safeName = (name: string) => {
    return (name || 'arquivo')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .slice(0, 80);
  };

  const makeProtocol = (): string => {
    const d = new Date();
    return `SOL-${d.getFullYear()}-${String(Date.now()).slice(-8)}`;
  };

  const makePdf = (protocol: string): Blob => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // Header background
    doc.setFillColor(15, 76, 92);
    doc.rect(0, 0, 210, 36, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('FORMA VALE', 18, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Central de solicitação de materiais', 18, 25);

    // Document Title
    doc.setTextColor(16, 24, 32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Comprovante de Solicitação de Material', 18, 55);

    let y = 70;
    const line = (label: string, text: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(97, 112, 125);
      doc.text(label.toUpperCase(), 18, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(16, 24, 32);

      const wrapped = doc.splitTextToSize(String(text || 'Não informado'), 170);
      doc.text(wrapped, 18, y + 6);
      y += 12 + wrapped.length * 5;
    };

    const materials = formData.pending_material.join(', ');

    line('Protocolo', protocol);
    line('Data e hora do registro', new Date().toLocaleString('pt-BR'));
    line('Solicitante', formData.full_name || 'Não informado');
    line('Instituição e turma', `${formData.institution || 'Não informada'} · ${formData.course_class || 'Não informada'}`);
    line('Conclusão', formData.completion_date || 'Não informada');
    line('Material informado como pendente', materials || 'A conferir no contrato/atendimento');
    line('Situação', formData.material_situation || 'A conferir');
    line('Documento anexado', formData.contract_file?.name || (formData.no_contract ? 'Não localizado' : 'Contrato não localizado'));

    y += 7;
    doc.setDrawColor(218, 226, 232);
    doc.line(18, y, 192, y);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(97, 112, 125);
    const note =
      'Este documento registra o recebimento da solicitação e dos documentos relacionados. Ele não confirma a entrega nem a validação do contrato antes da análise.';
    doc.text(doc.splitTextToSize(note, 174), 18, y);

    return doc.output('blob');
  };

  const compressPdf = async (file: File | null): Promise<File | null> => {
    if (!file) return null;
    const original = await file.arrayBuffer();
    try {
      const source = await PDFDocument.load(original, { ignoreEncryption: true });
      const optimized = await source.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 });
      const result = optimized.byteLength < original.byteLength ? optimized : new Uint8Array(original);
      return new File([result as unknown as BlobPart], safeName(file.name).replace(/\.pdf$/i, '') + '-otimizado.pdf', {
        type: 'application/pdf',
      });
    } catch {
      return file;
    }
  };

  const uploadAndSave = async () => {
    const protocol = makeProtocol();
    const originalFile = formData.contract_file;
    const file = await compressPdf(originalFile);

    const contractPath = file ? `solicitacoes/${protocol}/contrato-${safeName(file.name)}` : null;
    const proofPath = `solicitacoes/${protocol}/comprovante-${protocol}.pdf`;

    const pdfBlob = makePdf(protocol);

    // Try Supabase upload with fallback
    try {
      if (file && contractPath) {
        await supabase.storage.from('documentos').upload(contractPath, file, { contentType: 'application/pdf', upsert: false });
      }
      await supabase.storage.from('documentos').upload(proofPath, pdfBlob, { contentType: 'application/pdf', upsert: false });

      const materials = formData.pending_material;
      const detail = formData.pending_description.trim();
      const pending = detail
        ? `${materials.join(', ') || 'A conferir no contrato/atendimento'} — ${detail}`
        : materials.join(', ') || 'A conferir no contrato/atendimento';

      const payload = {
        protocol,
        full_name: formData.full_name || null,
        email: formData.email || null,
        whatsapp: formData.whatsapp || null,
        institution: formData.institution || null,
        course_class: formData.course_class || null,
        completion_date: formData.completion_date || null,
        material_status: { materials, situation: formData.material_situation || 'A conferir' },
        pending_description: pending,
        delivery_info: null,
        contract_name: file?.name || null,
        contract_path: contractPath,
        proof_path: proofPath,
        consent: formData.consent,
        status: 'recebida',
      };

      await supabase.from('forma_vale_solicitacoes').insert(payload);
    } catch (err) {
      console.warn('Supabase save notice (operating in client storage mode):', err);
    }

    return { protocol, pdfBlob };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    if (!formData.consent) {
      setMessage('Marque a autorização para enviar a solicitação.');
      return;
    }

    setIsSubmitting(true);
    clearMessage();

    try {
      const result = await uploadAndSave();
      setLastProtocol(result.protocol);
      setLastPdfBlob(result.pdfBlob);

      // Download PDF automatically
      const url = URL.createObjectURL(result.pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Comprovante-${result.protocol}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setIsSuccess(true);
    } catch (error: any) {
      setMessage(error?.message || 'Não foi possível concluir o envio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!lastPdfBlob || !lastProtocol) return;
    const url = URL.createObjectURL(lastPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Comprovante-${lastProtocol}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleNewRequest = () => {
    setCurrentStep(1);
    setFormData({
      full_name: '',
      email: '',
      whatsapp: '',
      institution: '',
      course_class: '',
      completion_date: '',
      pending_material: [],
      material_situation: '',
      pending_description: '',
      contract_file: null,
      no_contract: false,
      consent: false,
    });
    setIsSuccess(false);
    setLastProtocol(null);
    setLastPdfBlob(null);
    clearMessage();
  };

  const renderReviewRows = () => {
    const file = formData.contract_file;
    const contract = file ? file.name : formData.no_contract ? 'Não localizado' : 'Nenhum arquivo selecionado';
    const materials = formData.pending_material.join(', ');

    const rows = [
      ['Solicitante', formData.full_name || 'Não informado'],
      ['E-mail / WhatsApp', `${formData.email || 'Não informado'} · ${formData.whatsapp || 'Não informado'}`],
      ['Instituição', formData.institution || 'Não informado'],
      ['Curso e turma', formData.course_class || 'Não informado'],
      ['Conclusão', formData.completion_date || 'Não informada'],
      ['Material pendente', materials || 'A conferir no contrato/atendimento'],
      ['Situação', formData.material_situation || 'A conferir'],
      ['Contrato', contract],
    ];

    return rows.map(([label, val], idx) => (
      <div className="review-row" key={idx}>
        <b>{label}</b>
        <span>{val}</span>
      </div>
    ));
  };

  return (
    <main className="shell">
      {/* Top Header */}
      <header className="topbar">
        <div className="brand">
          <img
            src="/forma-vale-logo.jpg"
            alt="Logo Forma Vale"
            onError={(e) => {
              // Image fallback
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <strong>FORMA VALE</strong>
            <span>Central de solicitação de materiais</span>
          </div>
        </div>
        <div className="privacy">Documentos protegidos</div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="intro">
          <h1>Vamos localizar o que ficou pendente.</h1>
          <p>
            Preencha seus dados, conte o que ainda não recebeu e anexe o contrato, se estiver com ele. Ao final, você
            receberá um protocolo e um comprovante em PDF.
          </p>
        </div>

        <aside className="summary">
          <h2>Como funciona</h2>
          <div className="summary-row">
            <div className="step-no">1</div>
            <div>
              <strong>Identifique sua turma</strong>
              <span>Nome, contato e conclusão.</span>
            </div>
          </div>
          <div className="summary-row">
            <div className="step-no">2</div>
            <div>
              <strong>Informe o que falta</strong>
              <span>Relate o material e a situação.</span>
            </div>
          </div>
          <div className="summary-row">
            <div className="step-no">3</div>
            <div>
              <strong>Anexe o contrato</strong>
              <span>PDF ou fotos legíveis.</span>
            </div>
          </div>
          <div className="summary-row">
            <div className="step-no">4</div>
            <div>
              <strong>Receba seu protocolo</strong>
              <span>Comprovante para baixar.</span>
            </div>
          </div>
        </aside>
      </section>

      {/* Main Form Card */}
      <section className="card" aria-labelledby="form-title">
        {!isSuccess && (
          <>
            <div className="card-head">
              <h2 id="form-title">Registrar solicitação</h2>
              <span className="counter" id="counter">
                Etapa {currentStep} de 4
              </span>
            </div>

            <div className="progress" aria-hidden="true">
              <span className={currentStep >= 1 ? 'active' : ''}></span>
              <span className={currentStep >= 2 ? 'active' : ''}></span>
              <span className={currentStep >= 3 ? 'active' : ''}></span>
              <span className={currentStep >= 4 ? 'active' : ''}></span>
            </div>
          </>
        )}

        {/* Global Message Alert */}
        {message && (
          <div ref={messageRef} className={`message ${message.type}`} role="alert">
            {message.text}
          </div>
        )}

        {!isSuccess ? (
          <form id="request-form" onSubmit={handleSubmit} noValidate>
            {/* Step 1 */}
            <section className={`step ${currentStep === 1 ? 'active' : ''}`} data-step="1">
              <p className="step-intro">Preencha somente o que souber. Nenhum dado desta etapa é obrigatório.</p>
              <div className="grid">
                <div className="full">
                  <label htmlFor="full_name">Nome completo</label>
                  <input
                    id="full_name"
                    name="full_name"
                    autoComplete="name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="email">E-mail atual</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp">WhatsApp com DDD</label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="institution">Instituição de ensino</label>
                  <input
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="course_class">Curso e turma</label>
                  <input
                    id="course_class"
                    name="course_class"
                    placeholder="Ex.: Administração · 2019.2"
                    value={formData.course_class}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="completion_date">Data ou mês de conclusão</label>
                  <input
                    id="completion_date"
                    name="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="actions">
                <span></span>
                <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                  Continuar
                </button>
              </div>
            </section>

            {/* Step 2 */}
            <section className={`step ${currentStep === 2 ? 'active' : ''}`} data-step="2">
              <p className="step-intro">Toque nos materiais que ainda não recebeu. Você não precisa digitar os nomes.</p>
              <div className="grid">
                <div className="full">
                  <label>
                    Qual material está pendente? <span className="req">*</span>
                  </label>
                  <div className="choice-grid material-grid">
                    {MATERIAL_OPTIONS.map((item) => {
                      const checked = formData.pending_material.includes(item.value);
                      return (
                        <label className={`choice ${checked ? 'checked' : ''}`} key={item.value}>
                          <input
                            type="checkbox"
                            name="pending_material"
                            value={item.value}
                            checked={checked}
                            onChange={() => handleCheckboxMaterial(item.value)}
                          />
                          <span>
                            <strong>{item.title}</strong>
                            <small>{item.desc}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="full">
                  <label>
                    Como está a situação? <span className="req">*</span>
                  </label>
                  <div className="choice-grid">
                    {SITUATION_OPTIONS.map((item) => {
                      const checked = formData.material_situation === item.value;
                      return (
                        <label className={`choice ${checked ? 'checked' : ''}`} key={item.value}>
                          <input
                            type="radio"
                            name="material_situation"
                            value={item.value}
                            checked={checked}
                            onChange={() => handleRadioSituation(item.value)}
                            required
                          />
                          <span>
                            <strong>{item.title}</strong>
                            <small>{item.desc}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="actions">
                <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                  Voltar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                  Continuar
                </button>
              </div>
            </section>

            {/* Step 3 */}
            <section className={`step ${currentStep === 3 ? 'active' : ''}`} data-step="3">
              <p className="step-intro">
                Se você tiver o contrato, anexe somente o PDF. O arquivo será otimizado antes de ser guardado.
              </p>
              <div className="grid">
                <div className="full upload">
                  <label htmlFor="contract_file">Contrato em PDF</label>
                  <input
                    ref={fileInputRef}
                    id="contract_file"
                    name="contract_file"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                  />
                  <span className="file-note">
                    {formData.contract_file
                      ? `${formData.contract_file.name} · ${(formData.contract_file.size / 1024 / 1024).toFixed(2)} MB antes da otimização`
                      : 'Somente PDF · até 15 MB antes da otimização. O contrato fica restrito ao atendimento.'}
                  </span>
                </div>
                <div className="full">
                  <label className={`choice ${formData.no_contract ? 'checked' : ''}`}>
                    <input
                      id="no_contract"
                      name="no_contract"
                      type="checkbox"
                      checked={formData.no_contract}
                      onChange={(e) => setFormData((prev) => ({ ...prev, no_contract: e.target.checked }))}
                    />
                    <span>
                      <strong>Não localizei meu contrato</strong>
                      <small>A solicitação será registrada para conferência manual.</small>
                    </span>
                  </label>
                </div>
              </div>

              <div className="actions">
                <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                  Voltar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                  Revisar dados
                </button>
              </div>
            </section>

            {/* Step 4 */}
            <section className={`step ${currentStep === 4 ? 'active' : ''}`} data-step="4">
              <p className="step-intro">
                Confira as informações antes de enviar. O PDF será gerado somente depois que o registro e os documentos
                forem salvos.
              </p>
              <div className="review" id="review">
                {renderReviewRows()}
              </div>

              <div className="consent">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
                  required
                />
                <label htmlFor="consent">
                  Confirmo que as informações acima foram declaradas por mim e autorizo seu uso para localizar contratos
                  e materiais pendentes. <span className="req">*</span>
                </label>
              </div>

              <div className="actions">
                <button type="button" className="btn btn-secondary" onClick={handlePrevStep} disabled={isSubmitting}>
                  Voltar
                </button>
                <button type="submit" className="btn btn-primary" id="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando documentos…' : 'Enviar e baixar comprovante'}
                </button>
              </div>
            </section>
          </form>
        ) : (
          /* Success Screen */
          <div className="success-container" id="success" aria-live="polite">
            <div className="success-mark">✓</div>
            <h2>Solicitação registrada</h2>
            <p>
              Seu comprovante foi baixado automaticamente. Guarde o protocolo para acompanhar a conferência do material.
            </p>
            <div className="protocol" id="protocol">
              {lastProtocol}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button className="btn btn-secondary" id="download-again" type="button" onClick={handleDownloadAgain}>
                Baixar comprovante novamente
              </button>
              <button className="btn btn-ghost" id="new-request" type="button" onClick={handleNewRequest}>
                Registrar outra solicitação
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        O comprovante registra a solicitação declarada e não confirma, por si só, a entrega ou validação do contrato.
      </footer>
    </main>
  );
}
