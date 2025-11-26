-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "electricity_cost_kwh" DECIMAL(10,4) NOT NULL,
    "labor_rate_hourly" DECIMAL(10,2) NOT NULL,
    "currency_symbol" TEXT NOT NULL DEFAULT E'R$',

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "printers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purchase_price" DECIMAL(65,30) NOT NULL,
    "shipping_cost" DECIMAL(65,30) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "lifespan_hours" INTEGER NOT NULL,
    "power_consumption_watts" INTEGER NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filaments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "material_type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "purchase_price" DECIMAL(65,30) NOT NULL,
    "shipping_cost" DECIMAL(65,30) NOT NULL,
    "weight_grams" INTEGER NOT NULL DEFAULT 1000,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "filaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "base_print_time_minutes" INTEGER NOT NULL,
    "packaging_cost" DECIMAL(65,30) NOT NULL,
    "preparation_time_minutes" INTEGER NOT NULL,
    "fixed_profit_margin" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_materials" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "material_type" TEXT NOT NULL,
    "required_weight_grams" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "product_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_addons" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost_unit" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "product_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "phone" TEXT,
    "source" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "printer_id" TEXT NOT NULL,
    "platform_name" TEXT NOT NULL,
    "platform_fee_percent" DECIMAL(65,30) NOT NULL,
    "scrap_rate_percent" DECIMAL(65,30) NOT NULL,
    "filament_1_id" TEXT,
    "filament_2_id" TEXT,
    "final_material_cost" DECIMAL(65,30) NOT NULL,
    "final_energy_cost" DECIMAL(65,30) NOT NULL,
    "final_depreciation_cost" DECIMAL(65,30) NOT NULL,
    "final_labor_cost" DECIMAL(65,30) NOT NULL,
    "final_platform_fee" DECIMAL(65,30) NOT NULL,
    "selling_price" DECIMAL(65,30) NOT NULL,
    "net_profit" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_addons" ADD CONSTRAINT "product_addons_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
