/*
  Warnings:

  - You are about to alter the column `platform_fee_percent` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `scrap_rate_percent` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `final_material_cost` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `final_energy_cost` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `final_depreciation_cost` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `final_labor_cost` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `final_platform_fee` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `selling_price` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `net_profit` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Added the required column `print_time_minutes` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "filament_1_grams_used" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "filament_2_grams_used" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "filament_3_grams_used" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "filament_3_id" TEXT,
ADD COLUMN     "filament_4_grams_used" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "filament_4_id" TEXT,
ADD COLUMN     "print_time_minutes" INTEGER NOT NULL,
ALTER COLUMN "platform_fee_percent" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "scrap_rate_percent" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "final_material_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "final_energy_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "final_depreciation_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "final_labor_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "final_platform_fee" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "selling_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "net_profit" SET DATA TYPE DECIMAL(10,2);
