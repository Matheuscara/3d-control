import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PricingModule } from './pricing/pricing.module';
import { ClientsModule } from './clients/clients.module';
import { AssetsModule } from './assets/assets.module';
import { FilamentsModule } from './filaments/filaments.module';
import { PrintersModule } from './printers/printers.module';
import { ProductsModule } from './products/products.module';
import { SettingsModule } from './settings/settings.module';
import { OrdersModule } from './orders/orders.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, PricingModule, ClientsModule, AssetsModule, FilamentsModule, PrintersModule, ProductsModule, SettingsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
