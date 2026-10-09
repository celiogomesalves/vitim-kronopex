# 🚗 KronoPex Auto Peças & Delivery — Vitrine Online & Gestão

Sistema completo de e-commerce e vitrine virtual para a **KronoPex Auto Peças**, desenvolvido com foco em alta performance, visual clean/moderno (tons de azul, branco e grafite automotivo) e experiência de compra rápida sem burocracia para clientes e oficinas mecânicas.

---

## 🌟 Principais Recursos

### 🛒 1. Vitrine do Cliente (Sem Cadastro Prévio)
- **Zero Fricção:** O cliente entra, pesquisa por nome, código OEM ou modelo do carro (ex: *Gol G5, Civic, 5W30, Pastilha*), navega pelas prateleiras e adiciona direto ao carrinho.
- **Catálogo de Imagens com Zoom Interativo:** Modal de inspeção detalhada com ampliação por lente dinâmica ao passar o mouse, especificações técnicas, garantia e lista de veículos compatíveis.
- **Prateleiras Virtuais:**
  - 🚗 Todas as Peças
  - ⚙️ Motor & Injeção
  - 🛑 Freios & Segurança
  - 🔩 Suspensão & Direção
  - 💡 Elétrica & Iluminação
  - 🛢️ Óleos & Filtros
  - 🧼 Acessórios & Estética
- **Carrinho Lateral Deslizante (Drawer):** Barra de progresso dinâmica para meta de **Frete Grátis**, cálculo instantâneo e resumo com desconto de 10% no PIX.
- **Checkout Direto:**
  - Consulta automática de endereço por CEP (ViaCEP API).
  - Opções de pagamento: **PIX Imediato** (com QR Code e Copia e Cola), **Cartão na Entrega** (maquininha com motoboy) e **Dinheiro** (com campo para troco).
  - Geração automática de número de pedido (ex: `#KP-9425`).
  - Botão de envio direto do resumo formatado para o **WhatsApp oficial da KronoPex**.

---

### 🛡️ 2. Painel Administrativo & Controle de Equipe (RBAC)
- **Acesso Seguro e Discreto:** Botão discreto no topo e rodapé ("Acesso Equipe") ou rota de gestão.
- **Autenticação:** Suporte para login com **Google via Appwrite** e perfis rápidos de demonstração.
- **Controle de Permissões (RBAC):**
  - **Administrador Master:** Acesso total a todas as áreas, finanças, configurações de banco e gestão da equipe.
  - **Gerente Comercial:** Edição de preços, atualização do catálogo, controle de estoque e aprovação de pedidos.
  - **Operador de Expedição:** Visualização dos pedidos, separação de peças no estoque e despacho de entregas.
- **Módulos do Admin:**
  1. **Painel Geral (Dashboard):** Métricas de faturamento em tempo real, pedidos pendentes, alertas de estoque crítico e status da frota.
  2. **Estoque & Peças:** Tabela interativa com busca, ajuste rápido de quantidade (+ / -), cadastro de nova peça com fotos e especificações.
  3. **Administração de Pedidos:** Fluxo completo por status (`Pendente` ➔ `Em Separação` ➔ `Em Entrega` ➔ `Concluído`), atribuição de entregador e botão para abrir conversa com o cliente no WhatsApp.
  4. **KronoPex Delivery (Entregadores):** Cadastro de motoboys e furgões da empresa, placas e controle de disponibilidade.
  5. **Equipe & Permissões:** Gestão de colaboradores com seus respectivos níveis de acesso.
  6. **Configurações & Integrações:** Conexão com o banco **Appwrite**, chaves de notificação push **FCM**, chaves PIX e WhatsApp oficial.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19 + Vite 8
- **Estilização:** CSS moderno com design tokens em variáveis CSS e tema automotivo
- **Ícones:** Lucide React
- **Efeitos:** Canvas Confetti para confirmação de compra
- **Backend & Auth:** SDK oficial do **Appwrite** (`appwrite`)
- **Notificações:** Web Push Notifications & Firebase Cloud Messaging (FCM)
- **Deploy:** Otimizado para **Vercel** e repositório GitHub `celigomesalves/vitim-kronopex`

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build

# 4. Pré-visualizar a versão de produção
npm run preview
```

---

## 📦 Publicação no Vercel & GitHub

1. Inicialize e faça o push para o GitHub:
```bash
git add .
git commit -m "feat: vitrine online e painel administrativo KronoPex"
git branch -M main
git remote add origin https://github.com/celigomesalves/vitim-kronopex.git
git push -u origin main
```

2. No painel da **Vercel**:
- Importe o repositório `celigomesalves/vitim-kronopex`.
- Framework Preset: **Vite**.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Adicione as variáveis de ambiente opcionais do Appwrite se já possuir:
  - `VITE_APPWRITE_ENDPOINT`
  - `VITE_APPWRITE_PROJECT_ID`
  - `VITE_APPWRITE_DATABASE_ID`
