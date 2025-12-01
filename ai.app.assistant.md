# AI Assistant Context: 3D Print SaaS Project

## 1. Visão Geral do Projeto
Transformação de planilhas de gestão de impressão 3D em uma aplicação web SaaS reativa.

## 2. Stack Tecnológica

### Frontend
- **Framework**: **Angular 21**
- **Core Feature**: Uso intensivo de **Signals** para reatividade.
- **Arquitetura**: Standalone Components, Zoneless (foco em performance).
- **UI Library**: Angular PrimeNG (foco em tabelas ricas).

### Backend
- **Framework**: **NestJS**
- **ORM**: Prisma ou TypeORM.
- **Banco de Dados**: PostgreSQL.

## 3. API Endpoints & Data Contracts
O frontend deve consumir os seguintes endpoints do Backend (NestJS).

### Settings (`/settings`)
- `GET /settings`: Retorna configurações globais.
- `POST /settings`: Cria configurações.
- `PATCH /settings/:id`: Atualiza.

**Tipo de Retorno (Settings):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "electricity_cost_kwh": 0.96,
  "labor_rate_hourly": 10.00,
  "currency_symbol": "R$"
}
```

### Printers (`/printers`)
- `GET /printers`: Lista impressoras.
- `POST /printers`: Cria impressora.

**Tipo de Retorno (Printer):**
```json
{
  "id": "uuid",
  "name": "Bambu Lab A1",
  "purchase_price": 3298.00,
  "shipping_cost": 0.00,
  "purchase_date": "2024-01-01T00:00:00Z",
  "lifespan_hours": 8000,
  "power_consumption_watts": 170
}
```

### Assets (`/assets`)
- `GET /assets`: Lista outros ativos.

**Tipo de Retorno (Asset):**
```json
{
  "id": "uuid",
  "name": "Ferramenta X",
  "category": "Ferramenta",
  "cost": 100.00,
  "purchase_date": "2024-01-01T00:00:00Z"
}
```

### Filaments (`/filaments`)
- `GET /filaments`: Lista estoque de filamentos.

**Tipo de Retorno (Filament):**
```json
{
  "id": "uuid",
  "brand": "Voolt3D",
  "material_type": "PLA",
  "color": "Red",
  "purchase_price": 88.10,
  "shipping_cost": 7.50,
  "weight_grams": 1000,
  "stock_quantity": 5,
  "is_active": true
}
```

### Products (`/products`)
- `GET /products`: Lista produtos cadastrados.

**Tipo de Retorno (Product):**
```json
{
  "id": "uuid",
  "name": "Nivelador",
  "category": "Aquario",
  "base_print_time_minutes": 60,
  "packaging_cost": 0.00,
  "preparation_time_minutes": 5,
  "fixed_profit_margin": 0.5,
  "materials": [],
  "addons": []
}
```

### Clients (`/clients`)
- `GET /clients`: Lista clientes.

**Tipo de Retorno (Client):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "segment": "Maker",
  "phone": "11999999999",
  "source": "Instagram"
}
```

### Orders (`/orders`)
- `GET /orders`: Lista pedidos.

**Tipo de Retorno (Order):**
```json
{
  "id": "uuid",
  "status": "PENDING",
  "client_id": "uuid",
  "product_id": "uuid",
  "printer_id": "uuid",
  "platform_name": "Shopee",
  "selling_price": 50.00,
  "net_profit": 15.00
}
```

## 4. Lógica de Negócio (Backend)
- **Custo Filamento**: `(Preço + Frete) / Peso`.
- **Custo Hora Máquina**: `(Energia + Depreciação)`.
- **Precificação de Pedido**:
  - Soma de: Material (com sucata) + Tempo Máquina + Mão de Obra + Extras + Embalagem.
  - **Cálculo Reverso**: Definição do preço de venda baseado na margem desejada e taxas de plataforma (Shopee/ML).

## 5. Frontend Details
- **CalculatorComponent**:
  - **Inputs (Signals)**: Produto, Impressora, Filamentos, Taxa Plataforma, Margem.
  - **Outputs (Computed)**: Atualização em tempo real dos custos e preço sugerido.