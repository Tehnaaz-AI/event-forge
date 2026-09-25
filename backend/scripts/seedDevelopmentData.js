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
  SponsorshipPackage,
  Inquiry
} from '../src/models/index.js';

export async function seedDevelopmentData() {
  try {
    await connectDb();
    console.log('🌱 Connected to MongoDB for controlled 5-persona development purge & bootstrap...');

    // ==========================================
    // 0. PURGE ALL OLD DATA
    // ==========================================
    console.log('🧹 Purging all collections for a clean slate...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Event.deleteMany({}),
      Session.deleteMany({}),
      TicketCategory.deleteMany({}),
      Registration.deleteMany({}),
      Ticket.deleteMany({}),
      EventStaff.deleteMany({}),
      Sponsor.deleteMany({}),
      SponsorshipPackage.deleteMany({}),
      Inquiry ? Inquiry.deleteMany({}) : Promise.resolve()
    ]);
    console.log('✓ All collections cleanly wiped.');

    const defaultPassword = process.env.DEV_SEED_PASSWORD || 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // ==========================================
    // 1. ORGANIZATIONS (Exactly 2 Tenancies)
    // ==========================================
    const orgA = await Organization.create({
      name: 'Nexus Tech Innovations',
      contactEmail: 'contact@nexus.io',
      industry: 'Autonomous Systems & AI',
      subscriptionPlan: 'Enterprise VIP',
      subscriptionStatus: 'ACTIVE'
    });

    const orgB = await Organization.create({
      name: 'Vanguard Cloud Systems',
      contactEmail: 'contact@vanguard.io',
      industry: 'Cloud Infrastructure & DevOps',
      subscriptionPlan: 'Enterprise VIP',
      subscriptionStatus: 'ACTIVE'
    });

    // ==========================================
    // 2. USERS (Exactly 5 Core Personas)
    // ==========================================
    
    // 1. Platform Super Admin
    const admin = await User.create({
      name: 'Platform Super Admin',
      email: 'admin@eventforge.com',
      passwordHash,
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE',
      organization: orgA._id
    });

    // 2. Organizer A (Nexus AI)
    const organizerA = await User.create({
      name: 'Dr. Elena Vance (Organizer A)',
      email: 'organizer.a@nexus.io',
      passwordHash,
      role: 'ORGANIZER',
      organization: orgA._id,
      bio: 'VP of AI Systems & Architecture at Nexus Tech Innovations.',
      status: 'ACTIVE'
    });

    // 3. Organizer B (Vanguard Cloud)
    const organizerB = await User.create({
      name: 'Marcus Sterling (Organizer B)',
      email: 'organizer.b@vanguard.io',
      passwordHash,
      role: 'ORGANIZER',
      organization: orgB._id,
      bio: 'Principal Cloud & Security Architect at Vanguard Cloud Systems.',
      status: 'ACTIVE'
    });

    // 4. Door Check-In Staff
    const staff = await User.create({
      name: 'Alex Rivera (Door Staff)',
      email: 'staff@eventforge.com',
      passwordHash,
      role: 'STAFF',
      organization: orgA._id,
      status: 'ACTIVE'
    });

    // 5. Verified Attendee
    const attendee = await User.create({
      name: 'Sarah Jenkins (Delegate)',
      email: 'attendee@eventforge.com',
      passwordHash,
      role: 'ATTENDEE',
      organization: orgA._id,
      status: 'ACTIVE'
    });

    console.log('✓ Provisioned exactly 5 Users (1 Admin, 2 Organizers, 1 Staff, 1 Attendee)');

    // ==========================================
    // 3. CONFERENCES (2 Separate Tenancies)
    // ==========================================
    const now = new Date();
    const startDate1 = new Date(now.getTime() + 7 * 24 * 3600000);
    const endDate1 = new Date(startDate1.getTime() + 2 * 24 * 3600000);

    // Event 1 -> Organizer A (Nexus AI)
    const event1 = await Event.create({
      title: 'Global AI & Autonomous Systems Summit 2026',
      slug: 'global-ai-summit-2026',
      description: 'The premier global executive conference on autonomous multi-agent systems, enterprise LLM architectures, and real-time AI security.',
      eventType: 'CONFERENCE',
      category: 'Artificial Intelligence',
      startDate: startDate1,
      endDate: endDate1,
      capacity: 500,
      status: 'REGISTRATION_OPEN',
      organization: orgA._id,
      organizer: organizerA._id,
      venue: {
        name: 'Moscone Center Executive Hall',
        address: '747 Howard St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA'
      },
      registrationSettings: {
        isRegistrationOpen: true,
        waitlistEnabled: true
      }
    });

    // Event 2 -> Organizer B (Vanguard Cloud)
    const startDate2 = new Date(now.getTime() + 14 * 24 * 3600000);
    const endDate2 = new Date(startDate2.getTime() + 2 * 24 * 3600000);

    const event2 = await Event.create({
      title: 'CloudScale DevOps & Security World 2026',
      slug: 'cloudscale-devops-world-2026',
      description: 'Deep architectural breakdowns of multi-region Kubernetes, zero-trust cloud infrastructure, and continuous enterprise compliance.',
      eventType: 'CONFERENCE',
      category: 'Cloud Infrastructure',
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
    });

    console.log('✓ Provisioned 2 Published Conferences across the 2 Organizers');

    // ==========================================
    // 4. TICKET CATEGORIES & SESSIONS FOR EVENT 1
    // ==========================================
    const cat1Standard = await TicketCategory.create({
      event: event1._id,
      name: 'General Admission Pass',
      description: 'Full conference access, keynotes, multi-track symposiums, and evening networking.',
      tier: 'STANDARD',
      isVipEligible: false,
      price: 299,
      capacity: 400,
      availableQuantity: 399
    });

    const cat1VIP = await TicketCategory.create({
      event: event1._id,
      name: 'Executive VIP Pass',
      description: 'Fast-track priority entrance, VIP executive lounge, and private speaker dinner reception.',
      tier: 'VIP',
      isVipEligible: true,
      price: 699,
      capacity: 100,
      availableQuantity: 100
    });

    // Sessions for Event 1
    await Session.create([
      {
        event: event1._id,
        title: 'Architecting Autonomous Multi-Agent AI Systems',
        description: 'Keynote exploration of distributed agent coordination, deterministic state machines, and real-time observability.',
        room: 'Grand Ballroom A',
        capacity: 400,
        startTime: new Date(startDate1.getTime() + 9 * 3600000),
        endTime: new Date(startDate1.getTime() + 10.5 * 3600000),
        status: 'PUBLISHED'
      },
      {
        event: event1._id,
        title: 'Zero-Trust LLM Gateway & Prompt Defense',
        description: 'Deep-dive session into prompt firewalls, runtime token telemetry, and enterprise data sandboxing.',
        room: 'Breakout Hall 1',
        capacity: 150,
        startTime: new Date(startDate1.getTime() + 11 * 3600000),
        endTime: new Date(startDate1.getTime() + 12.5 * 3600000),
        status: 'PUBLISHED'
      }
    ]);

    // Assign Door Staff Alex Rivera to Event 1
    await EventStaff.create({
      event: event1._id,
      user: staff._id,
      role: 'CHECK_IN'
    });

    // ==========================================
    // 5. TICKET CATEGORIES & SESSIONS FOR EVENT 2
    // ==========================================
    await TicketCategory.create([
      {
        event: event2._id,
        name: 'Standard Technical Pass',
        description: 'Full access to Kubernetes tracks, DevOps masterclasses, and open-source expo.',
        tier: 'STANDARD',
        isVipEligible: false,
        price: 199,
        capacity: 300,
        availableQuantity: 300
      },
      {
        event: event2._id,
        name: 'All-Access VIP Pass',
        description: 'Includes private workshops, certification exam voucher, and VIP lounge access.',
        tier: 'VIP',
        isVipEligible: true,
        price: 499,
        capacity: 100,
        availableQuantity: 100
      }
    ]);

    await Session.create([
      {
        event: event2._id,
        title: 'Kubernetes at Massive Scale: Lessons from 10k Nodes',
        description: 'Production strategies for multi-cluster fleet management, eBPF telemetry, and chaos engineering.',
        room: 'Cloud Arena 1',
        capacity: 300,
        startTime: new Date(startDate2.getTime() + 9 * 3600000),
        endTime: new Date(startDate2.getTime() + 10.5 * 3600000),
        status: 'PUBLISHED'
      }
    ]);

    // ==========================================
    // 6. CONFIRMED ATTENDEE REGISTRATION & DIGITAL BADGE
    // ==========================================
    const regAttendee = await Registration.create({
      event: event1._id,
      attendee: attendee._id,
      ticketCategory: cat1Standard._id,
      registrationStatus: 'CONFIRMED',
      isVIP: false,
      priorityScore: 0,
      amount: 299
    });

    const ticketNumber = `EF-2026-CONF-8891`;
    const qrCode = await QRCode.toDataURL(JSON.stringify({
      registration: String(regAttendee._id),
      ticketNumber: ticketNumber,
      attendee: attendee.name,
      event: event1.title
    }));

    await Ticket.create({
      registration: regAttendee._id,
      ticketNumber: ticketNumber,
      qrCode: qrCode,
      status: 'ACTIVE'
    });

    // Add Inbound Contact Inquiries for Admin CRM
    if (Inquiry) {
      await Inquiry.create([
        {
          name: 'Chief Information Officer, AlphaCorp',
          email: 'cio@alphacorp.io',
          subject: 'Enterprise Multi-Conference Tier Inquiry',
          message: 'We are looking to host 4 annual developer summits on EventForge and require custom SSO integration and on-premise gateway telemetry.',
          status: 'NEW'
        },
        {
          name: 'Sarah Lin, Global Events Director',
          email: 'slin@summitmgmt.org',
          subject: 'Door Scanner Hardware Compatibility',
          message: 'Do you support optical laser Honeywell scanners alongside the mobile camera optical scanner?',
          status: 'IN_REVIEW'
        }
      ]);
    }

    console.log('✅ Fresh 5-Persona bootstrap completed successfully.');
    console.log('==================================================');
    console.log('1. Super Admin:        admin@eventforge.com        | ' + defaultPassword);
    console.log('2. Organizer A (Nexus): organizer.a@nexus.io        | ' + defaultPassword);
    console.log('3. Organizer B (Cloud): organizer.b@vanguard.io     | ' + defaultPassword);
    console.log('4. Door Staff:          staff@eventforge.com        | ' + defaultPassword);
    console.log('5. Attendee (Sarah):    attendee@eventforge.com     | ' + defaultPassword);
    console.log('==================================================');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Development seed failed:', error);
    process.exit(1);
  }
}

if (process.argv[1]?.includes('seedDevelopmentData')) {
  seedDevelopmentData();
}
