# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

3D Print SaaS management system that transforms Excel-based printing business calculations into a reactive web application. The system manages printers, filaments, products, orders, and performs real-time pricing calculations accounting for material costs, machine depreciation, energy, labor, and platform fees (Shopee, Mercado Livre, etc).

**Stack:**
- Backend: NestJS + Prisma ORM + PostgreSQL
- Frontend: Angular 21 with Signals (planned, not yet implemented)
- Database: PostgreSQL via Docker Compose

## Development Setup

### Prerequisites
1. Start PostgreSQL database:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
cd api
npm install
```

3. Run Prisma migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Seed the database:
```bash
npm run seed
```

### Running the Application

**Development mode (with hot reload):**
```bash
cd api
npm run start:dev
```
Server runs on `http://localhost:3000` with CORS enabled.

**Production mode:**
```bash
npm run build
npm run start:prod
```

### Database Management

**Generate Prisma Client after schema changes:**
```bash
npx prisma generate
```

**Create new migration:**
```bash
npx prisma migrate dev --name migration_description
```

**Reset database and re-seed:**
```bash
npx prisma migrate reset
```

**Seed database:**
```bash
npm run seed
```
Note: Current seed script runs `seed-filaments.ts` as defined in package.json. Use `ts-node prisma/seed-<module>.ts` for other seed files.

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Architecture

### Module Structure
The backend follows NestJS modular architecture with domain-driven design:

```
api/src/
├── prisma/          # Database service
├── pricing/         # Core business logic for cost calculations
├── settings/        # Global settings (electricity cost, labor rate)
├── printers/        # 3D printer assets management
├── filaments/       # Filament inventory
├── products/        # Product catalog with materials & addons
├── clients/         # Customer management
├── orders/          # Order processing with financial snapshots
└── assets/          # Other business assets
```

### Database Schema Key Concepts

**Multi-tenancy:** All tables include `tenant_id` to support SaaS model (multiple users/businesses).

**Core Entities:**

1. **Settings** - Global configuration per tenant
   - `electricity_cost_kwh`: Cost per kWh for energy calculations
   - `labor_rate_hourly`: Hourly labor rate

2. **Printer** - 3D printer assets
   - Tracks purchase price, lifespan, power consumption
   - Used to calculate depreciation and energy costs per print

3. **Filament** - Material inventory
   - Brand, material type, color, purchase info
   - `stock_quantity`: Number of spools available
   - Cost per gram calculated from purchase price + shipping

4. **Product** - Product catalog
   - Base print time, packaging cost, preparation time
   - Relations:
     - `ProductMaterial[]`: Required materials with gram amounts
     - `ProductAddon[]`: Extra components (screws, tubes, etc)

5. **Order** - Sales records with financial snapshots
   - **Supports up to 4 filament slots** (`filament_1_id` through `filament_4_id` with corresponding `grams_used`)
   - **Financial snapshot fields** freeze costs at order time:
     - `final_material_cost`, `final_energy_cost`, `final_depreciation_cost`
     - `final_labor_cost`, `final_platform_fee`
   - Platform-specific: `platform_name`, `platform_fee_percent`
   - `scrap_rate_percent`: Failure/waste percentage (e.g., 10%)

### Core Business Logic (PricingService)

The pricing service at `api/src/pricing/pricing.service.ts` implements the critical calculation formulas that replicate Excel functionality:

**1. Filament Cost Calculation:**
```typescript
cost_per_gram = (purchase_price + shipping_cost) / weight_grams
```

**2. Machine Hourly Cost:**
```typescript
energy_cost = (power_watts / 1000) * electricity_cost_kwh
depreciation = purchase_price / lifespan_hours
machine_hourly_cost = energy_cost + depreciation
```

**3. Order Pricing (Reverse Calculation for Platform Fees):**
The system calculates selling price accounting for platform fees (Shopee/ML):

```
Material Cost = Σ(filament_grams_used * cost_per_gram) * (1 + scrap_rate)
Machine Cost = machine_hourly_cost * (print_time_minutes / 60)
Labor Cost = (preparation_time_minutes / 60) * labor_rate_hourly
Total Production Cost = Material + Machine + Labor + Addons + Packaging

Desired Profit = Total Production Cost * markup
Selling Price = (Total Production Cost + Desired Profit) / (1 - platform_fee_percent)
Net Profit = Selling Price - Platform Fee - Total Production Cost
```

**Why Reverse Calculation:** Platform fees are percentage of selling price, not cost. To achieve desired profit margin after fees, the formula works backwards from the final sale price.

### Frontend Integration (Angular - Planned)

The frontend will use **Angular Signals** for reactive price calculation:
- User selects: Product → Printer → Filaments → Platform → Markup
- `computed()` signals update costs in real-time without "Calculate" button
- Mimics Excel spreadsheet reactivity

See `ai.app.assistant.md` for detailed API contracts and data types.

## Important Notes

### Port Conflicts
If you encounter `EADDRINUSE: address already in use :::3000`:
```bash
# Windows
netstat -ano | findstr :3000
cmd //c "taskkill /PID <pid> /F"

# Unix
lsof -ti:3000 | xargs kill -9
```

### Database Connection
The `.env` file contains the database connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/3dprint_saas?schema=public"
```
Ensure Docker Compose is running before starting the app.

### Decimal Precision
Prisma models use `Decimal` type for financial calculations to avoid floating-point errors. Always convert to `Number()` in calculations and validate against zero division.

### Seed Data
Multiple seed files exist in `api/prisma/`:
- `seed-settings.ts` - Default settings
- `seed-printers.ts` - Example printers
- `seed-filaments.ts` - Filament inventory
- `seed-products.ts` - Product catalog
- `seed-clients.ts` - Sample clients
- `seed-orders.ts` - Order examples

Run individual seeds with: `ts-node prisma/seed-<module>.ts`

## Business Context

This system serves makers and 3D printing farms (from hobby to B2B). The platform pricing model (see doc.md) plans for:
- **Maker Plan**: Up to 2 printers, simple calculations
- **Farm Plan**: Unlimited printers, platform fee reverse calculation, inventory management, CRM

The core differentiator is accurate platform fee calculation for marketplaces like Shopee (14%) and Mercado Livre (variable rates).
