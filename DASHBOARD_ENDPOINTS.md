# Dashboard Endpoints - 3D Print SaaS

Este documento especifica todos os endpoints necessários para alimentar o dashboard principal.

---

## 📊 1. MÉTRICAS FINANCEIRAS

### `GET /orders/stats/financial`

**Query Params:**
- `period`: string ('month' | 'year' | 'all')
- `month`: number (1-12) - Opcional
- `year`: number (2024, 2025...) - Opcional

**Response:**
```typescript
{
  totalRevenue: number;        // Soma de selling_price
  totalProfit: number;         // Soma de net_profit
  profitMargin: number;        // (totalProfit / totalRevenue) * 100
  averageTicket: number;       // totalRevenue / totalOrders
  totalOrders: number;
  totalCosts: {
    material: number;          // Soma de final_material_cost
    energy: number;            // Soma de final_energy_cost
    depreciation: number;      // Soma de final_depreciation_cost
    labor: number;             // Soma de final_labor_cost
    platformFees: number;      // Soma de final_platform_fee
  };
  previousPeriod?: {
    revenue: number;
    profit: number;
    profitMargin: number;
    averageTicket: number;
  };
}
```

**Cálculo SQL (Exemplo com Prisma):**
```typescript
const orders = await prisma.order.findMany({
  where: {
    tenant_id,
    created_at: {
      gte: startDate,
      lte: endDate
    }
  }
});

const totalRevenue = orders.reduce((sum, o) => sum + Number(o.selling_price), 0);
const totalProfit = orders.reduce((sum, o) => sum + Number(o.net_profit), 0);
// ... etc
```

---

## 📦 2. STATUS DE PRODUÇÃO

### `GET /orders/stats/status`

**Query Params:**
- `period`: string ('month' | 'year')
- `month`: number
- `year`: number

**Response:**
```typescript
{
  total: number;
  byStatus: {
    COMPLETED: number;
    PENDING: number;
    CANCELLED: number;
    IN_PRODUCTION: number;
  };
  successRate: number;         // 100 - média de scrap_rate
  averageScrapRate: number;    // Média de scrap_rate_percent dos pedidos
  averagePrintTime: number;    // Média de print_time_minutes
}
```

---

## 🎨 3. ESTOQUE DE FILAMENTOS

### `GET /filaments/stats/low-stock`

**Query Params:**
- `threshold`: number (default: 500) - Gramas mínimas para alerta

**Response:**
```typescript
{
  lowStockItems: Array<{
    id: string;
    brand: string;
    material_type: string;
    color: string;
    remaining_grams: number;    // stock_quantity * weight_grams
    stock_quantity: number;     // Rolos completos
    cost_per_gram: number;      // (purchase_price + shipping_cost) / weight_grams
    estimated_days_left: number; // Baseado em consumo médio
  }>;
  criticalCount: number;        // Items com < 200g
  warningCount: number;         // Items entre 200-500g
}
```

**Cálculo:**
```typescript
const filaments = await prisma.filament.findMany({
  where: {
    tenant_id,
    is_active: true
  }
});

const lowStock = filaments
  .map(f => ({
    ...f,
    remaining_grams: Number(f.stock_quantity) * f.weight_grams,
    cost_per_gram: (Number(f.purchase_price) + Number(f.shipping_cost)) / f.weight_grams
  }))
  .filter(f => f.remaining_grams < threshold);
```

---

### `GET /filaments/stats/inventory-value`

**Response:**
```typescript
{
  totalValue: number;           // Soma de (stock_quantity * purchase_price)
  totalWeight: number;          // Soma de (stock_quantity * weight_grams)
  totalSpools: number;          // Soma de stock_quantity
  averageCostPerGram: number;   // totalValue / totalWeight
  byMaterial: Array<{
    material_type: string;
    totalValue: number;
    totalWeight: number;
    totalSpools: number;
  }>;
}
```

---

### `GET /filaments/stats/most-used`

**Query Params:**
- `limit`: number (default: 5)
- `period`: string ('month' | 'year')
- `month`: number
- `year`: number

**Response:**
```typescript
{
  topMaterials: Array<{
    filament_id: string;
    brand: string;
    material_type: string;
    color: string;
    total_grams_used: number;
    total_cost: number;
    orders_count: number;
    average_grams_per_order: number;
  }>;
}
```

**Cálculo (Join com Orders):**
Precisa somar todos os campos `filament_X_grams_used` dos pedidos agrupados por filament_id.

---

## 🖨️ 4. EQUIPAMENTOS (IMPRESSORAS)

### `GET /printers/stats/usage`

**Query Params:**
- `period`: string ('month' | 'year')
- `month`: number
- `year`: number

**Response:**
```typescript
{
  totalPrinters: number;
  totalOperatingCost: number;   // Soma de energy_cost + depreciation_cost
  totalPrintHours: number;      // Soma de print_time_minutes / 60
  printerUsage: Array<{
    printer_id: string;
    name: string;
    total_hours: number;
    operating_cost: number;
    energy_cost: number;
    depreciation_cost: number;
    orders_count: number;
    utilization_percent: number; // (total_hours / lifespan_hours) * 100
  }>;
}
```

