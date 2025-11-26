export class CreateOrderDto {
    tenant_id: string;
    client_id: string;
    product_id: string;
    printer_id: string;

    platform_name: string;
    platform_fee_percent: number;
    scrap_rate_percent: number;

    print_time_minutes: number;

    filament_1_id?: string;
    filament_1_grams_used?: number;

    filament_2_id?: string;
    filament_2_grams_used?: number;

    filament_3_id?: string;
    filament_3_grams_used?: number;

    filament_4_id?: string;
    filament_4_grams_used?: number;

    markup_percent: number; // e.g. 50 for 50%
}

