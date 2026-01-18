import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const TENANT_ID = 'user-admin-id-123';

async function main() {
  console.log('🌱 Iniciando o seed de IMPRESSORAS...');

  await prisma.printer.deleteMany();

  console.log('🧹 Tabela de impressoras limpa. Inserindo dados...');

  const printers = [
    {
      name: 'Ender 3 V2',
      purchase_price: 1200.0,
      shipping_cost: 150.0,
      purchase_date: new Date('2023-01-15'),
      lifespan_hours: 5000,
      power_consumption_watts: 270,
    },
    {
      name: 'Creality CR-10',
      purchase_price: 2500.0,
      shipping_cost: 200.0,
      purchase_date: new Date('2023-03-20'),
      lifespan_hours: 6000,
      power_consumption_watts: 350,
    },
    {
      name: 'Prusa i3 MK3S+',
      purchase_price: 4500.0,
      shipping_cost: 300.0,
      purchase_date: new Date('2023-06-10'),
      lifespan_hours: 8000,
      power_consumption_watts: 120,
    },
  ];

  for (const printer of printers) {
    await prisma.printer.create({
      data: {
        tenant_id: TENANT_ID,
        ...printer,
      },
    });
    console.log(`✅ Impressora criada: ${printer.name}`);
  }

  console.log('✅ Seed de impressoras finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
