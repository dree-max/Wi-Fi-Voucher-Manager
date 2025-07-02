import { db } from "./db";
import { voucherPlans, vouchers } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // Create sample voucher plans
    const plans = await db.insert(voucherPlans).values([
      {
        name: "Basic",
        duration: 60, // 1 hour
        dataLimit: 500, // 500MB
        speedLimitDown: 5,
        speedLimitUp: 2,
        maxDevices: 1,
        price: "2.99",
        isActive: true,
      },
      {
        name: "Standard", 
        duration: 240, // 4 hours
        dataLimit: 2048, // 2GB
        speedLimitDown: 15,
        speedLimitUp: 5,
        maxDevices: 2,
        price: "7.99",
        isActive: true,
      },
      {
        name: "Premium",
        duration: 1440, // 24 hours
        dataLimit: null, // Unlimited
        speedLimitDown: 50,
        speedLimitUp: 20,
        maxDevices: 5,
        price: "19.99",
        isActive: true,
      },
      {
        name: "Guest Pass",
        duration: 30, // 30 minutes
        dataLimit: 100, // 100MB
        speedLimitDown: 2,
        speedLimitUp: 1,
        maxDevices: 1,
        price: "0.00",
        isActive: true,
      }
    ]).returning();

    console.log(`Created ${plans.length} voucher plans`);

    // Create some sample vouchers with known codes for testing
    const sampleVouchers = [
      // Test vouchers with known codes
      { code: "WIFI-2024-TEST01", planId: plans[0].id, status: 'active' as const, validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { code: "WIFI-2024-TEST02", planId: plans[1].id, status: 'active' as const, validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { code: "WIFI-2024-TEST03", planId: plans[2].id, status: 'active' as const, validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { code: "WIFI-2024-GUEST", planId: plans[3].id, status: 'active' as const, validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { code: "WIFI-2024-USED01", planId: plans[0].id, status: 'used' as const, validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    ];

    // Add some random vouchers
    for (let i = 0; i < 15; i++) {
      const planId = plans[Math.floor(Math.random() * plans.length)].id;
      const code = `WIFI-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      sampleVouchers.push({
        code,
        planId,
        status: Math.random() > 0.7 ? 'used' : 'active' as const,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
      });
    }

    const createdVouchers = await db.insert(vouchers).values(sampleVouchers).returning();
    console.log(`Created ${createdVouchers.length} sample vouchers`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seed().then(() => process.exit(0));
}

export { seed };