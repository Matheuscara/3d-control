# Documentação de Engenharia: Sistema de Gestão 3D Print SaaS

## 1\. Visão Geral e Stack Tecnológica

O objetivo é transformar planilhas interconectadas em uma aplicação web reativa.

  * **Frontend:** **Angular 21**.
      * **Core Feature:** Uso intensivo de **Signals** para recálculo de preço em tempo real (simulando a reatividade do Excel).
      * **Architecture:** Standalone Components, Zoneless (se possível para performance máxima).
      * **UI Lib:** Angular Material ou PrimeNG (para tabelas ricas de dados).
  * **Backend:** **NestJS**.
      * **ORM:** Prisma ou TypeORM (PostgreSQL).
  * **Banco de Dados:** PostgreSQL.

-----

## 2\. Modelagem de Dados (Conversão Planilha -\> SQL)

Baseado nos seus arquivos, aqui está como as tabelas devem ser criadas no banco de dados. Note que adicionei `tenant_id` em tudo para suportar múltiplos usuários (SaaS).

### A. Módulo Financeiro e Ativos (`CUSTO DA EMPRESA` e `CUSTOS OPERACIONAIS`)

Aqui separamos o que é configuração global do que é ativo físico.

```sql
-- Tabela de Configurações Globais (Sua casa/empresa)
CREATE TABLE settings (
  id UUID PRIMARY KEY,
  tenant_id UUID, -- Dono da conta
  electricity_cost_kwh DECIMAL(10,4), -- Ex: 0.96 (Vem da aba Custos Operacionais)
  labor_rate_hourly DECIMAL(10,2),    -- Ex: 10.00 (Vem da aba Custos Operacionais)
  currency_symbol VARCHAR(5) DEFAULT 'R$'
);

-- Tabela de Impressoras (Ativos)
CREATE TABLE printers (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  name VARCHAR(255),          -- Ex: "Bambu Lab A1"
  purchase_price DECIMAL,     -- Ex: 3298.00
  shipping_cost DECIMAL,      -- Ex: 0.00
  purchase_date DATE,
  lifespan_hours INT,         -- Ex: 8000
  power_consumption_watts INT, -- Ex: 170
  -- Campos Calculados (Virtual ou Atualizados via Trigger):
  -- depreciation_per_hour = (purchase_price + shipping_cost) / lifespan_hours
  -- energy_cost_per_hour = (power_consumption_watts / 1000) * settings.electricity_cost_kwh
);

-- Outros Ativos/Despesas (Dominio, Designer, Ferramentas)
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  name VARCHAR(255),
  category VARCHAR(50), -- "Ferramenta", "Software", "Serviço"
  cost DECIMAL,
  purchase_date DATE
);
```

### B. Módulo de Estoque (`FILAMENTOS`)

A lógica aqui muda um pouco do Excel para Banco de Dados. Em vez de linhas soltas, temos um inventário.

```sql
CREATE TABLE filaments (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  brand VARCHAR(100),       -- Ex: Voolt3D
  material_type VARCHAR(50), -- Ex: PLA, ABS, PETG
  color VARCHAR(100),       -- Ex: Marrom Velvet
  purchase_price DECIMAL,   -- Ex: 88.10
  shipping_cost DECIMAL,    -- Ex: 7.50
  weight_grams INT DEFAULT 1000,
  purchase_date DATE,
  stock_quantity INT,       -- Quantos rolos comprou
  is_active BOOLEAN DEFAULT TRUE,
  -- Campo Calculado Crucial:
  -- cost_per_gram = (purchase_price + shipping_cost) / (weight_grams * stock_quantity)
);
```

### C. Módulo de Produtos (`PRODUTOS`)

