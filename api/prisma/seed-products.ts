import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Um ID fixo para simular você (o dono da empresa)
const TENANT_ID = 'user-admin-id-123';

async function main() {
    console.log('🌱 Iniciando o seed de PRODUTOS...');

    // 1. Limpar tabelas (Ordem importa: Pedidos dependem de Produtos)
    try {
        await prisma.order.deleteMany();
    } catch (e) { }

    await prisma.productAddon.deleteMany();
    await prisma.productMaterial.deleteMany();
    await prisma.product.deleteMany();

    console.log('🧹 Tabelas de produtos limpas. Inserindo dados...');

    // ===========================================================================
    // PRODUTOS
    // ===========================================================================

    const products = [
        {
            name: 'NIVELADOR DE AQUARIO',
            category: 'AQUARIO',
            weight: 30,
            print_time_hours: 2.00,
            addon: { name: 'Mangueira De Nível Cristal 10 Metros 5/16 X 0,80mm Flexível Transparente', cost: 0.42 }
        },
        {
            name: 'NIVELADOR DE AQUARIO MEIO',
            category: 'AQUARIO',
            weight: 20,
            print_time_hours: 1.00,
            addon: { name: 'Mangueira De Nível Cristal 10 Metros 5/16 X 0,80mm Flexível Transparente', cost: 0.42 }
        },
        {
            name: 'BRACADEIRA DE MANGUEIRA',
            category: 'AQUARIO',
            weight: 30,
            print_time_hours: 2.00
        },
        {
            name: 'SCULTURE DA JULHA',
            category: 'PRESENTE',
            weight: 270,
            print_time_hours: 7.00
        },
        {
            name: 'SUPORTE DE 4 BLOCOS MAXSPECT',
            category: 'AQUARIO',
            weight: 60,
            print_time_hours: 13.00
        },
        {
            name: 'SUPORTE DE 2 BLOCOS MAXSPECT',
            category: 'AQUARIO',
            weight: 34,
            print_time_hours: 6.00
        },
        {
            name: 'SUPORTE PARA COPO DE TERERE EM GARRAFA',
            category: 'TERERE',
            weight: 57,
            print_time_hours: 2.70
        },
        {
            name: 'SUPORTE NOTEBOOK VERTICAL',
            category: 'SETUP',
            weight: 146,
            print_time_hours: 3.00
        },
        {
            name: 'CADERNO A5 (DSETUP)',
            category: 'SETUP',
            weight: 221,
            print_time_hours: 6.00
        },
        {
            name: 'SUPORTE CONTROLE HOLLOW NIGHT',
            category: 'GEEK',
            weight: 69,
            print_time_hours: 2.30
        },
        {
            name: 'SUPORTE AQUARIO ( Douglas )',
            category: 'AQUARIO',
            weight: 25,
            print_time_hours: 4.00
        },
        {
            name: 'ACTION FIGURE MENINA LOBO ( Guilherme )',
            category: 'GEEK',
            weight: 480,
            print_time_hours: 13.50
        },
        {
            name: 'ACTION FIGURE AURORA ( Lucas Pagl )',
            category: 'GEEK',
            weight: 113,
            print_time_hours: 10.50
        },
        {
            name: 'CAIXA ORGANIZADORA',
            category: 'SETUP',
            weight: 277,
            print_time_hours: 6.80
        },
        {
            name: 'LOGO DE TIME 8CM',
            category: 'TIME',
            weight: 14,
            print_time_hours: 0.50
        },
        {
            name: 'CAPA DE CADERNO A5 COM BRACADEIRAS ( DSETUP )',
            category: 'SETUP',
            weight: 67, // Usando o primeiro valor
            print_time_hours: 2.50
        },
        {
            name: 'CAIXA DE LUMINARIA PARA PADERE',
            category: 'DECORACAO',
            weight: 175,
            print_time_hours: 10.00
        },
        {
            name: 'MINIATURA OZZY',
            category: 'DECORACAO',
            weight: 33,
            print_time_hours: 10.00
        },
        {
            name: 'GRELHA FIXA PLANEJADA',
            category: 'EMPRESA',
            weight: 113,
            print_time_hours: 10.00
        },
        {
            name: 'PRODUTOS VARIADOS',
            category: 'AQUARIO',
            weight: 91,
            print_time_hours: 10.00
        },
        {
            name: 'SUPORTE PARA TVBOX UNIVERSAL',
            category: 'SETUP',
            weight: 89,
            print_time_hours: 3.20
        }
    ];

    for (const p of products) {
        await prisma.product.create({
            data: {
                tenant_id: TENANT_ID,
                name: p.name,
                category: p.category,
                base_print_time_minutes: Math.round(p.print_time_hours * 60),
                preparation_time_minutes: 0,
                packaging_cost: 0.00,
                fixed_profit_margin: 0.00,
                materials: {
                    create: [
                        { material_type: 'PLA', required_weight_grams: p.weight }
                    ]
                },
                addons: p.addon ? {
                    create: [
                        { name: p.addon.name, cost_unit: p.addon.cost }
                    ]
                } : undefined
            }
        });
    }

    console.log('✅ Seed de produtos finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
