/**
 * EventForge - Production Database Reset Script
 * Clears mock/test records and initializes the Platform Super Admin account.
 * Run: node clean-db.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Organization, Event, Session, TicketCategory, Registration, Ticket, Sponsor, SponsorshipPackage, SponsorDeliverable, Feedback, Announcement, Coupon, EventStaff, SessionRegistration } from './src/models/index.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventforge';

async function cleanAndInit() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB:', uri);

    // Delete all transactional & test collections
    await Promise.all([
      Organization.deleteMany({}),
      User.deleteMany({}),
      Event.deleteMany({}),
      Session.deleteMany({}),
      TicketCategory.deleteMany({}),
      Registration.deleteMany({}),
      Ticket.deleteMany({}),
      Sponsor.deleteMany({}),
      SponsorshipPackage.deleteMany({}),
      SponsorDeliverable.deleteMany({}),
      Feedback.deleteMany({}),
      Announcement.deleteMany({}),
      Coupon.deleteMany({}),
      EventStaff.deleteMany({}),
      SessionRegistration.deleteMany({})
    ]);
    console.log('🧹 Purged all fake, mock, and test collections successfully.');

    // Create Initial Production Super Admin Organization & User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@eventforge.demo').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const adminOrgName = process.env.ADMIN_ORG || 'EventForge Global Systems';

    const org = await Organization.create({
      name: adminOrgName,
      contactEmail: adminEmail,
      subscriptionPlan: 'Enterprise',
      subscriptionStatus: 'ACTIVE'
    });

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const adminName = process.env.ADMIN_NAME || 'Platform Administrator';

    const superAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'PLATFORM_ADMIN',
      organization: org._id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
    });

    console.log('\n🚀 Production Database Ready:');
    console.log(`- Super Admin: ${superAdmin.email}`);
    console.log(`- Organization: ${org.name}`);
    console.log(`- Role: ${superAdmin.role}`);
    console.log('\nYou can now start fresh in production or deploy to cloud hosting.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

cleanAndInit();
