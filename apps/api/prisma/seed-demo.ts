import { PrismaClient, Prisma } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();
const DEMO_EMAIL = "demo@example.com";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log("Demo user already exists, skipping.");
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash: await argon2.hash("demopassword123"),
      name: "Demo User",
      currency: "USD",
    },
  });

  const bank = await prisma.account.create({
    data: { userId: user.id, name: "Main Checking", type: "BANK", currency: "USD", openingBalance: new Prisma.Decimal(2500) },
  });
  const cash = await prisma.account.create({
    data: { userId: user.id, name: "Cash Wallet", type: "CASH", currency: "USD", openingBalance: new Prisma.Decimal(150) },
  });
  const crypto = await prisma.account.create({
    data: { userId: user.id, name: "Crypto Wallet", type: "CRYPTO", currency: "USD", openingBalance: new Prisma.Decimal(0.05) },
  });

  const salary = await prisma.category.findFirst({ where: { userId: null, name: "Salary" } });
  const groceries = await prisma.category.findFirst({ where: { userId: null, name: "Groceries" } });
  const dining = await prisma.category.findFirst({ where: { userId: null, name: "Dining Out" } });

  const now = new Date();
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        accountId: bank.id,
        categoryId: salary?.id,
        type: "INCOME",
        amount: new Prisma.Decimal(3200),
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        merchant: "Employer Inc.",
      },
      {
        userId: user.id,
        accountId: bank.id,
        categoryId: groceries?.id,
        type: "EXPENSE",
        amount: new Prisma.Decimal(84.32),
        date: new Date(now.getFullYear(), now.getMonth(), 3),
        merchant: "Whole Foods",
      },
      {
        userId: user.id,
        accountId: cash.id,
        categoryId: dining?.id,
        type: "EXPENSE",
        amount: new Prisma.Decimal(22.5),
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        merchant: "Local Cafe",
      },
      {
        userId: user.id,
        accountId: bank.id,
        toAccountId: cash.id,
        type: "TRANSFER",
        amount: new Prisma.Decimal(100),
        date: new Date(now.getFullYear(), now.getMonth(), 6),
        note: "ATM withdrawal",
      },
    ],
  });

  console.log(`Demo user created: ${DEMO_EMAIL} / demopassword123`);
  console.log(`Accounts: ${bank.name}, ${cash.name}, ${crypto.name}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
