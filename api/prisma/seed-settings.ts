import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Um ID fixo para simular você (o dono da empresa)
const TENANT_ID = 'user-admin-id-123';

async function main() {
    console.log('🌱 Iniciando o seed de CONFIGURAÇÕES...');

    // 1. Limpar tabela de configurações
    await prisma.settings.deleteMany();

    console.log('🧹 Tabela de configurações limpa. Inserindo dados...');

    // ===========================================================================
    // CONFIGURAÇÕES GLOBAIS
    // ===========================================================================
    await prisma.settings.create({
        data: {
            tenant_id: TENANT_ID,
            electricity_cost_kwh: 0.96, // Custo de eletricidade local ($/kWh)
            labor_rate_hourly: 10.00,   // Taxa de mão de obra ($/hora)
            currency_symbol: 'R$',
        },
    });

    console.log('✅ Seed de configurações finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
