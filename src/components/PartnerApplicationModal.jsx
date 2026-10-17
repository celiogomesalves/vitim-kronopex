import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Truck
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/mockProducts';
import { formatCNPJ, formatPhone } from '../utils/formatters';

export function PartnerApplicationModal({ isOpen, onClose, onSubmitApplication }) {
  const [formData, setFormData] = useState({
    companyName: '',
    tradeName: '',
    cnpj: '',
    contactName: '',
    email: '',
    phone: '',
    city: 'São Paulo - SP',
    categories: ['motor', 'freios'],
    estimatedSkus: '50 a 100 itens',
    pixKey: '',
    message: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggleCategory = (catId) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(catId);
      if (exists) {
        return { ...prev, categories: prev.categories.filter((c) => c !== catId) };
      } else {
        return { ...prev, categories: [...prev.categories, catId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitApplication(formData);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 700);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog partner-app-dialog glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {isSuccess ? (
          <div className="partner-success-view text-center py-6 px-4 animate-fade-in">
            <div className="success-icon-badge mb-3">
              <CheckCircle size={40} className="text-cyan animate-pulse" />
            </div>
            <span className="badge badge-stock mb-2">Solicitação Enviada!</span>
            <h3 className="font-bold text-xl text-main mb-2">
              Parabéns! Sua proposta foi enviada para análise.
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto mb-4 leading-relaxed">
              O administrador da <strong>KronoPex Auto Peças</strong> analisará os dados da sua empresa e definirá a taxa de comissão da parceria. Assim que aprovado, você receberá seus <strong>dados de acesso (login e senha)</strong> por e-mail e WhatsApp para cadastrar suas peças.
            </p>

            <button onClick={onClose} className="btn btn-primary btn-sm mx-auto">
              Voltar à Loja
            </button>
          </div>
        ) : (
          <div>
            <div className="partner-modal-header mb-4">
              <div className="flex-center gap-2 mb-1">
                <div className="login-badge-icon">
                  <Briefcase size={20} className="text-cyan" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-main">
                    Seja um Fornecedor / Distribuidor Parceiro KronoPex
                  </h3>
                  <p className="text-xs text-muted">
                    Anuncie seu estoque na vitrine com entrega expressa para mecânicos e clientes
                  </p>
                </div>
              </div>

              {/* Value proposition badges */}
              <div className="partner-perks-row flex-between mt-3 text-xs">
                <span className="flex-center gap-1 text-cyan font-semibold">
                  <TrendingUp size={14} /> +2.000 Clientes e Oficinas
                </span>
                <span className="flex-center gap-1 text-cyan font-semibold">
                  <Truck size={14} /> Frota KronoPex Delivery
                </span>
                <span className="flex-center gap-1 text-cyan font-semibold">
                  <ShieldCheck size={14} /> Repasse Transparente
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-form-grid">
              <div className="form-field full-width">
                <label>Razão Social da Distribuidora / Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Distribuidora Nacional de Peças Automotivas LTDA"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DPA Distribuidora"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>CNPJ da Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                />
              </div>

              <div className="form-field">
                <label>Nome do Responsável / Diretor Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Cidade e Estado da Sede *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: São Paulo - SP"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>WhatsApp / Telefone para Contato *</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 98888-7777"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                />
              </div>

              <div className="form-field">
                <label>E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder="comercial@distribuidora.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>Chave PIX para Recebimento de Repasses Comerciais *</label>
                <input
                  type="text"
                  required
                  placeholder="CNPJ, E-mail ou chave aleatória"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label className="mb-1 block">Categorias de Peças que Distribui (Selecione):</label>
                <div className="partner-categories-selector">
                  {INITIAL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                    const isSelected = formData.categories.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`category-pill-sm ${isSelected ? 'active' : ''}`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-field full-width">
                <label>Estimativa de Peças / SKUs que Deseja Anunciar</label>
                <input
                  type="text"
                  placeholder="Ex: Mais de 100 itens a pronta entrega"
                  value={formData.estimatedSkus}
                  onChange={(e) => setFormData({ ...formData, estimatedSkus: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>Mensagem / Observações para o Administrador</label>
                <textarea
                  rows={2}
                  placeholder="Conte-nos sobre seus diferenciais, prazos de separação e marcas distribuídas..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="full-width partner-modal-actions flex-center gap-2 justify-end mt-3">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitação de Parceria'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
