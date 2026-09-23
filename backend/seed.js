/**
 * EventForge - Comprehensive Enterprise Database Seed Script
 * Populates 5 distinct flagship conferences across diverse industries,
 * exactly 1 user per role with clean demo credentials,
 * multi-track sessions, speaker assignments, tiered tickets,
 * confirmed passes with cryptographic QR codes, door staff roster,
 * brand sponsors & deliverables, broadcasts, and verified attendee feedback.
 * 
 * Run: node seed.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import { connectDb } from './src/config/db.js';

dotenv.config();

async function seed() {
  await connectDb();
  console.log('✅ Connected to MongoDB via unified connectDb');

  const db = mongoose.connection.db;

  // Clear existing collections
  await Promise.all([
    db.collection('organizations').deleteMany({}),
    db.collection('users').deleteMany({}),
    db.collection('events').deleteMany({}),
    db.collection('sessions').deleteMany({}),
    db.collection('ticketcategories').deleteMany({}),
    db.collection('registrations').deleteMany({}),
    db.collection('tickets').deleteMany({}),
    db.collection('eventstaffs').deleteMany({}),
    db.collection('sponsors').deleteMany({}),
    db.collection('sponsorshippackages').deleteMany({}),
    db.collection('sponsordeliverables').deleteMany({}),
    db.collection('feedbacks').deleteMany({}),
    db.collection('announcements').deleteMany({}),
    db.collection('coupons').deleteMany({})
  ]);
  console.log('🧹 Cleaned all collections');

  // 1. Create Organizations
  const orgs = await db.collection('organizations').insertMany([
    {
      name: 'EventForge Global Enterprise',
      contactEmail: 'admin@eventforge.com',
      industry: 'Conference & Event Technology',
      subscriptionPlan: 'Enterprise VIP',
      subscriptionStatus: 'ACTIVE',
      settings: { timezone: 'Asia/Kolkata', currency: 'USD' },
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Apex Design & Product Guild',
      contactEmail: 'hello@apexdesign.org',
      industry: 'Product Design & UX',
      subscriptionPlan: 'Enterprise',
      subscriptionStatus: 'ACTIVE',
      settings: { timezone: 'Europe/London', currency: 'USD' },
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  const org1Id = orgs.insertedIds[0];
  const org2Id = orgs.insertedIds[1];
  console.log('🏢 Created 2 enterprise organizations');

  // 2. Hash Passwords
  const commonPass = await bcrypt.hash('DemoPass123!', 12);
  const adminPass1234 = await bcrypt.hash('12345678', 12);

  // 3. Create 1 User Per Role with Clean Credentials
  const users = await db.collection('users').insertMany([
    // 1. PLATFORM_ADMIN (Primary Demo Admin)
    {
      name: 'Eleanor Vance',
      email: 'admin@eventforge.com',
      passwordHash: commonPass,
      role: 'PLATFORM_ADMIN',
      organization: org1Id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: 'Platform Master Administrator overseeing global operations, security, and tenant governance.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    // 1b. PLATFORM_ADMIN (Env Super Admin)
    {
      name: process.env.ADMIN_NAME || 'Tehnaaz Fathima',
      email: (process.env.ADMIN_EMAIL || 'tehnaazfathima@gmail.com').toLowerCase().trim(),
      passwordHash: adminPass1234,
      role: 'PLATFORM_ADMIN',
      organization: org1Id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: 'Platform Master Administrator overseeing global operations, security, and tenant governance.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    // 2. ORGANIZER
    {
      name: 'Alexander Sterling',
      email: 'organizer@eventforge.com',
      passwordHash: commonPass,
      role: 'ORGANIZER',
      organization: org1Id,
      phone: '+1 (555) 234-8890',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      bio: 'Executive Director of Global Enterprise Conferences and Summit Orchestration.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    // 3. ATTENDEE (Pass Holder)
    {
      name: 'Marcus Holloway',
      email: 'attendee@eventforge.com',
      passwordHash: commonPass,
      role: 'ATTENDEE',
      organization: null,
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      bio: 'Senior Software Architect & Enterprise AI Researcher.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    // 4. STAFF (Door Gatekeeper)
    {
      name: 'Samantha Reyes',
      email: 'staff@eventforge.com',
      passwordHash: commonPass,
      role: 'STAFF',
      organization: org1Id,
      phone: '+1 (555) 789-0123',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
      bio: 'On-Site Lead Operations & Door Check-In Gatekeeper.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    // 5. SPEAKER (Keynote Luminary)
    {
      name: 'Dr. Elena Rostova',
      email: 'speaker@eventforge.com',
      passwordHash: commonPass,
      role: 'SPEAKER',
      organization: org1Id,
      phone: '+1 (555) 890-1234',
      bio: 'AI Research Director at Neuromorphic Labs. Pioneer in Autonomous Reasoning Agents & Scaled Neural Networks.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    // 6. SPONSOR (Corporate Brand Partner)
    {
      name: 'David Vance',
      email: 'sponsor@eventforge.com',
      passwordHash: commonPass,
      role: 'SPONSOR',
      organization: org2Id,
      phone: '+1 (555) 901-2345',
      bio: 'VP of Strategic Partnerships at Apex Cloud Dynamics.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  const adminId = users.insertedIds[0];
  const organizerId = users.insertedIds[2];
  const attendeeId = users.insertedIds[3];
  const staffId = users.insertedIds[4];
  const speakerId = users.insertedIds[5];
  const sponsorUserId = users.insertedIds[6];
  console.log('👥 Created 6 interconnected role profiles (Admin, Organizer, Attendee, Staff, Speaker, Sponsor)');

  // 4. Create 3 Diverse Flagship Conferences
  const now = new Date();
  
  const events = await db.collection('events').insertMany([
    // Event 1: TechConf 2026 (Flagship AI Summit)
    {
      title: 'TechConf 2026: Future of AI & Systems Architecture',
      slug: 'techconf-2026-future-of-ai-systems',
      description: 'The premier corporate conference bringing together 1,500+ software leaders, cloud architects, and AI researchers for 3 immersive days of keynotes, workshops, and executive networking.',
      eventType: 'CONFERENCE',
      category: 'Artificial Intelligence',
      status: 'REGISTRATION_OPEN',
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      venue: { name: 'The Grand Metropolitan Palace Hall', address: '500 Executive Plaza, New York, NY 10001' },
      capacity: 1500,
      organization: org1Id,
      organizer: organizerId,
      tags: ['ai-agents', 'cloud-architecture', 'enterprise-scalability', 'leadership'],
      registrationSettings: { waitlistEnabled: true, requireApproval: false },
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 2: Apex Global Design & Product Summit
    {
      title: 'Apex Global Design & Product Summit 2026',
      slug: 'apex-global-design-product-summit',
      description: 'An exclusive multi-track symposium celebrating craft, design engineering, generative UX paradigms, and next-generation product strategy.',
      eventType: 'CONFERENCE',
      category: 'Product & Design',
      status: 'REGISTRATION_OPEN',
      startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
      timezone: 'Europe/Paris',
      venue: { name: 'Palais des Arts Convention Pavilions', address: '14 Boulevard Haussmann, Paris' },
      capacity: 800,
      organization: org2Id,
      organizer: organizerId,
      tags: ['ux-architecture', 'design-systems', 'product-strategy', 'brand-craft'],
      registrationSettings: { waitlistEnabled: true, requireApproval: false },
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 3: FinTech Leaders & Decentralized Finance Congress
    {
      title: 'FinTech Leaders & Decentralized Finance Congress',
      slug: 'fintech-leaders-defi-congress-2026',
      description: 'Premier gathering of chief financial officers, banking innovators, regulatory architects, and digital asset leaders exploring institutional finance transformation.',
      eventType: 'CONFERENCE',
      category: 'Finance & Banking',
      status: 'REGISTRATION_OPEN',
      startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Singapore',
      venue: { name: 'Marina Bay Financial Center Ballroom', address: '10 Marina Boulevard, Singapore' },
      capacity: 1200,
      organization: org1Id,
      organizer: organizerId,
      tags: ['fintech', 'banking', 'payments', 'blockchain', 'regtech'],
      registrationSettings: { waitlistEnabled: true, requireApproval: false },
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  const event1Id = events.insertedIds[0];
  const event2Id = events.insertedIds[1];
  const event3Id = events.insertedIds[2];
  console.log('📅 Created 3 flagship enterprise conferences');

  // 5. Create Ticket Tiers
  const ticketCats = await db.collection('ticketcategories').insertMany([
    // Event 1 Tiers
    {
      event: event1Id,
      name: 'Executive VIP All-Access Pass',
      description: 'Access to all keynote stages, private VIP speaker salon, lounge bar, and fast-track entrance.',
      price: 899,
      capacity: 200,
      availableQuantity: 189,
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event1Id,
      name: 'General Admission Delegate Pass',
      description: 'Full 3-day access to all main stages, exhibition hall, networking masterclasses, and digital badge.',
      price: 399,
      capacity: 1000,
      availableQuantity: 845,
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 2 Tiers
    {
      event: event2Id,
      name: 'Designer All-Access Pass',
      description: 'Full access to workshops, design masterclasses, and portfolio review sessions.',
      price: 499,
      capacity: 500,
      availableQuantity: 420,
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 3 Tiers
    {
      event: event3Id,
      name: 'Institutional Delegate Pass',
      description: 'Executive pass with private boardroom briefings and banking networking lounge.',
      price: 1199,
      capacity: 400,
      availableQuantity: 375,
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  const vipCatId = ticketCats.insertedIds[0];
  console.log('🎟️ Created tiered pass packages across conferences');

  // 6. Multi-Track Sessions (Linked to Speaker)
  const d1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  await db.collection('sessions').insertMany([
    {
      event: event1Id,
      title: 'Opening Keynote: Autonomous AI Agents in Enterprise Ecosystems',
      description: 'How autonomous reasoning models and multi-agent workflows are replacing monolithic business logic in mission-critical applications.',
      room: 'Grand Ballroom - Stage Alpha',
      category: 'Keynote',
      startTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 9, 0),
      endTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 30),
      capacity: 1500,
      speakers: [speakerId],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event1Id,
      title: 'Architectural Deep Dive: Zero-Downtime Distributed Consensus at Hyperscale',
      description: 'Practical failure recovery, Raft/Paxos trade-offs, and multi-region state replication patterns for high-throughput transactional backends.',
      room: 'Pavilion Hall B',
      category: 'Architecture',
      startTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 11, 0),
      endTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 12, 30),
      capacity: 400,
      speakers: [speakerId],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event1Id,
      title: 'Workshop: Crafting Generative Interfaces with Human-in-the-Loop Safeguards',
      description: 'Hands-on interactive masterclass exploring fluid canvas interactions, stream processing, and safety guardrails in modern web clients.',
      room: 'Studio Suites 3 & 4',
      category: 'Workshop',
      startTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 14, 0),
      endTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 16, 0),
      capacity: 250,
      speakers: [speakerId],
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  console.log('🗓️ Scheduled multi-track keynote sessions with speaker assignments');

  // 7. Door Staff Roster Assignment
  await db.collection('eventstaffs').insertMany([
    {
      event: event1Id,
      user: staffId,
      role: 'CHECK_IN',
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event2Id,
      user: staffId,
      role: 'MANAGER',
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  console.log('🛡️ Provisioned Door Staff scanner crew assignments');

  // 8. Sponsorship Packages & Active Sponsors
  const spPackages = await db.collection('sponsorshippackages').insertMany([
    {
      event: event1Id,
      name: 'Titanium Title Partner',
      price: 25000,
      availableSpots: 3,
      description: 'Flagship keynote stage branding and private executive lounge host.',
      benefits: ['Main stage LED branding', 'VIP private lounge naming', 'Keynote shoutout', '10 VIP passes'],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event1Id,
      name: 'Platinum Tier Sponsor',
      price: 15000,
      availableSpots: 5,
      description: 'Exhibition booth and lanyard branding.',
      benefits: ['Exhibition booth in Hall A', 'Logo on all lanyards & digital passes', '5 VIP passes'],
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  const sponsorPkg1 = spPackages.insertedIds[0];

  const sponsorRes = await db.collection('sponsors').insertMany([
    {
      event: event1Id,
      companyName: 'Apex Cloud Dynamics',
      contactEmail: 'sponsor@eventforge.com',
      website: 'https://apexcloud.io',
      organization: org2Id,
      package: sponsorPkg1,
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  await db.collection('sponsordeliverables').insertMany([
    { sponsor: sponsorRes.insertedIds[0], name: 'High-Res Vector Brand Assets for Stage LED', status: 'COMPLETED', dueDate: new Date() },
    { sponsor: sponsorRes.insertedIds[0], name: 'Booth Construction Floor Plan Approval', status: 'IN_PROGRESS', dueDate: new Date() },
    { sponsor: sponsorRes.insertedIds[0], name: 'Executive Keynote Slide Deck Review', status: 'PENDING', dueDate: new Date() }
  ]);
  console.log('💎 Created sponsorship tiers, brand sponsor & deliverables');

  // 9. Confirmed Pass & Dynamic QR Badge for Marcus Holloway (ATTENDEE)
  const ticketNumber = 'EF-2026-VIP-9941';
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
    registration: 'REG-2026-VIP',
    ticketNumber,
    attendee: 'Marcus Holloway',
    event: 'TechConf 2026: Future of AI & Systems Architecture'
  }));

  const regRes = await db.collection('registrations').insertOne({
    event: event1Id,
    attendee: attendeeId,
    ticketCategory: vipCatId,
    registrationStatus: 'CONFIRMED',
    amount: 899,
    createdAt: new Date(), updatedAt: new Date()
  });

  await db.collection('tickets').insertOne({
    registration: regRes.insertedId,
    ticketNumber,
    qrCode: qrDataUrl,
    status: 'ACTIVE',
    checkedInAt: null,
    createdAt: new Date(), updatedAt: new Date()
  });
  console.log('🎫 Issued confirmed VIP Pass with cryptographic QR code to Marcus Holloway');

  // 10. Broadcast Announcements
  await db.collection('announcements').insertMany([
    {
      event: event1Id,
      title: 'Welcome to TechConf 2026: Digital Pass Pickup Now Open',
      message: 'Doors open at 8:00 AM. Please present your digital QR pass at the entrance scanner for instant badge issuance.',
      type: 'INFO',
      audience: 'ALL_ATTENDEES',
      sentAt: new Date(),
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event1Id,
      title: 'Keynote Stage Alpha Room Update',
      message: 'Dr. Elena Rostova opening keynote will commence promptly at 9:00 AM in Grand Ballroom.',
      type: 'REMINDER',
      audience: 'ALL_ATTENDEES',
      sentAt: new Date(),
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  console.log('📢 Created broadcast announcements');

  // 11. Attendee Feedback / Verified Reviews
  await db.collection('feedbacks').insertMany([
    {
      event: event1Id,
      attendee: attendeeId,
      rating: 5,
      comments: 'Exceptional keynote presentations and seamless badge pickup experience. The AI itinerary matching was spot on!',
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  console.log('⭐ Created verified attendee review');

  console.log('\n===============================================================');
  console.log('🎉 EVENTFORGE DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
  console.log('📊 Seeded Data Overview:');
  console.log('• 3 Flagship Multi-Track Conferences');
  console.log('• 6 Differentiated Role Portals (1 user per role)');
  console.log('• Confirmed Passes, QR Badges, Door Staff Roster, Sponsors & AI Engine');
  console.log('---------------------------------------------------------------');
  console.log('🔑 DEMO CREDENTIALS:');
  console.log('1. Platform Super Admin: admin@eventforge.com     | Pass: ' + (process.env.ADMIN_PASSWORD || '12345678'));
  console.log('2. Event Organizer:      organizer@eventforge.com  | Pass: DemoPass123!');
  console.log('3. Attendee Passholder:  attendee@eventforge.com   | Pass: DemoPass123!');
  console.log('4. Door Gatekeeper:      staff@eventforge.com      | Pass: DemoPass123!');
  console.log('5. Keynote Speaker:      speaker@eventforge.com    | Pass: DemoPass123!');
  console.log('6. Corporate Sponsor:    sponsor@eventforge.com    | Pass: DemoPass123!');
  console.log('===============================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
