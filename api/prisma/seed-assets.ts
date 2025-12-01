import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Um ID fixo para simular você (o dono da empresa)
const TENANT_ID = 'user-admin-id-123';

async function main() {
    console.log('🌱 Iniciando o seed de ATIVOS e IMPRESSORAS...');

    // 1. Limpar tabelas (Ordem importa: Pedidos dependem de Impressoras)
    // Como já limpamos tudo com clean-db, isso é redundante mas seguro.
    // Se houver pedidos, vai falhar se não deletar pedidos antes.
    // Vou assumir que o usuário rodou clean-db ou sabe o que está fazendo.
    // Mas para garantir, vou tentar deletar (pode falhar se tiver FK de pedidos, mas o script de clientes limpa pedidos).

    // Para evitar erros de FK com pedidos existentes, vamos limpar pedidos se existirem?
    // O usuário pediu para "deletar as coisas das outras tabelas" antes, então deve estar limpo.
    // Vou colocar deleteMany para garantir idempotência do script isolado.

    try {
        await prisma.order.deleteMany(); // Limpa pedidos para poder deletar impressoras
    } catch (e) {
        // Ignora se falhar (ex: tabela não existe ou outro erro, mas order deve existir)
    }

    await prisma.asset.deleteMany();
    await prisma.printer.deleteMany();

    console.log('🧹 Tabelas de ativos e impressoras limpas. Inserindo dados...');

    // ===========================================================================
    // IMPRESSORAS
    // ===========================================================================
    await prisma.printer.create({
        data: {
            tenant_id: TENANT_ID,
            name: 'Impressora bambu lab a1',
            purchase_price: 3200.00,
            shipping_cost: 0.00,
            purchase_date: new Date('2025-09-30T00:00:00Z'),
            lifespan_hours: 8000, // Valor padrão estimado
            power_consumption_watts: 170, // Valor padrão estimado
        },
    });

    // ===========================================================================
    // ATIVOS
    // ===========================================================================
    // Nota: Somando Valor de Compra + Envio no custo total do ativo, 
    // pois o schema de Asset tem apenas 'cost'.

    await prisma.asset.createMany({
        data: [
            {
                tenant_id: TENANT_ID,
                name: 'Gabinete impressora',
                category: 'Móveis',
                cost: 280.00, // 265 + 15
                purchase_date: new Date('2025-09-30T00:00:00Z')
            },
            {
                tenant_id: TENANT_ID,
                name: 'Paquímetro Digital 150m',
                category: 'Ferramentas',
                cost: 39.00,
                purchase_date: new Date('2025-10-03T00:00:00Z')
            },
            {
                tenant_id: TENANT_ID,
                name: 'Exaustor',
                category: 'Equipamento',
                cost: 89.00, // 74 + 15
                purchase_date: new Date('2025-09-30T00:00:00Z')
            },
            {
                tenant_id: TENANT_ID,
                name: 'Equipamento de pintura',
                category: 'Ferramentas',
                cost: 298.00,
                purchase_date: new Date('2025-10-06T00:00:00Z')
            },
            {
                tenant_id: TENANT_ID,
                name: 'Micro Retifica Completa',
                category: 'Ferramentas',
                cost: 131.00, // 116 + 15
                purchase_date: new Date('2025-09-30T00:00:00Z')
            },
            {
                tenant_id: TENANT_ID,
                name: 'Sílica Gel Azul',
                category: 'Insumos',
                cost: 81.00,
                purchase_date: new Date('2025-09-22T00:00:00Z')
            },
            {
                tenant_id: TENANT_ID,
                name: 'Dominio',
                category: 'Software/Web',
                cost: 45.00,
                purchase_date: new Date('2025-09-30T00:00:00Z')
            },
            {
                tenant_id: TENANT_ID,
                name: 'Designer - parte 1',
                category: 'Serviços',
                cost: 300.00,
                purchase_date: new Date('2025-10-03T00:00:00Z')
            },
        ]
    });

    console.log('✅ Seed de ativos e impressoras finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