**Cálculo:**
```typescript
const orders = await prisma.order.findMany({
  where: { tenant_id, created_at: {...} },
  select: {
    printer_id: true,
    print_time_minutes: true,
    final_energy_cost: true,
    final_depreciation_cost: true
  }
});

// Agrupar por printer_id
const grouped = orders.reduce((acc, order) => {
  if (!acc[order.printer_id]) {
    acc[order.printer_id] = {
      total_hours: 0,
      operating_cost: 0,
      energy_cost: 0,
      depreciation_cost: 0,
      orders_count: 0
    };
  }

  acc[order.printer_id].total_hours += order.print_time_minutes / 60;
  acc[order.printer_id].operating_cost += Number(order.final_energy_cost) + Number(order.final_depreciation_cost);
  // ...

  return acc;
}, {});
```

---

## 👥 5. CLIENTES

### `GET /clients/stats/top-revenue`

**Query Params:**
- `limit`: number (default: 5)
- `period`: string ('month' | 'year')
- `month`: number
- `year`: number

**Response:**
```typescript
{
  topClients: Array<{
    client_id: string;
    name: string;
    segment: string;
    total_revenue: number;      // Soma de selling_price
    total_profit: number;       // Soma de net_profit
    orders_count: number;
    average_ticket: number;
    first_order_date: Date;
    last_order_date: Date;
  }>;
}
```

---

### `GET /clients/stats/overview`

**Response:**
```typescript
{
  totalClients: number;         // Count de clients
  activeClients: number;        // Clients com pedidos nos últimos 90 dias
  newClientsThisMonth: number;  // Clients criados este mês (via first order)
  returningRate: number;        // % de clientes com mais de 1 pedido
  bySegment: {
    'Pessoa Física': number;
    'B2B': number;
    'Revendedor': number;
  };
}
```

---

## 📈 6. GRÁFICOS TEMPORAIS

### `GET /orders/stats/daily-revenue`

**Query Params:**
- `days`: number (default: 30)

**Response:**
```typescript
{
  dailyData: Array<{
    date: string;               // 'YYYY-MM-DD'
    revenue: number;
    profit: number;
    orders_count: number;
    profit_margin: number;
  }>;
}
```

---

### `GET /orders/stats/by-platform`

**Query Params:**
- `period`: string ('month' | 'year')
- `month`: number
- `year`: number

**Response:**
```typescript
{
  platforms: Array<{
    platform_name: string;      // 'Shopee', 'Mercado Livre', 'Venda Direta'
    total_revenue: number;
    total_profit: number;
    orders_count: number;
    percentage: number;         // % do total
    average_fee_percent: number; // Média de platform_fee_percent
  }>;
  totalRevenue: number;
}
```

---

## 📦 7. PRODUTOS

### `GET /products/stats/best-sellers`

**Query Params:**
- `limit`: number (default: 10)
- `period`: string ('month' | 'year')
- `month`: number
- `year`: number

**Response:**
```typescript
{
  topProducts: Array<{
    product_id: string;
    name: string;
    category: string;
    orders_count: number;
    total_revenue: number;
    total_profit: number;
    average_price: number;
    profit_margin: number;
  }>;
}
```

---

## 🎯 PRIORIDADE DE IMPLEMENTAÇÃO

### **FASE 1 (MVP Dashboard):**
1. ✅ `GET /orders/stats/financial` - Métricas financeiras principais
2. ✅ `GET /orders/stats/status` - Status de produção
3. ✅ `GET /filaments/stats/low-stock` - Alertas de estoque

### **FASE 2:**
4. `GET /printers/stats/usage` - Uso de equipamentos
5. `GET /orders/stats/by-platform` - Vendas por plataforma
6. `GET /products/stats/best-sellers` - Produtos mais vendidos

### **FASE 3:**
7. `GET /clients/stats/top-revenue` - Top clientes
8. `GET /orders/stats/daily-revenue` - Gráficos temporais
9. `GET /filaments/stats/inventory-value` - Valor do estoque
10. `GET /filaments/stats/most-used` - Materiais mais usados

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### **Filtros Globais (Todos os Endpoints):**
Todos os endpoints de estatísticas devem:
- Filtrar por `tenant_id` (multi-tenancy)
- Suportar filtros de período (month, year)
- Retornar comparação com período anterior quando aplicável

### **Performance:**
- Considerar criar indexes em:
  - `orders.created_at`
  - `orders.tenant_id`
  - `orders.status`
  - `orders.platform_name`

### **Caching:**
- Implementar cache Redis para endpoints de stats (TTL: 5 minutos)
- Invalidar cache ao criar/atualizar pedidos

### **Permissões:**
- Todos os endpoints de `/stats/` requerem autenticação
- Apenas admin/owner do tenant pode acessar
