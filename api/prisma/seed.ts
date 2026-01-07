import { execSync } from 'child_process';

const seedFiles = [
  'seed-settings.ts', // 1º - Configurações globais
  'seed-printers.ts', // 2º - Impressoras
  'seed-filaments.ts', // 3º - Filamentos
  'seed-clients.ts', // 4º - Clientes
  'seed-products.ts', // 5º - Produtos
  'seed-orders.ts', // 6º - Pedidos (depende de tudo)
];

async function runAllSeeds() {
  console.log('🌱 Executando todos os seeds na ordem correta...\n');

  for (const file of seedFiles) {
    console.log(`📦 Rodando: ${file}`);
    try {
      execSync(`ts-node prisma/${file}`, { stdio: 'inherit' });
      console.log(`✅ ${file} concluído!\n`);
    } catch (error) {
      console.error(`❌ Erro ao executar ${file}`);
      process.exit(1);
    }
  }

  console.log('\n🎉 Todos os seeds executados com sucesso!');
}

runAllSeeds();
