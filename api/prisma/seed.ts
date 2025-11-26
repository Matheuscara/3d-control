import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Um ID fixo para simular você (o dono da empresa)
const TENANT_ID = 'user-admin-id-123';

async function main() {
    console.log('🌱 Iniciando o seed do banco de dados...');

    // 1. Limpar banco de dados (para evitar duplicatas ao rodar várias vezes)
    // A ordem importa por causa das chaves estrangeiras (Constraints)
    await prisma.order.deleteMany();
    await prisma.productAddon.deleteMany();
    await prisma.productMaterial.deleteMany();
    await prisma.product.deleteMany();
    await prisma.filament.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.printer.deleteMany();
    await prisma.client.deleteMany();
    await prisma.settings.deleteMany();

    console.log('🧹 Banco limpo. Inserindo dados...');

    // ===========================================================================
    // 2. CONFIGURAÇÕES GLOBAIS (Baseado em CUSTOS OPERACIONAIS.csv)
    // ===========================================================================
    await prisma.settings.create({
        data: {
            tenant_id: TENANT_ID,
            electricity_cost_kwh: 0.96, // Custo de eletricidade local ($/kWh)
            labor_rate_hourly: 10.00,   // Taxa de mão de obra ($/hora)
            currency_symbol: 'R$',
        },
    });

    // ===========================================================================
    // 3. IMPRESSORAS (Baseado em CUSTOS OPERACIONAIS.csv e CUSTO DA EMPRESA.csv)
    // ===========================================================================
    const printerBambu = await prisma.printer.create({
        data: {
            tenant_id: TENANT_ID,
            name: 'Bambu Lab A1',
            purchase_price: 3298.00,
            shipping_cost: 0.00,
            purchase_date: new Date('2025-09-30T00:00:00Z'),
            lifespan_hours: 8000,
            power_consumption_watts: 170,
        },
    });

    // ===========================================================================
    // 4. ATIVOS E FERRAMENTAS (Baseado em CUSTO DA EMPRESA.csv)
    // ===========================================================================
    await prisma.asset.createMany({
        data: [
            { tenant_id: TENANT_ID, name: 'Gabinete Impressora', category: 'Móveis', cost: 265.00, purchase_date: new Date('2025-09-30T00:00:00Z') },
            { tenant_id: TENANT_ID, name: 'Paquímetro Digital 150m', category: 'Ferramentas', cost: 39.00, purchase_date: new Date('2025-10-03T00:00:00Z') },
            { tenant_id: TENANT_ID, name: 'Exaustor', category: 'Equipamento', cost: 74.00, purchase_date: new Date('2025-09-30T00:00:00Z') },
            { tenant_id: TENANT_ID, name: 'Equipamento de pintura', category: 'Ferramentas', cost: 298.00, purchase_date: new Date('2025-10-06T00:00:00Z') },
            { tenant_id: TENANT_ID, name: 'Micro Retifica Completa', category: 'Ferramentas', cost: 116.00, purchase_date: new Date('2025-09-30T00:00:00Z') },
            { tenant_id: TENANT_ID, name: 'Sílica Gel Azul', category: 'Insumos', cost: 81.00, purchase_date: new Date('2025-09-22T00:00:00Z') },
            { tenant_id: TENANT_ID, name: 'Dominio', category: 'Software/Web', cost: 45.00, purchase_date: new Date('2025-09-30T00:00:00Z') },
            { tenant_id: TENANT_ID, name: 'Designer - Parte 1', category: 'Serviços', cost: 300.00, purchase_date: new Date('2025-10-03T00:00:00Z') },
        ]
    });

    // ===========================================================================
    // 5. FILAMENTOS (Baseado em FILAMENTOS.csv)
    // ===========================================================================
    // Salvando alguns em variáveis caso precisemos criar pedidos de exemplo depois
    const filMarrom = await prisma.filament.create({
        data: { tenant_id: TENANT_ID, brand: 'Voolt3D', material_type: 'PLA', color: 'Marrom Velvet', purchase_price: 88.10, shipping_cost: 7.50, stock_quantity: 1, purchase_date: new Date('2025-10-02T00:00:00Z') }
    });

    await prisma.filament.createMany({
        data: [
            { tenant_id: TENANT_ID, brand: 'Voolt3D', material_type: 'ABS', color: 'Preto Premium', purchase_price: 67.00, shipping_cost: 7.50, stock_quantity: 2, purchase_date: new Date('2025-10-02T00:00:00Z') },
            { tenant_id: TENANT_ID, brand: 'Voolt3D', material_type: 'PLA', color: 'Branco Velvet', purchase_price: 83.00, shipping_cost: 5.29, stock_quantity: 2, purchase_date: new Date('2025-10-02T00:00:00Z') },
            { tenant_id: TENANT_ID, brand: 'Voolt3D', material_type: 'PLA', color: 'Preto Velvet', purchase_price: 83.00, shipping_cost: 5.29, stock_quantity: 2, purchase_date: new Date('2025-10-02T00:00:00Z') },
            { tenant_id: TENANT_ID, brand: 'Voolt3D', material_type: 'PETG', color: 'Verde Neon Translúcido', purchase_price: 94.63, shipping_cost: 5.29, stock_quantity: 1, purchase_date: new Date('2025-10-02T00:00:00Z') },
            { tenant_id: TENANT_ID, brand: 'Masterprint', material_type: 'PETG', color: 'Preto', purchase_price: 78.80, shipping_cost: 0.00, stock_quantity: 1, purchase_date: new Date('2025-10-13T00:00:00Z') },
            { tenant_id: TENANT_ID, brand: 'JAYO', material_type: 'PETG', color: 'Preto', purchase_price: 70.80, shipping_cost: 0.00, stock_quantity: 5, purchase_date: new Date('2025-10-29T00:00:00Z') },
            { tenant_id: TENANT_ID, brand: 'JAYO', material_type: 'PLA', color: 'Verde Matte', purchase_price: 91.00, shipping_cost: 0.00, stock_quantity: 5, purchase_date: new Date('2025-10-29T00:00:00Z') },
        ]
    });

    // ===========================================================================
    // 6. CLIENTES (Baseado em CLIENTES.csv)
    // ===========================================================================
    const clientDouglas = await prisma.client.create({
        data: { tenant_id: TENANT_ID, name: 'Douglas Zaltron Magalu', segment: 'PROGRAMADOR', phone: '64984512810', source: 'WHATSAPP' }
    });

    await prisma.client.createMany({
        data: [
            { tenant_id: TENANT_ID, name: 'Cleudes Manthey', segment: 'TABUA DE MADEIRAS', phone: '64996177047', source: 'GOOGLE' },
            { tenant_id: TENANT_ID, name: 'Jaisla Ataídes', segment: 'PROGRAMADOR', phone: '64993383309', source: 'TRABALHO' },
            { tenant_id: TENANT_ID, name: 'Guilherme', segment: 'PROGRAMADOR', phone: '64993041125', source: 'GOOGLE' },
            { tenant_id: TENANT_ID, name: 'Barbearia da esquina', segment: 'BARBEARIA', phone: '64996487070', source: 'TRABALHO' },
            { tenant_id: TENANT_ID, name: 'Paulo Vitor Aquario', segment: 'CHIMARRAO', phone: '64996423725', source: 'CIDADE' },
            { tenant_id: TENANT_ID, name: 'Aurelio', segment: 'AQUARISTA', phone: '64992614554', source: 'CIDADE' },
        ]
    });

    // ===========================================================================
    // 7. PRODUTOS (Baseado em PRODUTOS.csv)
    // ===========================================================================

    // Produto 1: NIVELADOR DE AQUARIO
    // Nota: Convertendo "TEMPO DE IMPRESSAO" (2 horas na planilha) para 120 minutos
    await prisma.product.create({
        data: {
            tenant_id: TENANT_ID,
            name: 'Nivelador de Aquario',
            category: 'AQUARIO',
            base_print_time_minutes: 120, // 2 horas * 60
            preparation_time_minutes: 0,  // Baseado na coluna TEMPO DE MANUSEIO
            packaging_cost: 0.00,
            fixed_profit_margin: 0.00, // Será calculado na venda
            materials: {
                create: [
                    { material_type: 'PLA', required_weight_grams: 30 } // Coluna "QUANTIDADE NECESSARIA DE MATERIAL"
                ]
            },
            addons: {
                create: [
                    { name: 'Mangueira De Nível Cristal 10 Metros', cost_unit: 0.42 }
                ]
            }
        }
    });

    // Produto 2: SCULTURE DA JULHA
    await prisma.product.create({
        data: {
            tenant_id: TENANT_ID,
            name: 'Sculture da Julha',
            category: 'PRESENTE',
            base_print_time_minutes: 420, // 7 horas * 60
            preparation_time_minutes: 0,
            packaging_cost: 0.00,
            fixed_profit_margin: 0.00,
            materials: {
                create: [
                    { material_type: 'PLA', required_weight_grams: 270 }
                ]
            }
        }
    });

    // Produto 3: SUPORTE NOTEBOOK VERTICAL
    // Na planilha diz "Tempo de impressão: 5" (assumindo horas) = 300 min
    await prisma.product.create({
        data: {
            tenant_id: TENANT_ID,
            name: 'Suporte Notebook Vertical',
            category: 'SETUP',
            base_print_time_minutes: 300,
            preparation_time_minutes: 0,
            packaging_cost: 0.00,
            fixed_profit_margin: 0.00,
            materials: {
                create: [
                    { material_type: 'PLA', required_weight_grams: 146 }
                ]
            }
        }
    });

    // ===========================================================================
    // 8. PEDIDOS (Baseado no exemplo do usuário)
    // ===========================================================================

    // Buscar produto "Suporte Notebook Vertical"
    const productSuporte = await prisma.product.findFirst({
        where: { name: 'Suporte Notebook Vertical' }
    });

    if (productSuporte) {
        // Dados do exemplo:
        // Custo Filamento: 13.46 (para 146g) -> Custo/g = 13.46 / 146 = 0.09219
        // Custo Energia/Deprec: 15.15 (Total Maquina?)
        // Venda: 37.00
        // Lucro: 21.85

        // Vamos criar um pedido simulando esses valores
        await prisma.order.create({
            data: {
                tenant_id: TENANT_ID,
                client_id: clientDouglas.id,
                product_id: productSuporte.id,
                printer_id: printerBambu.id,

                platform_name: 'Venda Direta',
                platform_fee_percent: 0.00,
                scrap_rate_percent: 10.00,

                print_time_minutes: 180, // 3 horas do exemplo (vs 300 do cadastro)

                filament_1_id: filMarrom.id, // Usando o marrom como exemplo
                filament_1_grams_used: 146,

                // Valores calculados manualmente baseados no exemplo do user para bater com o histórico
                final_material_cost: 13.46,
                final_energy_cost: 5.00, // Estimativa para compor os 15.15
                final_depreciation_cost: 10.15, // Estimativa
                final_labor_cost: 0.00,
                final_platform_fee: 0.00,

                selling_price: 37.00,
                net_profit: 21.85
            }
        });
        console.log('📦 Pedido de exemplo criado: Suporte Notebook Vertical');
    }

    console.log('✅ Seed finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
