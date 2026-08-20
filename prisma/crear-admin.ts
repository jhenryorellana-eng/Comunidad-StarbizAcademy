import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Alta de una cuenta de administrador.
 *
 * ADITIVO E IDEMPOTENTE: si el correo ya existe, actualiza el rol y la
 * contraseña en vez de fallar. Se puede repetir sin romper nada.
 *
 * La contraseña NO va escrita aquí: llega por variable de entorno, para que no
 * acabe en el repositorio ni en el historial de la terminal.
 *
 *   ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npx tsx prisma/crear-admin.ts
 *
 * Para revertir:
 *   DELETE FROM "User" WHERE email = '<el correo>';
 */
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Dirección StarbizAcademy";

  if (!email || !password) {
    console.error("  Faltan ADMIN_EMAIL o ADMIN_PASSWORD.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("  La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  // El mismo coste de hash que usa el registro de la app, para que la
  // verificación al iniciar sesión funcione igual que con cualquier otra cuenta.
  const passwordHash = await bcrypt.hash(password, 10);

  const existente = await prisma.user.findUnique({ where: { email } });

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
      building: "Dirección",
    },
    update: { passwordHash, role: "ADMIN" },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log(`  ${existente ? "ACTUALIZADA" : "CREADA"}: ${user.name} <${user.email}> · ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
