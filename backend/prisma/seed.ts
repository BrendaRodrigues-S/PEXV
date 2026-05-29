import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_EMAIL
  const name = process.env.SEED_NAME
  const password = process.env.SEED_PASSWORD

  if (!email || !name || !password) {
    throw new Error('Set SEED_EMAIL, SEED_NAME and SEED_PASSWORD before running seed')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return

  await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
