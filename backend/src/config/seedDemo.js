import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { connectDb } from './db.js';
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
} from '../models/index.js';

export async function runDemoSeed() {
  try {
    await connectDb();
    console.log('🌱 Connected to database for demo dataset provisioning...');

    // 1. Organization
    let org = await Organization.findOne({ name: 'Nexus Global Innovation Labs' });
    if (!org) {
      org = await Organization.create({
        name: 'Nexus Global Innovation Labs',
        contactEmail: 'organizer@nexuslabs.io',
        industry: 'Autonomous Systems & AI',
        subscriptionPlan: 'Enterprise VIP',
        subscriptionStatus: 'ACTIVE'
      });
      console.log('✓ Provisioned Organization: Nexus Global Innovation Labs');
    }

    // 2. Organizer User
    const organizerEmail = 'elena.vance@nexuslabs.io';
    let organizer = await User.findOne({ email: organizerEmail });
    if (!organizer) {
      organizer = await User.create({
        name: 'Dr. Elena Vance',
        email: organizerEmail,
        passwordHash: await bcrypt.hash('DemoOrganizer2026!', 12),
        role: 'ORGANIZER',
        organization: org._id,
        bio: 'VP of Autonomous Infrastructure at Nexus Labs.',
        status: 'ACTIVE'
      });
      console.log('✓ Provisioned Organizer: Dr. Elena Vance');
    }

    // 3. Flagship Summit
    const eventSlug = 'global-ai-summit-2026';
    let event = await Event.findOne({ slug: eventSlug });
    if (!event) {
      const now = new Date();
      event = await Event.create({
        title: 'Global AI & Autonomous Systems Summit 2026',
        slug: eventSlug,
        description: 'The premier annual summit exploring live operational intelligence, autonomous agents, and real-time infrastructure.',
        category: 'Technology & AI',
        eventType: 'Conference',
        startDate: new Date(now.getTime() - 2 * 3600 * 1000), // Started 2h ago (LIVE)
        endDate: new Date(now.getTime() + 6 * 3600 * 1000),   // Ends in 6h
        venue: {
          name: 'Grand Metro Convention Center',
          address: '742 Innovation Way, Tech District'
        },
        capacity: 500,
        status: 'LIVE',
        organizer: organizer._id,
        organization: org._id,
        registrationSettings: {
          waitlistEnabled: true,
          requireApproval: false
        }
      });
      console.log('✓ Provisioned Live Event: Global AI & Autonomous Systems Summit 2026');
    }

    // 4. Ticket Categories
    let [vipTier, standardTier] = await Promise.all([
      TicketCategory.findOne({ event: event._id, name: 'Executive VIP All-Access' }),
      TicketCategory.findOne({ event: event._id, name: 'General Admission Delegate' })
    ]);

    if (!vipTier) {
      vipTier = await TicketCategory.create({
        event: event._id,
        name: 'Executive VIP All-Access',
        description: 'Priority front-row seating, speaker lounge access, and exclusive VIP reception.',
        price: 699,
        capacity: 100,
        availableQuantity: 42
      });
    }

    if (!standardTier) {
      standardTier = await TicketCategory.create({
        event: event._id,
        name: 'General Admission Delegate',
        description: 'Full 3-day access to all keynote sessions, breakout tracks, and exhibition hall.',
        price: 299,
        capacity: 400,
        availableQuantity: 110
      });
    }

    // 5. Speaker & Keynote Sessions
    let speaker = await User.findOne({ email: 'marcus.chen@nexuslabs.io' });
    if (!speaker) {
      speaker = await User.create({
        name: 'Dr. Marcus Chen',
        email: 'marcus.chen@nexuslabs.io',
        passwordHash: await bcrypt.hash('SpeakerSecure2026!', 12),
        role: 'SPEAKER',
        organization: org._id,
        bio: 'Principal Systems Architect at DeepMind Core.'
      });
    }

    const sessionCount = await Session.countDocuments({ event: event._id });
    if (sessionCount === 0) {
      const now = new Date();
      await Session.insertMany([
        {
          event: event._id,
          title: 'Opening Keynote: Next-Gen Agentic Event Systems',
          room: 'Hall A',
          capacity: 300,
          startTime: new Date(now.getTime() - 1 * 3600 * 1000),
          endTime: new Date(now.getTime() + 1 * 3600 * 1000),
          speakers: [speaker._id],
          category: 'Keynote'
        },
        {
          event: event._id,
          title: 'Breakout: Distributed Real-time Telemetry & Edge AI',
          room: 'Hall B',
          capacity: 150,
          startTime: new Date(now.getTime() + 1.5 * 3600 * 1000),
          endTime: new Date(now.getTime() + 3 * 3600 * 1000),
          speakers: [speaker._id],
          category: 'Breakout'
        },
        {
          event: event._id,
          title: 'Hands-on Masterclass: Autonomous Orchestration in Practice',
          room: 'Workshop C',
          capacity: 80,
          startTime: new Date(now.getTime() + 3.5 * 3600 * 1000),
          endTime: new Date(now.getTime() + 5 * 3600 * 1000),
          speakers: [speaker._id],
          category: 'Workshop'
        }
      ]);
      console.log('✓ Provisioned 3 Multi-Track Conference Sessions');
    }

    // 6. Door Staff
    let staffUser = await User.findOne({ email: 'jordan.staff@nexuslabs.io' });
    if (!staffUser) {
      staffUser = await User.create({
        name: 'Jordan Lee',
        email: 'jordan.staff@nexuslabs.io',
        passwordHash: await bcrypt.hash('StaffSecure2026!', 12),
        role: 'STAFF',
        organization: org._id
      });
    }
    const staffAssignment = await EventStaff.findOne({ event: event._id, user: staffUser._id });
    if (!staffAssignment) {
      await EventStaff.create({
        event: event._id,
        user: staffUser._id,
        role: 'CHECK_IN'
      });
      console.log('✓ Provisioned Door Staff: Jordan Lee (CHECK_IN)');
    }

    // 7. Attendees & Check-Ins
    const regCount = await Registration.countDocuments({ event: event._id });
    if (regCount < 10) {
      console.log('🎟️ Provisioning sample attendee registrations and verified badge check-ins...');
      const sampleAttendees = [
        { name: 'Sarah Connor', email: 'sarah.c@cyberdyne.io' },
        { name: 'David Bowman', email: 'dbowman@discovery.org' },
        { name: 'Ada Lovelace', email: 'ada@analytical.edu' },
        { name: 'Alan Turing', email: 'alan@bletchley.ac.uk' },
        { name: 'Grace Hopper', email: 'grace@navy.mil' },
        { name: 'Linus Torvalds', email: 'linus@kernel.org' },
        { name: 'Margaret Hamilton', email: 'margaret@apollo.mit.edu' },
        { name: 'Claude Shannon', email: 'claude@bell-labs.com' }
      ];

      for (let i = 0; i < sampleAttendees.length; i++) {
        const item = sampleAttendees[i];
        let attendee = await User.findOne({ email: item.email });
        if (!attendee) {
          attendee = await User.create({
            name: item.name,
            email: item.email,
            passwordHash: await bcrypt.hash('AttendeePass2026!', 12),
            role: 'ATTENDEE'
          });
        }

        let reg = await Registration.findOne({ event: event._id, attendee: attendee._id });
        if (!reg) {
          const category = i % 2 === 0 ? vipTier : standardTier;
          reg = await Registration.create({
            event: event._id,
            attendee: attendee._id,
            ticketCategory: category._id,
            registrationStatus: 'CONFIRMED',
            amount: category.price
          });

          const ticketNumber = `EF-2026-${i % 2 === 0 ? 'VIP' : 'CONF'}-${1000 + i}`;
          const qrCode = await QRCode.toDataURL(JSON.stringify({
            registration: String(reg._id),
            ticketNumber,
            attendee: attendee.name,
            event: event.title
          }));

          await Ticket.create({
            registration: reg._id,
            ticketNumber,
            qrCode,
            status: 'ACTIVE',
            checkedInAt: i < 6 ? new Date(Date.now() - (30 - i * 4) * 60 * 1000) : null
          });
        }
      }
      console.log('✓ Provisioned 8 Attendees (6 checked-in at doors, 2 in transit)');
    }

    // 8. Brand Sponsor
    let pkg = await SponsorshipPackage.findOne({ event: event._id, name: 'Platinum Keynote Sponsor' });
    if (!pkg) {
      pkg = await SponsorshipPackage.create({
        event: event._id,
        name: 'Platinum Keynote Sponsor',
        price: 15000,
        benefits: ['Main stage keynote opening video', 'Prime 10x10 booth placement', '5 VIP Passes'],
        availableSpots: 2
      });
    }
    let sponsorOrg = await Organization.findOne({ name: 'Vanguard Compute Cloud' });
    if (!sponsorOrg) {
      sponsorOrg = await Organization.create({
        name: 'Vanguard Compute Cloud',
        contactEmail: 'partnerships@vanguardcloud.io',
        industry: 'Cloud & AI Compute'
      });
    }
    const sponsor = await Sponsor.findOne({ event: event._id, organization: sponsorOrg._id });
    if (!sponsor) {
      await Sponsor.create({
        event: event._id,
        organization: sponsorOrg._id,
        package: pkg._id,
        status: 'ACTIVE'
      });
      console.log('✓ Provisioned Sponsor: Vanguard Compute Cloud');
    }

    console.log('\n🎉 Demo Dataset Successfully Initialized!');
    console.log(`- Event URL: /dashboard/organizer/events/${event._id}`);
    console.log(`- Public Slug: /e/${event.slug}`);
    console.log(`- Organizer Login: ${organizerEmail} / DemoOrganizer2026!\n`);

    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  } catch (err) {
    console.error('Demo seed error:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

if (process.argv[1]?.endsWith('seedDemo.js')) {
  runDemoSeed();
}