Aqui normalizamos os dados. No Excel você tinha "Cor 1", "Cor 2". No sistema, teremos uma relação de "receita".

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  name VARCHAR(255),             -- Ex: "Nivelador de Aquario"
  category VARCHAR(100),         -- Ex: "Aquario"
  base_print_time_minutes INT,   -- Convertendo suas horas para minutos para facilitar calculo
  packaging_cost DECIMAL,        -- Ex: 0.00 ou Custo Caixa
  preparation_time_minutes INT,  -- Tempo de manuseio/montagem
  fixed_profit_margin DECIMAL    -- Margem de lucro desejada padrão para este produto
);

-- Tabela "Receita do Bolo" (Materiais por Produto)
CREATE TABLE product_materials (
  product_id UUID,
  material_type VARCHAR(50), -- Ex: "PLA" (Não amarra a um rolo específico ainda, só ao tipo)
  required_weight_grams DECIMAL(10,2) -- Ex: 30g
);

-- Tabela de Componentes Extras (Parafusos, Mangueiras - Colunas J, K, L do Excel)
CREATE TABLE product_addons (
  product_id UUID,
  name VARCHAR(255), -- Ex: "Mangueira de Nível"
  cost_unit DECIMAL  -- Ex: 0.42
);
```

### D. Módulo de Vendas e Calculadora (`PEDIDO` e `CLIENTES`)

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  name VARCHAR(255),
  segment VARCHAR(100), -- Ex: "Programador"
  phone VARCHAR(20),
  source VARCHAR(50)    -- Ex: "Google", "Whatsapp"
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  client_id UUID,
  product_id UUID,
  printer_id UUID, -- Qual impressora será usada (define o custo hora)
  
  -- Configuração da Venda
  platform_name VARCHAR(50), -- Shopee, ML, Venda Direta
  platform_fee_percent DECIMAL, -- Ex: 14% ou 20%
  scrap_rate_percent DECIMAL,   -- "Taxa de Sucata" do Excel (Ex: 0.10 para 10%)
  
  -- Seleção Real dos Materiais (Aqui o usuário escolhe qual rolo vai usar)
  filament_1_id UUID, 
  filament_2_id UUID,
  
  -- Snapshot Financeiro (Salvar os valores no momento da venda, pois o preço do filamento pode mudar depois)
  final_material_cost DECIMAL,
  final_energy_cost DECIMAL,
  final_depreciation_cost DECIMAL,
  final_labor_cost DECIMAL,
  final_platform_fee DECIMAL,
  
  selling_price DECIMAL, -- Preço final de venda
  net_profit DECIMAL     -- Lucro líquido calculado
);
```

-----

## 3\. Lógica de Negócio (Backend - NestJS Services)

Estas são as funções que substituirão suas fórmulas do Excel. O desenvolvedor deve implementar isso nos `Services` do NestJS.

### **Fórmula 1: Custo Real do Grama (`FILAMENTOS.csv`)**

```typescript
calculateFilamentCostPerGram(price: number, shipping: number, weightGrams: number): number {
  return (price + shipping) / weightGrams;
}
```

### **Fórmula 2: Custo Hora Máquina (`CUSTOS OPERACIONAIS.csv`)**

Esta é composta. No Excel você calculou separado, no sistema faremos junto.

```typescript
calculateMachineHourlyCost(printer: Printer, settings: Settings): number {
  const energyCost = (printer.power_watts / 1000) * settings.electricity_cost_kwh;
  const depreciation = printer.purchase_price / printer.lifespan_hours;
  return energyCost + depreciation;
}
```

### **Fórmula 3: O "Grande Cálculo" do Pedido (`PEDIDO.csv`)**

Essa é a lógica mestra que consolida tudo.

