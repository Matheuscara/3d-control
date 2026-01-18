import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Um ID fixo para simular você (o dono da empresa)
const TENANT_ID = 'user-admin-id-123';

async function main() {
    console.log('🌱 Iniciando o seed de CLIENTES...');

    // 1. Limpar tabelas (Ordem importa: Pedidos dependem de Clientes)
    await prisma.order.deleteMany();
    await prisma.client.deleteMany();

    console.log('🧹 Tabela de clientes limpa. Inserindo dados...');

    // ===========================================================================
    // CLIENTES
    // ===========================================================================
    await prisma.client.createMany({
        data: [
            { tenant_id: TENANT_ID, name: 'Cleudes Manthey', segment: 'TABUA DE MADEIRAS', phone: '64996177047', source: 'GOOGLE' },
            { tenant_id: TENANT_ID, name: 'Douglas Zaltron Magalu', segment: 'PROGRAMADOR', phone: '64984512810', source: 'WHATSAPP' }, // Corrigido typo WHATSSAP -> WHATSAPP (padrão) ou manter original se preferir
            { tenant_id: TENANT_ID, name: 'Jaisla Ataídes', segment: 'PROGRAMADOR', phone: '64993383309', source: 'TRABALHO' },
            { tenant_id: TENANT_ID, name: 'Guilherme', segment: 'PROGRAMADOR', phone: '64993041125', source: 'GOOGLE' },
            { tenant_id: TENANT_ID, name: 'Lucas Pagli', segment: 'PROGRAMADOR', phone: '64992363507', source: 'TRABALHO' },
            { tenant_id: TENANT_ID, name: 'Fran', segment: 'PROGRAMADOR', phone: '11984626442', source: 'TRABALHO' },
            { tenant_id: TENANT_ID, name: 'Barbearia da esquina', segment: 'BARBEARIA', phone: '64996487070', source: 'TRABALHO' },
            { tenant_id: TENANT_ID, name: 'Paulo Vitor Aquario', segment: 'CHIMARRAO', phone: '64996423725', source: 'CIDADE' },
            { tenant_id: TENANT_ID, name: 'Lara Lima Mota', segment: 'PROGRAMADOR', phone: '64992219292', source: 'CIDADE' },
            { tenant_id: TENANT_ID, name: 'Aurelio', segment: 'AQUARISTA', phone: '64992614554', source: 'CIDADE' },
            { tenant_id: TENANT_ID, name: 'Thales', segment: 'ENGENHEIRO', phone: '64993202733', source: 'CIDADE' },
        ]
    });

    console.log('✅ Seed de clientes finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
