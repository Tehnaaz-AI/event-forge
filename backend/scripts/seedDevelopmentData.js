import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { connectDb } from '../src/config/db.js';
import { 
  User, 
  Organization, 
  Event, 
  Session, 
  TicketCategory, 
  Registration, 
  Ticket, 
  EventStaff, 
  Sponsor, 
  SponsorshipPackage 
} from '../src/models/index.js';

export async function seedDevelopmentData() {
  try {
    await connectDb();
    console.log('🌱 Connected to MongoDB for controlled development bootstrap...');

    const defaultPassword = process.env.DEV_SEED_PASSWORD || 'EventForge2026!';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // ==========================================
    // 1. ORGANIZATIONS (3 Separate Tenancies)
    // ==========================================
    const orgA = await Organization.findOneAndUpdate(
      { name: 'Nexus Tech Innovations' },
      {
        name: 'Nexus Tech Innovations',
        contactEmail: 'contact@nexus.io',
        industry: 'Autonomous Systems & AI',
        subscriptionPlan: 'Enterprise VIP',
        subscriptionStatus: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    const orgB = await Organization.findOneAndUpdate(
      { name: 'Vanguard Cloud Systems' },
      {
        name: 'Vanguard Cloud Systems',
        contactEmail: 'contact@vanguard.io',
        industry: 'Cloud Infrastructure & DevOps',
        subscriptionPlan: 'Enterprise VIP',
        subscriptionStatus: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    const orgC = await Organization.findOneAndUpdate(
      { name: 'Summit Enterprise Media' },
      {
        name: 'Summit Enterprise Media',
        contactEmail: 'contact@summitcorp.io',
        industry: 'FinTech & Capital Markets',
        subscriptionPlan: 'Enterprise VIP',
        subscriptionStatus: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // ==========================================
    // 2. USERS (Exactly 6: 1 Admin, 1 Staff, 1 Attendee, 3 Organizers)
    // ==========================================
    // Platform Admin
    const admin = await User.findOneAndUpdate(
      { email: 'admin@eventforge.com' },
      {
        name: 'Platform Super Admin',
        email: 'admin@eventforge.com',
        passwordHash,
        role: 'PLATFORM_ADMIN',
        status: 'ACTIVE',
        organization: orgA._id
      },
      { upsert: true, new: true }
    );

    // Organizer A
    const organizerA = await User.findOneAndUpdate(
      { email: 'organizer.a@nexus.io' },
      {
        name: 'Dr. Elena Vance (Organizer A)',
        email: 'organizer.a@nexus.io',
        passwordHash,
        role: 'ORGANIZER',
        organization: orgA._id,
        bio: 'VP of AI Infrastructure at Nexus Tech.',
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // Organizer B
    const organizerB = await User.findOneAndUpdate(
      { email: 'organizer.b@vanguard.io' },
      {
        name: 'Marcus Sterling (Organizer B)',
        email: 'organizer.b@vanguard.io',
        passwordHash,
        role: 'ORGANIZER',
        organization: orgB._id,
        bio: 'Principal Cloud Architect at Vanguard.',
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // Organizer C
    const organizerC = await User.findOneAndUpdate(
      { email: 'organizer.c@summitcorp.io' },
      {
        name: 'Victoria Song (Organizer C)',
        email: 'organizer.c@summitcorp.io',
        passwordHash,
        role: 'ORGANIZER',
        organization: orgC._id,
        bio: 'Managing Director at Summit Enterprise Media.',
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // Staff
    const staff = await User.findOneAndUpdate(
      { email: 'staff@eventforge.com' },
      {
        name: 'Alex Rivera (Door Staff)',
        email: 'staff@eventforge.com',
        passwordHash,
        role: 'STAFF',
        organization: orgA._id,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // Attendee 1 (Confirmed Standard)
    const attendee = await User.findOneAndUpdate(
      { email: 'attendee@eventforge.com' },
      {
        name: 'Sarah Jenkins (Delegate)',
        email: 'attendee@eventforge.com',
        passwordHash,
        role: 'ATTENDEE',
        organization: orgA._id,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // Attendee 2 (Confirmed Executive VIP)
    const vipAttendee = await User.findOneAndUpdate(
      { email: 'vip.attendee@eventforge.com' },
      {
        name: 'David Thorne (VIP Executive)',
        email: 'vip.attendee@eventforge.com',
        passwordHash,
        role: 'ATTENDEE',
        organization: orgA._id,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // Attendee 3 (VIP Waitlisted #1)
    const vipWaitlistUser = await User.findOneAndUpdate(
      { email: 'vip.waitlist@eventforge.com' },
      {
        name: 'Rachel Adams (VIP Standby)',
        email: 'vip.waitlist@eventforge.com',
        passwordHash,
        role: 'ATTENDEE',
        organization: orgA._id,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // Attendee 4 (Standard Waitlisted #2)
    const standardWaitlistUser = await User.findOneAndUpdate(
      { email: 'standard.waitlist@eventforge.com' },
      {
        name: 'Liam Chen (Standard Standby)',
        email: 'standard.waitlist@eventforge.com',
        passwordHash,
        role: 'ATTENDEE',
        organization: orgA._id,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    console.log('✓ Provisioned Development Users: 1 Admin, 3 Organizers, 1 Staff, 4 Attendees (Confirmed + VIP + Waitlist)');

    // ==========================================
    // 3. EVENTS (Exactly 3 Conferences: 1 per Organizer)
    // ==========================================
    const now = new Date();
    const startDate1 = new Date(now.getTime() + 7 * 24 * 3600000);
    const endDate1 = new Date(startDate1.getTime() + 2 * 24 * 3600000);

    // Conference 1 -> Organizer A
    const event1 = await Event.findOneAndUpdate(
      { slug: 'global-ai-summit-2026' },
      {
        title: 'Global AI & Autonomous Systems Summit 2026',
        slug: 'global-ai-summit-2026',
        description: 'The premier global executive conference on autonomous agents, enterprise LLM architectures, and zero-trust cloud infrastructure.',
        eventType: 'CONFERENCE',
        category: 'Artificial Intelligence',
        startDate: startDate1,
        endDate: endDate1,
        capacity: 500,
        status: 'REGISTRATION_OPEN',
        organization: orgA._id,
        organizer: organizerA._id,
        venue: {
          name: 'Moscone Convention Center',
          address: '747 Howard St',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        },
        registrationSettings: {
          isRegistrationOpen: true,
          waitlistEnabled: true
        }
      },
      { upsert: true, new: true }
    );

    // Conference 2 -> Organizer B
    const startDate2 = new Date(now.getTime() + 14 * 24 * 3600000);
    const endDate2 = new Date(startDate2.getTime() + 2 * 24 * 3600000);

    const event2 = await Event.findOneAndUpdate(
      { slug: 'cloudscale-devops-world-2026' },
      {
        title: 'CloudScale DevOps & Security World 2026',
        slug: 'cloudscale-devops-world-2026',
        description: 'Deep architectural breakdowns of multi-region Kubernetes, continuous resilience, and automated edge compliance.',
        eventType: 'CONFERENCE',
        category: 'Cybersecurity',
        startDate: startDate2,
        endDate: endDate2,
        capacity: 400,
        status: 'REGISTRATION_OPEN',
        organization: orgB._id,
        organizer: organizerB._id,
        venue: {
          name: 'Seattle Convention Center',
          address: '705 Pike St',
          city: 'Seattle',
          state: 'WA',
          country: 'USA'
        },
        registrationSettings: {
          isRegistrationOpen: true,
          waitlistEnabled: true
        }
      },
      { upsert: true, new: true }
    );

    // Conference 3 -> Organizer C
    const startDate3 = new Date(now.getTime() + 21 * 24 * 3600000);
    const endDate3 = new Date(startDate3.getTime() + 2 * 24 * 3600000);

    const event3 = await Event.findOneAndUpdate(
      { slug: 'future-fintech-expo-2026' },
      {
        title: 'Future of FinTech & Digital Assets Expo 2026',
        slug: 'future-fintech-expo-2026',
        description: 'Executive symposium on real-time cross-border settlement, AI risk modeling, and institutional digital asset compliance.',
        eventType: 'CONFERENCE',
        category: 'Finance & Banking',
        startDate: startDate3,
        endDate: endDate3,
        capacity: 600,
        status: 'REGISTRATION_OPEN',
        organization: orgC._id,
        organizer: organizerC._id,
        venue: {
          name: 'Javits Center',
          address: '429 11th Ave',
          city: 'New York',
          state: 'NY',
          country: 'USA'
        },
        registrationSettings: {
          isRegistrationOpen: true,
          waitlistEnabled: true
        }
      },
      { upsert: true, new: true }
    );

    console.log('✓ Provisioned 3 Conferences (Strict Ownership: Event 1 -> Org A, Event 2 -> Org B, Event 3 -> Org C)');

    // ==========================================
    // 4. TICKET CATEGORIES & REGISTRATIONS FOR EVENT 1
    // ==========================================
    const catStandard = await TicketCategory.findOneAndUpdate(
      { event: event1._id, name: 'General Admission Pass' },
      {
        event: event1._id,
        name: 'General Admission Pass',
        description: 'Full conference access, keynotes, masterclasses, and networking.',
        price: 299,
        capacity: 400,
        availableQuantity: 398
      },
      { upsert: true, new: true }
    );

    const catVIP = await TicketCategory.findOneAndUpdate(
      { event: event1._id, name: 'Executive VIP Pass' },
      {
        event: event1._id,
        name: 'Executive VIP Pass',
        description: 'Fast-track entrance, VIP lounge, and private speaker reception.',
        price: 699,
        capacity: 100,
        availableQuantity: 99
      },
      { upsert: true, new: true }
    );

    // 1. Confirmed Standard Registration
    const reg1 = await Registration.findOneAndUpdate(
      { event: event1._id, attendee: attendee._id },
      {
        event: event1._id,
        attendee: attendee._id,
        ticketCategory: catStandard._id,
        registrationStatus: 'CONFIRMED',
        isVIP: false,
        priorityScore: 0,
        amount: 299
      },
      { upsert: true, new: true }
    );

    const ticketNumber1 = `EF-2026-CONF-1001`;
    const qrCode1 = await QRCode.toDataURL(JSON.stringify({
      registration: String(reg1._id),
      ticketNumber: ticketNumber1,
      attendee: attendee.name,
      event: event1.title
    }));

    await Ticket.findOneAndUpdate(
      { registration: reg1._id },
      {
        registration: reg1._id,
        ticketNumber: ticketNumber1,
        qrCode: qrCode1,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // 2. Confirmed VIP Registration
    const reg2 = await Registration.findOneAndUpdate(
      { event: event1._id, attendee: vipAttendee._id },
      {
        event: event1._id,
        attendee: vipAttendee._id,
        ticketCategory: catVIP._id,
        registrationStatus: 'CONFIRMED',
        isVIP: true,
        priorityScore: 10,
        amount: 699
      },
      { upsert: true, new: true }
    );

    const ticketNumber2 = `EF-VIP-2026-CONF-2001`;
    const qrCode2 = await QRCode.toDataURL(JSON.stringify({
      registration: String(reg2._id),
      ticketNumber: ticketNumber2,
      attendee: vipAttendee.name,
      event: event1.title
    }));

    await Ticket.findOneAndUpdate(
      { registration: reg2._id },
      {
        registration: reg2._id,
        ticketNumber: ticketNumber2,
        qrCode: qrCode2,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    // 3. VIP Waitlisted Registration (Priority Standby #1)
    await Registration.findOneAndUpdate(
      { event: event1._id, attendee: vipWaitlistUser._id },
      {
        event: event1._id,
        attendee: vipWaitlistUser._id,
        ticketCategory: catVIP._id,
        registrationStatus: 'WAITLISTED',
        isVIP: true,
        priorityScore: 10,
        waitlistPosition: 1,
        amount: 699
      },
      { upsert: true, new: true }
    );

    // 4. Standard Waitlisted Registration (Standby #2)
    await Registration.findOneAndUpdate(
      { event: event1._id, attendee: standardWaitlistUser._id },
      {
        event: event1._id,
        attendee: standardWaitlistUser._id,
        ticketCategory: catStandard._id,
        registrationStatus: 'WAITLISTED',
        isVIP: false,
        priorityScore: 0,
        waitlistPosition: 2,
        amount: 299
      },
      { upsert: true, new: true }
    );

    // Assign Staff to Event 1
    await EventStaff.findOneAndUpdate(
      { event: event1._id, user: staff._id },
      {
        event: event1._id,
        user: staff._id,
        role: 'CHECK_IN'
      },
      { upsert: true, new: true }
    );

    // Add Keynote Sessions for Event 1
    await Session.findOneAndUpdate(
      { event: event1._id, title: 'Architecting Autonomous Multi-Agent AI Systems' },
      {
        event: event1._id,
        title: 'Architecting Autonomous Multi-Agent AI Systems',
        description: 'Keynote exploration of distributed agent coordination, deterministic state machines, and real-time observability.',
        room: 'Grand Ballroom A',
        capacity: 400,
        startTime: new Date(startDate1.getTime() + 9 * 3600000),
        endTime: new Date(startDate1.getTime() + 10.5 * 3600000)
      },
      { upsert: true, new: true }
    );

    console.log('✅ Controlled development seed completed successfully.');
    console.log('--------------------------------------------------');
    console.log('Admin:                admin@eventforge.com             | ' + defaultPassword);
    console.log('Organizer A:          organizer.a@nexus.io             | ' + defaultPassword);
    console.log('Organizer B:          organizer.b@vanguard.io          | ' + defaultPassword);
    console.log('Organizer C:          organizer.c@summitcorp.io        | ' + defaultPassword);
    console.log('Staff:                staff@eventforge.com             | ' + defaultPassword);
    console.log('Attendee (Confirmed): attendee@eventforge.com          | ' + defaultPassword);
    console.log('Attendee (VIP):       vip.attendee@eventforge.com      | ' + defaultPassword);
    console.log('Waitlist (VIP #1):    vip.waitlist@eventforge.com      | ' + defaultPassword);
    console.log('Waitlist (Std #2):    standard.waitlist@eventforge.com | ' + defaultPassword);
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Development seed failed:', error);
    process.exit(1);
  }
}

if (process.argv[1]?.includes('seedDevelopmentData')) {
  seedDevelopmentData();
}
