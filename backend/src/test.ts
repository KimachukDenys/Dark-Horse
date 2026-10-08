import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const transactions = await prisma.itemTransaction.findMany({
    where: {
      acquiredAt: null,
    },
    select: {
      id: true,
      createdAt: true,
    },
  })

  console.log(`Found ${transactions.length} transactions to update`)

  for (const tx of transactions) {
    const tradeBanUntil = new Date(tx.createdAt)
    tradeBanUntil.setDate(tradeBanUntil.getDate() + 7)

    await prisma.itemTransaction.update({
      where: {
        id: tx.id,
      },
      data: {
        acquiredAt: tx.createdAt,
        tradeBanUntil,
      },
    })
  }

  console.log("Done")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())