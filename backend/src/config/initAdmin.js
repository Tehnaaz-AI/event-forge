import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

export async function initSuperAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || 'Platform Super Admin';

  if (!adminEmail || !adminPassword) {
    return;
  }

  try {
    let admin = await User.findOne({ email: adminEmail }).select('+passwordHash');
    if (!admin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'PLATFORM_ADMIN',
        status: 'ACTIVE'
      });
      console.log(`👑 Super Admin account initialized from .env: ${adminEmail}`);
    } else {
      let updated = false;
      if (admin.role !== 'PLATFORM_ADMIN') {
        admin.role = 'PLATFORM_ADMIN';
        updated = true;
      }
      if (adminName && admin.name !== adminName) {
        admin.name = adminName;
        updated = true;
      }
      if (updated) {
        await admin.save();
        console.log(`👑 Super Admin permissions synced for: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error('Error initializing super admin from .env:', err.message);
  }
}
