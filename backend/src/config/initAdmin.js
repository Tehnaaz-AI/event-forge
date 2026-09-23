import bcrypt from 'bcryptjs';
import { User, Organization } from '../models/index.js';

export async function initSuperAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || 'Platform Super Admin';

  if (!adminEmail || !adminPassword) {
    return;
  }

  try {
    let adminOrg = await Organization.findOne({ contactEmail: adminEmail });
    if (!adminOrg) {
      adminOrg = await Organization.create({
        name: 'EventForge Global Enterprise',
        contactEmail: adminEmail,
        industry: 'Conference & Event Technology',
        subscriptionPlan: 'Enterprise VIP',
        subscriptionStatus: 'ACTIVE'
      });
      console.log('🏛️ Enterprise Organization created for Super Admin');
    }

    let admin = await User.findOne({ email: adminEmail }).select('+passwordHash');
    if (!admin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'PLATFORM_ADMIN',
        organization: adminOrg._id,
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
      if (!admin.organization) {
        admin.organization = adminOrg._id;
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
