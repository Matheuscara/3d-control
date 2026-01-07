import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Um ID fixo para simular você (o dono da empresa)
const TENANT_ID = 'user-admin-id-123';

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados (Apenas Filamentos)...');

  // 1. Limpar tabela de filamentos
  await prisma.filament.deleteMany();

  console.log('🧹 Tabela de filamentos limpa. Inserindo dados...');

  // ===========================================================================
  // FILAMENTOS
  // ===========================================================================
  await prisma.filament.createMany({
    data: [
      {
        tenant_id: TENANT_ID,
        brand: 'Voolt3D',
        material_type: 'PLA',
        color: 'Marrom Velvet',
        purchase_price: 88.1,
        shipping_cost: 7.5,
        stock_quantity: 1,
        purchase_date: new Date('2025-10-02T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: 'Voolt3D',
        material_type: 'ABS',
        color: 'Preto Premium',
        purchase_price: 67.0,
        shipping_cost: 7.5,
        stock_quantity: 2,
        purchase_date: new Date('2025-10-02T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: 'Voolt3D',
        material_type: 'PLA',
        color: 'Branco Velvet',
        purchase_price: 83.0,
        shipping_cost: 5.29,
        stock_quantity: 2,
        purchase_date: new Date('2025-10-02T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: 'Voolt3D',
        material_type: 'PLA',
        color: 'Preto Velvet',
        purchase_price: 83.0,
        shipping_cost: 5.29,
        stock_quantity: 2,
        purchase_date: new Date('2025-10-02T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: 'Voolt3D',
        material_type: 'PETG',
        color: 'Verde Neon Translúcido',
        purchase_price: 94.63,
        shipping_cost: 5.29,
        stock_quantity: 1,
        purchase_date: new Date('2025-10-02T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: 'Masterprint',
        material_type: 'PETG',
        color: 'Preto',
        purchase_price: 78.8,
        shipping_cost: 0.0,
        stock_quantity: 1,
        purchase_date: new Date('2025-10-13T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: 'JAYO',
        material_type: 'PETG',
        color: 'Preto',
        purchase_price: 70.8,
        shipping_cost: 0.0,
        stock_quantity: 5,
        purchase_date: new Date('2025-10-29T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: 'JAYO',
        material_type: 'PLA',
        color: 'Verde Matte',
        purchase_price: 91.0,
        shipping_cost: 0.0,
        stock_quantity: 5,
        purchase_date: new Date('2025-10-29T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: 'JAYO',
        material_type: 'PLA',
        color: 'Preto Matte',
        purchase_price: 91.0,
        shipping_cost: 0.0,
        stock_quantity: 5,
        purchase_date: new Date('2025-10-29T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: '3D Fila',
        material_type: 'PLA',
        color: 'Verde',
        purchase_price: 86.0,
        shipping_cost: 10.25,
        stock_quantity: 1,
        purchase_date: new Date('2025-10-29T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: '3D Fila',
        material_type: 'PLA',
        color: 'Vermelho',
        purchase_price: 86.0,
        shipping_cost: 10.25,
        stock_quantity: 1,
        purchase_date: new Date('2025-10-29T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: '3D Fila',
        material_type: 'PLA',
        color: 'Azul Claro',
        purchase_price: 86.0,
        shipping_cost: 10.25,
        stock_quantity: 1,
        purchase_date: new Date('2025-10-29T00:00:00Z'),
      },
      {
        tenant_id: TENANT_ID,
        brand: '3D Fila',
        material_type: 'PLA',
        color: 'Branco',
        purchase_price: 86.0,
        shipping_cost: 10.25,
        stock_quantity: 1,
        purchase_date: new Date('2025-10-29T00:00:00Z'),
      },
    ],
  });

  console.log('✅ Seed de filamentos finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
