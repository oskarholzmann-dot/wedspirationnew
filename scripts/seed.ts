import { config } from "dotenv";

/**
 * npm run db:seed — fill the database with sample data, if it is still empty.
 * With DATABASE_URL (Neon) run "npm run db:migrate" first; the demo database migrates itself.
 */
config({ path: ".env.local" });

const { getDb } = await import("../db");
const { seedDatabase } = await import("../db/seed");

const db = await getDb();
const existingUser = await db.query.users.findFirst({ columns: { id: true } });

if (existingUser) {
  console.log("The database already has data; nothing was seeded.");
} else {
  await seedDatabase(db);
  console.log("Sample data created. Log in as admin@admin.com / password.");
}
