/**
 * SAUS CMS — database seed (idempotent).
 * Creates / updates the initial SUPER_ADMIN user.
 *
 * Run:  npm run db:seed   (or:  npx prisma db seed)
 *
 * Override the default credentials via environment variables:
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@saus.org.za';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@SAUS2025!';
  const name = process.env.SEED_ADMIN_NAME || 'Super Administrator';
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: 'SUPER_ADMIN', department: 'Secretariat', isActive: true },
    create: {
      name,
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      department: 'Secretariat',
      isActive: true,
    },
  });

  console.log('✅  Admin user ready:', user.email, '(role:', user.role + ')');
  console.log('    Default password applies only on first creation — change it after first login.');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
