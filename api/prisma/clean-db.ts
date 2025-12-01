import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Iniciando limpeza completa do banco de dados...');

    // A ordem importa por causa das chaves estrangeiras (Constraints)

    // 1. Tabelas dependentes (filhos)
    await prisma.order.deleteMany();
    await prisma.productAddon.deleteMany();
    await prisma.productMaterial.deleteMany();

    // 2. Tabelas principais (pais)
    await prisma.product.deleteMany();
    await prisma.filament.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.printer.deleteMany();
    await prisma.client.deleteMany();
    await prisma.settings.deleteMany();

    console.log('✨ Banco de dados limpo com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
