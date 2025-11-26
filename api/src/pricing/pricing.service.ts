import { Injectable } from '@nestjs/common';
import { Product, Filament, Printer, Settings, ProductAddon } from '@prisma/client';

export type ProductWithAddons = Product & { addons: ProductAddon[] };
export type FilamentWithUsage = Filament & { grams_used: number };

@Injectable()
export class PricingService {

    calculateFilamentCostPerGram(price: number | string, shipping: number | string, weightGrams: number): number {
        if (weightGrams === 0) return 0;
        return (Number(price) + Number(shipping)) / weightGrams;
    }

    calculateMachineHourlyCost(printer: Printer, settings: Settings): number {
        const energyCost = (printer.power_consumption_watts / 1000) * Number(settings.electricity_cost_kwh);
        const depreciation = Number(printer.purchase_price) / printer.lifespan_hours;
        return energyCost + depreciation;
    }

    calculateOrderPricing(
        product: ProductWithAddons,
        filaments: FilamentWithUsage[], // Array of filaments used (up to 4)
        printer: Printer,
        settings: Settings,
        markup: number, // Profit Margin (e.g., 0.5 for 50%)
        platformFeePercent: number, // e.g., 14
        scrapRatePercent: number, // e.g., 10
        printTimeMinutes: number, // Real print time
        preparationTimeMinutes: number = 0 // Optional override
    ) {
        // 1. Custo Material (com taxa de sucata/falha)
        const scrapMultiplier = 1 + (scrapRatePercent / 100);

        const materialCost = filaments.reduce((acc, fil) => {
            const costPerGram = this.calculateFilamentCostPerGram(
                Number(fil.purchase_price),
                Number(fil.shipping_cost),
                fil.weight_grams
            );
            const cost = fil.grams_used * costPerGram;
            return acc + cost;
        }, 0) * scrapMultiplier;

        // 2. Custo Tempo (Energia + Depreciação)
        const machineHourlyCost = this.calculateMachineHourlyCost(printer, settings);
        const printTimeHours = printTimeMinutes / 60;
        const machineTotalCost = machineHourlyCost * printTimeHours;

        // Split machine cost into energy and depreciation for reporting
        const energyCostPerHour = (printer.power_consumption_watts / 1000) * Number(settings.electricity_cost_kwh);
        const depreciationPerHour = Number(printer.purchase_price) / printer.lifespan_hours;

        const finalEnergyCost = energyCostPerHour * printTimeHours;
        const finalDepreciationCost = depreciationPerHour * printTimeHours;

        // 3. Custo Mão de Obra (Manuseio + Montagem)
        // Use product default if override not provided, or 0
        const prepTime = preparationTimeMinutes || product.preparation_time_minutes || 0;
        const laborCost = (prepTime / 60) * Number(settings.labor_rate_hourly);

        // 4. Extras
        const addonsCost = product.addons.reduce((sum, item) => sum + Number(item.cost_unit), 0);
        const packaging = Number(product.packaging_cost);

        // CUSTO TOTAL DE PRODUÇÃO (CT)
        const totalProductionCost = materialCost + finalEnergyCost + finalDepreciationCost + laborCost + addonsCost + packaging;

        // CÁLCULO REVERSO PARA PREÇO DE VENDA
        // Fórmula: Venda = (Custo + LucroDesejado) / (1 - TaxaPlataforma)

        // Se o markup for porcentagem sobre o custo (Ex: 59.04% do exemplo do user parece ser lucro sobre venda ou custo? Vamos assumir markup sobre custo por enquanto ou ajustar)
        // O user deu exemplo: CUSTO MERCADORIA 15.15, VENDA 37.00. LUCRO 21.85.
        // 37.00 - 15.15 = 21.85. Mas tem taxa? "TAXA DE PLATAFORMA ($) 0". Ah, no exemplo dele ta 0.
        // Se tiver taxa: Venda = (Custo + Margem) / (1 - Fee)

        const desiredProfit = totalProductionCost * markup;
        const feeDecimal = platformFeePercent / 100;

        let sellingPrice = 0;
        if (feeDecimal < 1) {
            sellingPrice = (totalProductionCost + desiredProfit) / (1 - feeDecimal);
        }

        const platformFeeValue = sellingPrice * feeDecimal;
        const netProfit = sellingPrice - platformFeeValue - totalProductionCost;

        return {
            custo_total: totalProductionCost,
            final_material_cost: materialCost,
            final_energy_cost: finalEnergyCost,
            final_depreciation_cost: finalDepreciationCost,
            final_labor_cost: laborCost,
            final_platform_fee: platformFeeValue,
            preco_venda_sugerido: sellingPrice,
            lucro_liquido: netProfit
        };
    };
}
