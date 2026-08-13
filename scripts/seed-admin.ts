/**
 * Creates the first superadmin account. Run once after setting up your
 * database:
 *
 *   npx tsx scripts/seed-admin.ts
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from env, or falls back
 * to the defaults below — change the password immediately after first login.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI as string;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@barberco.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';

async function main() {
  if (!MONGODB_URI) {
    throw new Error('Set MONGODB_URI in your .env.local before running this script.');
  }

  await mongoose.connect(MONGODB_URI);

  const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: 'superadmin',
    status: 'active',
    permissions: [],
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✅ Superadmin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('Log in and change this password immediately.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
