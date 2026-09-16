import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db.js';
import { 
  User, Organization, Event, Session, TicketCategory, 
  Registration, Ticket, SessionRegistration, Feedback, 
  Announcement, Coupon, Sponsor, SponsorshipPackage, 
  SponsorDeliverable, EventStaff, Inquiry 
} from '../models/index.js';

async function purgeAtlasData() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    await connectDb();
  } catch (err) {
    console.error('❌ Connection failed. Please ensure your IP address is whitelisted in MongoDB Atlas Network Access.');
    process.exit(1);
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@eventforge.com').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || 'Admin@12345').trim();
  const adminName = (process.env.ADMIN_NAME || 'Platform Administrator').trim();

  console.log(`🛡️ Preserving Master Admin: ${adminName} (${adminEmail})`);

  try {
    // 1. Delete all non-admin data collections
    const [
      eventsDeleted,
      sessionsDeleted,
      categoriesDeleted,
      registrationsDeleted,
      ticketsDeleted,
      sessionRegsDeleted,
      feedbacksDeleted,
      announcementsDeleted,
      couponsDeleted,
      sponsorsDeleted,
      packagesDeleted,
      deliverablesDeleted,
      staffDeleted,
      inquiriesDeleted,
      orgsDeleted
    ] = await Promise.all([
      Event.deleteMany({}),
      Session.deleteMany({}),
      TicketCategory.deleteMany({}),
      Registration.deleteMany({}),
      Ticket.deleteMany({}),
      SessionRegistration.deleteMany({}),
      Feedback.deleteMany({}),
      Announcement.deleteMany({}),
      Coupon.deleteMany({}),
      Sponsor.deleteMany({}),
      SponsorshipPackage.deleteMany({}),
      SponsorDeliverable.deleteMany({}),
      EventStaff.deleteMany({}),
      Inquiry.deleteMany({}),
      Organization.deleteMany({})
    ]);

    // 2. Delete all users except the Admin Email
    const usersDeleted = await User.deleteMany({ email: { $ne: adminEmail } });

    // 3. Ensure the Super Admin account exists and is pristine
    let admin = await User.findOne({ email: adminEmail }).select('+passwordHash');
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'PLATFORM_ADMIN',
        status: 'ACTIVE'
      });
      console.log(`✅ Super Admin account created: ${adminEmail}`);
    } else {
      admin.name = adminName;
      admin.passwordHash = passwordHash;
      admin.role = 'PLATFORM_ADMIN';
      admin.status = 'ACTIVE';
      admin.organization = undefined;
      await admin.save();
      console.log(`✅ Super Admin account verified & updated: ${adminEmail}`);
    }

    console.log('\n=============================================');
    console.log('🎉 ATLAS DATA PURGE COMPLETE (CLEAN STATE)');
    console.log('=============================================');
    console.log(`• Events Removed: ${eventsDeleted.deletedCount}`);
    console.log(`• Sessions Removed: ${sessionsDeleted.deletedCount}`);
    console.log(`• Passes & Categories Removed: ${categoriesDeleted.deletedCount + ticketsDeleted.deletedCount}`);
    console.log(`• Registrations Removed: ${registrationsDeleted.deletedCount}`);
    console.log(`• Non-Admin Users Removed: ${usersDeleted.deletedCount}`);
    console.log(`• Inquiries & Feedback Removed: ${inquiriesDeleted.deletedCount + feedbacksDeleted.deletedCount}`);
    console.log(`• Organizations & Sponsors Removed: ${orgsDeleted.deletedCount + sponsorsDeleted.deletedCount}`);
    console.log('---------------------------------------------');
    console.log(`👑 Only Admin Retained:`);
    console.log(`   - Name: ${admin.name}`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Role: ${admin.role}`);
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during purge:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

purgeAtlasData();
