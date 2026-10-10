/**
 * Utilitários de formatação para padrão brasileiro (pt-BR)
 * - Moeda: Real Brasileiro (R$ 1.234,56)
 * - Documentos: CPF (000.000.000-00) e CNPJ (00.000.000/0001-00)
 * - Telefone / WhatsApp: (11) 98765-4321 ou (11) 8765-4321
 * - Datas: DD/MM/AAAA ou DD/MM/AAAA às HH:mm
 * - CEP: 00000-000
 */

export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value));
};

/**
 * Converte qualquer entrada (string formatada com R$, vírgulas ou pontos) para número float seguro.
 */
export const parseCurrencyToNumber = (value) => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Remove R$, espaços e pontos de milhar, troca vírgula decimal por ponto
  const cleaned = String(value)
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Máscara monetária em tempo real ao digitar.
 * Exemplo: usuário digita '19990' -> retorna '199,90'
 */
export const maskCurrencyInput = (value) => {
  if (!value && value !== 0) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const number = Number(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length <= 10) {
    // (XX) XXXX-XXXX
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  // (XX) XXXXX-XXXX
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};

export const formatCPF = (cpf) => {
  if (!cpf) return '';
  const digits = String(cpf).replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  const digits = String(cnpj).replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
};

export const formatDocument = (doc) => {
  if (!doc) return '';
  const digits = String(doc).replace(/\D/g, '');
  if (digits.length <= 11) {
    return formatCPF(digits);
  }
  return formatCNPJ(digits);
};

export const formatCEP = (cep) => {
  if (!cep) return '';
  const digits = String(cep).replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return String(dateInput);
  }
};

export const formatDateTime = (dateInput) => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const datePart = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
    const timePart = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
    return `${datePart} às ${timePart}`;
  } catch {
    return String(dateInput);
  }
};
