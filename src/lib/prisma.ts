// Conexao com o banco
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/index.js"

const connectionString: string = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma: PrismaClient = new PrismaClient({ adapter })

export { prisma }
