import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_ID = 'user-admin-id-123';

function parseDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === '') return new Date();
  const [day, month, year] = dateStr.split('/');
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  return new Date(`${year}-${paddedMonth}-${paddedDay}T00:00:00Z`);
}

function parseMoney(moneyStr: string): number {
  if (!moneyStr) return 0;
  if (typeof moneyStr === 'number') return moneyStr;
  return parseFloat(
    moneyStr.replace('R$', '').replace('.', '').replace(',', '.').trim(),
  );
}

function parsePercent(percentStr: string): number {
  if (!percentStr) return 0;
  if (typeof percentStr === 'number') return percentStr;
  return parseFloat(percentStr.replace('%', '').replace(',', '.').trim());
}

async function main() {
  console.log('🌱 Iniciando o seed de PEDIDOS...');

  await prisma.order.deleteMany();

  console.log('🧹 Tabela de pedidos limpa. Buscando dependências...');

  const dbClients = await prisma.client.findMany();
  const dbProducts = await prisma.product.findMany();
  const dbFilaments = await prisma.filament.findMany();
  const dbPrinters = await prisma.printer.findMany();

  // Mapas manuais para garantir ordem (mesma lógica do script anterior)
  const clientMap = [
    'Cleudes Manthey',
    'Douglas Zaltron Magalu',
    'Jaisla Ataídes',
    'Guilherme',
    'Lucas Pagli',
    'Fran',
    'Barbearia da esquina',
    'Paulo Vitor Aquario',
    'Lara Lima Mota',
    'Aurelio',
    'Thales',
  ];

  const productMap = [
    'NIVELADOR DE AQUARIO',
    'NIVELADOR DE AQUARIO MEIO',
    'BRACADEIRA DE MANGUEIRA',
    'SCULTURE DA JULHA',
    'SUPORTE DE 4 BLOCOS MAXSPECT',
    'SUPORTE DE 2 BLOCOS MAXSPECT',
    'SUPORTE PARA COPO DE TERERE EM GARRAFA',
    'SUPORTE NOTEBOOK VERTICAL',
    'CADERNO A5 (DSETUP)',
    'SUPORTE CONTROLE HOLLOW NIGHT',
    'SUPORTE AQUARIO ( Douglas )',
    'ACTION FIGURE MENINA LOBO ( Guilherme )',
    'ACTION FIGURE AURORA ( Lucas Pagl )',
    'CAIXA ORGANIZADORA',
    'LOGO DE TIME 8CM',
    'CAPA DE CADERNO A5 COM BRACADEIRAS ( DSETUP )',
    'CAIXA DE LUMINARIA PARA PADERE',
    'MINIATURA OZZY',
    'GRELHA FIXA PLANEJADA',
    'PRODUTOS VARIADOS',
    'SUPORTE PARA TVBOX UNIVERSAL',
  ];

  const filamentSeeds = [
    { brand: 'Voolt3D', material: 'PLA', color: 'Marrom Velvet' },
    { brand: 'Voolt3D', material: 'ABS', color: 'Preto Premium' },
    { brand: 'Voolt3D', material: 'PLA', color: 'Branco Velvet' },
    { brand: 'Voolt3D', material: 'PLA', color: 'Preto Velvet' },
    { brand: 'Voolt3D', material: 'PETG', color: 'Verde Neon Translúcido' },
    { brand: 'Masterprint', material: 'PETG', color: 'Preto' },
    { brand: 'JAYO', material: 'PETG', color: 'Preto' },
    { brand: 'JAYO', material: 'PLA', color: 'Verde Matte' },
    { brand: 'JAYO', material: 'PLA', color: 'Preto Matte' },
    { brand: '3D Fila', material: 'PLA', color: 'Verde' },
    { brand: '3D Fila', material: 'PLA', color: 'Vermelho' },
    { brand: '3D Fila', material: 'PLA', color: 'Azul Claro' },
    { brand: '3D Fila', material: 'PLA', color: 'Branco' },
  ];

  const getClient = (index: number) => {
    if (index === 0) return null;
    const name = clientMap[index - 1];
    return dbClients.find((c) => c.name === name);
  };

  const cleanName = (name: string) => name.trim();
  const getProductFuzzy = (index: number) => {
    const originalName = productMap[index - 1];
    if (!originalName) return undefined;
    return dbProducts.find(
      (p) => cleanName(p.name) === cleanName(originalName),
    );
  };

  const getFilament = (index: number) => {
    if (index === 0 || !filamentSeeds[index - 1]) return null;
    const seed = filamentSeeds[index - 1];
    return dbFilaments.find(
      (f) =>
        f.brand === seed.brand &&
        f.material_type === seed.material &&
        f.color === seed.color,
    );
  };

  let balcaoClient = dbClients.find((c) => c.name === 'Cliente Balcão');
  if (!balcaoClient) {
    balcaoClient = await prisma.client.create({
      data: {
        tenant_id: TENANT_ID,
        name: 'Cliente Balcão',
        segment: 'Venda Direta',
        phone: '',
        source: 'LOJA',
      },
    });
  }

  const printer = dbPrinters[0];

  const ordersData = [
    {
      id_calc: 1,
      id_cli: 2,
      id_prod: 1,
      id_fil1: 6,
      gramas1: 30,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '03/11/2025',
      valor: 'R$ 5,00',
      lucro: 'R$ 0,83',
      tempo_h: 2,
    },
    {
      id_calc: 2,
      id_cli: 2,
      id_prod: 2,
      id_fil1: 6,
      gramas1: 20,
      taxa_sucata: '10,00%',
      qtd: 0,
      data: '',
      valor: 'R$ 0,00',
      lucro: 'R$ 0,00',
      tempo_h: 1,
    },
    {
      id_calc: 3,
      id_cli: 0,
      id_prod: 3,
      id_fil1: 6,
      gramas1: 30,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '03/11/2025',
      valor: 'R$ 5,00',
      lucro: 'R$ 1,25',
      tempo_h: 2,
    },
    {
      id_calc: 4,
      id_cli: 0,
      id_prod: 4,
      id_fil1: 3,
      gramas1: 270,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '30/10/2025',
      valor: 'R$ 35,00',
      lucro: 'R$ 6,16',
      tempo_h: 7,
    },
    {
      id_calc: 5,
      id_cli: 0,
      id_prod: 5,
      id_fil1: 6,
      gramas1: 60,
      taxa_sucata: '10,00%',
      qtd: 0,
      data: '',
      valor: 'R$ 0,00',
      lucro: 'R$ 0,00',
      tempo_h: 13,
    },
    {
      id_calc: 6,
      id_cli: 2,
      id_prod: 6,
      id_fil1: 6,
      gramas1: 34,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '03/11/2025',
      valor: 'R$ 30,00',
      lucro: 'R$ 23,64',
      tempo_h: 6,
    },
    {
      id_calc: 7,
      id_cli: 8,
      id_prod: 7,
      id_fil1: 4,
      gramas1: 57,
      taxa_sucata: '10,00%',
      qtd: 0,
      data: '',
      valor: 'R$ 0,00',
      lucro: 'R$ 0,00',
      tempo_h: 3,
    },
    {
      id_calc: 8,
      id_cli: 6,
      id_prod: 8,
      id_fil1: 4,
      gramas1: 146,
      taxa_sucata: '10,00%',
      qtd: 2,
      data: '',
      valor: 'R$ 74,00',
      lucro: 'R$ 43,69',
      tempo_h: 3,
    },
    {
      id_calc: 9,
      id_cli: 3,
      id_prod: 9,
      id_fil1: 1,
      gramas1: 221,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '29/10/2025',
      valor: 'R$ 50,00',
      lucro: 'R$ 24,99',
      tempo_h: 6,
    },
    {
      id_calc: 10,
      id_cli: 3,
      id_prod: 10,
      id_fil1: 3,
      gramas1: 69,
      taxa_sucata: '10,00%',
      qtd: 2,
      data: '15/10/2025',
      valor: 'R$ 44,00',
      lucro: 'R$ 28,68',
      tempo_h: 2,
    },
    {
      id_calc: 11,
      id_cli: 2,
      id_prod: 11,
      id_fil1: 6,
      gramas1: 25,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '20/10/2025',
      valor: 'R$ 60,00',
      lucro: 'R$ 55,56',
      tempo_h: 4,
    },
    {
      id_calc: 12,
      id_cli: 4,
      id_prod: 12,
      id_fil1: 3,
      gramas1: 480,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '2/11/2025',
      valor: 'R$ 200,00',
      lucro: 'R$ 63,13',
      tempo_h: 14,
    },
    {
      id_calc: 13,
      id_cli: 5,
      id_prod: 13,
      id_fil1: 3,
      gramas1: 113,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '',
      valor: 'R$ 220,00',
      lucro: 'R$ 103,67',
      tempo_h: 11,
    },
    {
      id_calc: 14,
      id_cli: 3,
      id_prod: 14,
      id_fil1: 4,
      gramas1: 277,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '2/11/2025',
      valor: 'R$ 53,00',
      lucro: 'R$ 23,62',
      tempo_h: 7,
    },
    {
      id_calc: 15,
      id_cli: 1,
      id_prod: 15,
      id_fil1: 4,
      gramas1: 14,
      id_fil2: 2,
      gramas2: 0,
      taxa_sucata: '10,00%',
      qtd: 0,
      data: '',
      valor: 'R$ 0,00',
      lucro: 'R$ 0,00',
      tempo_h: 1,
    },
    {
      id_calc: 16,
      id_cli: 9,
      id_prod: 16,
      id_fil1: 5,
      gramas1: 67,
      id_fil2: 3,
      gramas2: 5,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '02/11/2025',
      valor: 'R$ 22,00',
      lucro: 'R$ 13,13',
      tempo_h: 3,
    },
    {
      id_calc: 17,
      id_cli: 10,
      id_prod: 1,
      id_fil1: 6,
      gramas1: 30,
      taxa_sucata: '10,00%',
      qtd: 3,
      data: '03/11/2025',
      valor: 'R$ 69,99',
      lucro: 'R$ 57,47',
      tempo_h: 2,
    },
    {
      id_calc: 18,
      id_cli: null,
      id_prod: 17,
      id_fil1: 4,
      gramas1: 175,
      taxa_sucata: '10,00%',
      qtd: 0,
      data: '',
      valor: 'R$ 0,00',
      lucro: 'R$ 0,00',
      tempo_h: 10,
    },
    {
      id_calc: 19,
      id_cli: 0,
      id_prod: 18,
      id_fil1: 9,
      gramas1: 33,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '16/11/2025',
      valor: 'R$ 10,00',
      lucro: 'R$ 1,03',
      tempo_h: 10,
    },
    {
      id_calc: 20,
      id_cli: 11,
      id_prod: 19,
      id_fil1: 6,
      gramas1: 113,
      taxa_sucata: '10,00%',
      qtd: 2,
      data: '20/11/2025',
      valor: 'R$ 100,00',
      lucro: 'R$ 68,95',
      tempo_h: 10,
    },
    {
      id_calc: 21,
      id_cli: 2,
      id_prod: 1,
      id_fil1: 6,
      gramas1: 30,
      taxa_sucata: '10,00%',
      qtd: 2,
      data: '20/11/2025',
      valor: 'R$ 30,00',
      lucro: 'R$ 21,65',
      tempo_h: 2,
    },
    {
      id_calc: 22,
      id_cli: 2,
      id_prod: 20,
      id_fil1: 6,
      gramas1: 91,
      taxa_sucata: '10,00%',
      qtd: 1,
      data: '20/11/2025',
      valor: 'R$ 45,00',
      lucro: 'R$ 31,40',
      tempo_h: 10,
    },
    {
      id_calc: 23,
      id_cli: 0,
      id_prod: 21,
      id_fil1: 9,
      gramas1: 89,
      taxa_sucata: '10,00%',
      qtd: 0,
      data: '',
      valor: 'R$ 0,00',
      lucro: 'R$ 0,00',
      tempo_h: 3,
    },
    {
      id_calc: 24,
      id_cli: 0,
      id_prod: 3,
      id_fil1: 6,
      gramas1: 30,
      taxa_sucata: '10,00%',
      qtd: 0,
      data: '',
      valor: 'R$ 0,00',
      lucro: 'R$ 0,00',
      tempo_h: 2,
    },
  ];

  console.log('📦 Inserindo pedidos...');

  for (const order of ordersData) {
    if (order.qtd === 0) continue;

    const client =
      order.id_cli === 0
        ? balcaoClient
        : order.id_cli
        ? getClient(order.id_cli)
        : null;
    const product = getProductFuzzy(order.id_prod);
    const filament1 = getFilament(order.id_fil1);
    // @ts-ignore
    const filament2 = order.id_fil2 ? getFilament(order.id_fil2) : null;

    if (!client || !product || !filament1) {
      console.warn(`⚠️ Pulando pedido ${order.id_calc}: Dados incompletos`);
      continue;
    }

    const sellingPrice = parseMoney(order.valor);
    const netProfit = parseMoney(order.lucro);
    const printTimeMinutes = order.tempo_h * 60;
    const orderDate = order.data ? parseDate(order.data) : new Date();
    const scrapRate = parsePercent(order.taxa_sucata);

    console.log(`Processing Order ${order.id_calc}:`, {
      client_id: client.id,
      product_id: product.id,
      printer_id: printer.id,
      created_at: orderDate,
      status: 'COMPLETED',
    });

    await prisma.order.create({
      data: {
        tenant_id: TENANT_ID,
        client_id: client.id,
        product_id: product.id,
        printer_id: printer.id,

        status: 'COMPLETED',
        created_at: orderDate,

        platform_name: 'Manual', // Padrão
        platform_fee_percent: 0, // Padrão se não informado
        scrap_rate_percent: scrapRate,

        print_time_minutes: printTimeMinutes,

        filament_1_id: filament1.id,
        filament_1_grams_used: order.gramas1,

        filament_2_id: filament2 ? filament2.id : null,
        // @ts-ignore
        filament_2_grams_used: order.gramas2 || 0,

        // Custos (Simplificado: usando 0 ou valores proporcionais se necessário)
        // O usuário não forneceu os custos parciais exatos na tabela de forma estruturada para todos,
        // mas forneceu o Lucro Final. Vou preencher os custos obrigatórios com 0 ou estimativa.
        final_material_cost: 0,
        final_energy_cost: 0,
        final_depreciation_cost: 0,
        final_labor_cost: 0,
        final_platform_fee: 0,

        selling_price: sellingPrice,
        net_profit: netProfit,
      },
    });
  }

  console.log('✅ Seed de pedidos finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