```typescript
calculateOrderPricing(
  product: Product, 
  filaments: Filament[], 
  printer: Printer, 
  settings: Settings, 
  markup: number, 
  platformFeePercent: number
) {
  // 1. Custo Material (com taxa de sucata/falha)
  const materialCost = filaments.reduce((acc, fil) => {
    const cost = fil.grams_used * fil.cost_per_gram;
    return acc + cost;
  }, 0) * (1 + settings.scrap_rate); // Ex: +10% sucata

  // 2. Custo Tempo (Energia + Depreciação)
  const machineHourlyCost = this.calculateMachineHourlyCost(printer, settings);
  const printTimeHours = product.print_time_minutes / 60;
  const machineTotalCost = machineHourlyCost * printTimeHours;

  // 3. Custo Mão de Obra (Manuseio + Montagem)
  const laborCost = (product.preparation_time_minutes / 60) * settings.labor_rate_hourly;

  // 4. Extras
  const addonsCost = product.addons.reduce((sum, item) => sum + item.cost, 0);
  const packaging = product.packaging_cost;

  // CUSTO TOTAL DE PRODUÇÃO (CT)
  const totalProductionCost = materialCost + machineTotalCost + laborCost + addonsCost + packaging;

  // CÁLCULO REVERSO PARA PREÇO DE VENDA (Considerando a mordida da Shopee)
  // Fórmula: Venda = (Custo + LucroDesejado) / (1 - TaxaPlataforma)
  
  // Se o markup for porcentagem sobre o custo:
  const desiredProfit = totalProductionCost * markup; 
  const sellingPrice = (totalProductionCost + desiredProfit) / (1 - (platformFeePercent / 100));
  
  const platformFeeValue = sellingPrice * (platformFeePercent / 100);
  const netProfit = sellingPrice - platformFeeValue - totalProductionCost;

  return {
    custo_total: totalProductionCost,
    preco_venda_sugerido: sellingPrice,
    taxa_plataforma: platformFeeValue,
    lucro_liquido: netProfit
  };
}
```

-----

## 4\. Frontend - Angular 21 (A Mágica da Interface)

Para a interface, usaremos a nova feature de **Signals** para que o usuário sinta que está usando uma planilha superpoderosa.

### Componente: `CalculatorComponent`

Imagine uma tela dividida em duas colunas:

**Esquerda (Inputs - Controle via Signals):**

  * Select: `Produto` (Ao selecionar, carrega os tempos e pesos padrão).
  * Select: `Impressora` (Afeta o custo hora).
  * Select: `Filamento Slot 1`, `Filamento Slot 2` (Calcula o custo cor).
  * Input: `Taxa Plataforma (%)` (Ex: Shopee 14%).
  * Slider: `Margem de Lucro Desejada`.

**Direita (Outputs - Computed Signals):**
Este painel atualiza em tempo real sem clicar em "Calcular".

```typescript
// Exemplo conceitual Angular 21
export class CalculatorComponent {
  // Inputs
  selectedProduct = signal<Product | null>(null);
  selectedPrinter = signal<Printer | null>(null);
  platformFee = signal(14); // 14% default
  
  // Computed (A Mágica)
  custoTotal = computed(() => {
    const prod = this.selectedProduct();
    const print = this.selectedPrinter();
    if (!prod || !print) return 0;
    
    // Chama a lógica de custo aqui
    return calculateCost(prod, print);
  });

  precoVenda = computed(() => {
    const custo = this.custoTotal();
    const fee = this.platformFee() / 100;
    // Evita divisão por zero
    if (fee >= 1) return 0; 
    return (custo * 1.5) / (1 - fee); // Exemplo com 50% markup
  });
}
```

-----

## 5\. Estratégia de Monetização (Baseado na sua Tabela de Clientes)

Na sua tabela `CLIENTES`, vi que você atende desde "Programadores" (Hobby/Pro) até "Barbearias" (B2B). O SaaS pode seguir isso:

1.  **Plano Maker (Free/Cheap):**
      * Cadastro de até 2 impressoras.
      * Cálculo simples (sem depreciação ou energia detalhada).
2.  **Plano Farm (Pro - Seu uso atual):**
      * Impressoras ilimitadas.
      * Cálculo reverso de Shopee/ML (O diferencial matador).
      * Gestão de Estoque de Filamento (Saber se o rolo vai acabar no meio da print).
      * CRM Simples (Sua tabela de clientes).