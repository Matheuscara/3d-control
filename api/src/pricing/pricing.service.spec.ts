import { Test, TestingModule } from '@nestjs/testing';
import { PricingService, FilamentWithUsage, ProductWithAddons } from './pricing.service';
import { Prisma } from '@prisma/client';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate filament cost per gram correctly', () => {
    const cost = service.calculateFilamentCostPerGram(88.10, 7.50, 1000);
    expect(cost).toBeCloseTo(0.0956);
  });

  it('should calculate machine hourly cost correctly', () => {
    const printer = {
      power_consumption_watts: 170,
      purchase_price: new Prisma.Decimal(3298.00),
      lifespan_hours: 8000,
    } as any;

    const settings = {
      electricity_cost_kwh: new Prisma.Decimal(0.96),
    } as any;

    const cost = service.calculateMachineHourlyCost(printer, settings);
    // Energy: 0.17 * 0.96 = 0.1632
    // Deprec: 3298 / 8000 = 0.41225
    // Total: 0.57545
    expect(cost).toBeCloseTo(0.57545);
  });

  it('should calculate order pricing correctly', () => {
    const product: ProductWithAddons = {
      base_print_time_minutes: 600, // 10 hours
      preparation_time_minutes: 30, // 0.5 hours
      packaging_cost: new Prisma.Decimal(2.00),
      addons: [{ cost_unit: new Prisma.Decimal(0.50) }] as any,
    } as any;

    const filaments: FilamentWithUsage[] = [
      {
        purchase_price: new Prisma.Decimal(88.10),
        shipping_cost: new Prisma.Decimal(7.50),
        weight_grams: 1000,
        grams_used: 100,
      } as any
    ];

    const printer = {
      power_consumption_watts: 170,
      purchase_price: new Prisma.Decimal(3298.00),
      lifespan_hours: 8000,
    } as any;

    const settings = {
      electricity_cost_kwh: new Prisma.Decimal(0.96),
      labor_rate_hourly: new Prisma.Decimal(10.00),
    } as any;

    // 1. Material: 100g * 0.0956 = 9.56. Scrap 10% -> 10.516
    // 2. Machine: 0.57545 * 10h = 5.7545
    // 3. Labor: 0.5h * 10.00 = 5.00
    // 4. Extras: 0.50 + 2.00 = 2.50
    // Total Cost: 10.516 + 5.7545 + 5.00 + 2.50 = 23.7705

    // Markup 50% (0.5)
    // Platform Fee 14% (0.14)
    // Desired Profit = 23.7705 * 0.5 = 11.88525
    // Selling Price = (23.7705 + 11.88525) / (1 - 0.14) = 35.65575 / 0.86 = 41.46017

    const result = service.calculateOrderPricing(
      product,
      filaments,
      printer,
      settings,
      0.5,
      14
    );

    expect(result.custo_total).toBeCloseTo(23.7705);
    expect(result.preco_venda_sugerido).toBeCloseTo(41.46017);
  });
});
