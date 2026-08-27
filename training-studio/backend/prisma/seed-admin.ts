// Crea el primer entrenador ADMIN del Training Studio (no hay auto-registro
// público: el resto de las cuentas se crean vía POST /auth/register, que
// requiere estar ya autenticado como ADMIN).
//
// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_FIRST_NAME=... ADMIN_LAST_NAME=... npm run seed:admin
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@training-studio.local';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'Training Studio';

  const existing = await prisma.trainer.findUnique({ where: { email } });
  if (existing) {
    console.log(`Ya existe un entrenador con el email ${email}, no se crea de nuevo.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const trainer = await prisma.trainer.create({
    data: { email, passwordHash, firstName, lastName, role: 'ADMIN' },
  });

  console.log(`Entrenador ADMIN creado: ${trainer.email} (contraseña: ${password})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
