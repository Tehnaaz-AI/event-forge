/**
 * EventForge - Comprehensive Enterprise Database Seed Script
 * Populates realistic multi-organization data, 5 distinct flagship conferences,
 * sessions, ticket tiers, speakers, sponsors, exactly 1 registration for Marcus Holloway,
 * and realistic platform analytics.
 * Run: node seed.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventforge';

async function seed() {
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB:', uri);

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
      name: 'TechConf Global Systems',
      contactEmail: 'contact@techconf.global',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      settings: { timezone: 'America/New_York', currency: 'USD' },
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Apex Design & Product Guild',
      contactEmail: 'hello@apexdesign.org',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      settings: { timezone: 'Europe/London', currency: 'USD' },
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  const org1Id = orgs.insertedIds[0];
  const org2Id = orgs.insertedIds[1];
  console.log('🏢 Created 2 enterprise organizations');

  // 2. Hash Passwords
  const commonPass = await bcrypt.hash('DemoPass123!', 12);

  // 3. Create Users (Platform Admin, Organizers, Staff, Attendees, Speakers)
  const users = await db.collection('users').insertMany([
    {
      name: 'Eleanor Vance',
      email: 'admin@eventforge.demo',
      passwordHash: commonPass,
      role: 'PLATFORM_ADMIN',
      organization: org1Id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: 'Platform Master Administrator overseeing global operations and tenant security.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Alexander Sterling',
      email: 'organizer@eventforge.demo',
      passwordHash: commonPass,
      role: 'ORGANIZER',
      organization: org1Id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      bio: 'Executive Director of Global Tech Conferences and Summits.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Samantha Reyes',
      email: 'staff@eventforge.demo',
      passwordHash: commonPass,
      role: 'STAFF',
      organization: org1Id,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
      bio: 'On-Site Lead Operations & Door Check-In Gatekeeper.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Marcus Holloway',
      email: 'attendee@eventforge.demo',
      passwordHash: commonPass,
      role: 'ATTENDEE',
      organization: null,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      bio: 'Senior Software Engineer & AI Research Enthusiast.',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    // Keynote Speakers
    {
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@mit.edu',
      passwordHash: commonPass,
      role: 'SPEAKER',
      organization: org1Id,
      bio: 'AI Research Director at Neuromorphic AI Labs. Pioneer in Autonomous Reasoning Agents.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@cloudnative.io',
      passwordHash: commonPass,
      role: 'SPEAKER',
      organization: org1Id,
      bio: 'VP of Infrastructure & Distributed Systems. Former Lead Architect at Kubernetes Core.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Sophia Chen',
      email: 'sophia@designcraft.co',
      passwordHash: commonPass,
      role: 'SPEAKER',
      organization: org2Id,
      bio: 'Head of Product Design, specialist in Design Tokens, Micro-Interactions, and Human-AI Interface Co-Design.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      status: 'ACTIVE',
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  const adminId = users.insertedIds[0];
  const organizerId = users.insertedIds[1];
  const staffId = users.insertedIds[2];
  const attendeeId = users.insertedIds[3];
  const speaker1Id = users.insertedIds[4];
  const speaker2Id = users.insertedIds[5];
  const speaker3Id = users.insertedIds[6];
  console.log('👥 Created users and speakers with profiles');

  // 4. Create 5 Flagship Events on Platform
  const now = new Date();
  
  const events = await db.collection('events').insertMany([
    // Event 1: TechConf 2026 (Registered by Marcus Holloway)
    {
      title: 'TechConf 2026: Future of AI & Systems Architecture',
      slug: 'techconf-2026-future-of-ai-systems',
      description: 'The flagship corporate conference bringing together 1,500+ software leaders, cloud architects, and AI researchers for 3 immersive days of keynotes, workshops, and executive networking.',
      eventType: 'CONFERENCE',
      category: 'Artificial Intelligence',
      status: 'REGISTRATION_OPEN',
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      venue: { name: 'The Grand Metropolitan Palace Hall', address: '500 Executive Plaza, New York, NY 10001' },
      capacity: 1500,
      organization: org1Id,
      organizer: organizerId,
      tags: ['ai-agents', 'cloud-architecture', 'enterprise-scalability', 'leadership'],
      registrationSettings: { waitlistEnabled: true },
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 2: Apex Global Design
    {
      title: 'Apex Global Design & Product Summit 2026',
      slug: 'apex-global-design-product-summit',
      description: 'An exclusive multi-track symposium celebrating craft, design engineering, generative UX paradigms, and next-generation product strategy.',
      eventType: 'CONFERENCE',
      category: 'Product & Design',
      status: 'REGISTRATION_OPEN',
      startDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000),
      venue: { name: 'Palais des Arts Convention Pavilions', address: '14 Boulevard Haussmann, Paris' },
      capacity: 800,
      organization: org2Id,
      organizer: organizerId,
      tags: ['ux-architecture', 'design-systems', 'product-strategy', 'brand-craft'],
      registrationSettings: { waitlistEnabled: true },
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 3: FinTech Leaders
    {
      title: 'FinTech Leaders & Decentralized Finance Congress',
      slug: 'fintech-leaders-defi-congress-2026',
      description: 'Premier gathering of chief financial officers, banking innovators, regulatory architects, and digital asset leaders exploring institutional finance transformation.',
      eventType: 'CONFERENCE',
      category: 'Finance & Banking',
      status: 'REGISTRATION_OPEN',
      startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000),
      venue: { name: 'Marina Bay Financial Center Ballroom', address: '10 Marina Boulevard, Singapore' },
      capacity: 1200,
      organization: org1Id,
      organizer: organizerId,
      tags: ['fintech', 'banking', 'payments', 'blockchain', 'regtech'],
      registrationSettings: { waitlistEnabled: true },
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 4: HealthTech & Biotechnology
    {
      title: 'Global HealthTech & Biotechnology Symposium',
      slug: 'global-healthtech-biotech-symposium',
      description: 'Bringing together healthcare visionaries, clinical researchers, genomic scientists, and medical device innovators accelerating patient care breakthroughs.',
      eventType: 'CONFERENCE',
      category: 'Healthcare & Biotech',
      status: 'REGISTRATION_OPEN',
      startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 47 * 24 * 60 * 60 * 1000),
      venue: { name: 'Swiss Tech Convention Centre', address: 'EPFL Innovation Park, Lausanne, Switzerland' },
      capacity: 950,
      organization: org2Id,
      organizer: organizerId,
      tags: ['healthtech', 'genomics', 'biotechnology', 'clinical-ai'],
      registrationSettings: { waitlistEnabled: true },
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 5: CyberSecurity Defense Forum
    {
      title: 'Enterprise CyberDefense & Cloud Security Forum',
      slug: 'enterprise-cyberdefense-cloud-security',
      description: 'High-level defense briefings on zero-trust architecture, automated threat mitigation, supply-chain resilience, and offensive security methodologies.',
      eventType: 'CONFERENCE',
      category: 'Cybersecurity',
      status: 'REGISTRATION_OPEN',
      startDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 62 * 24 * 60 * 60 * 1000),
      venue: { name: 'Silicon Valley Innovation Dome', address: '3000 Sand Hill Road, Menlo Park, CA' },
      capacity: 1100,
      organization: org1Id,
      organizer: organizerId,
      tags: ['cybersecurity', 'zero-trust', 'cloud-security', 'incident-response'],
      registrationSettings: { waitlistEnabled: true },
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  const event1Id = events.insertedIds[0];
  const event2Id = events.insertedIds[1];
  const event3Id = events.insertedIds[2];
  const event4Id = events.insertedIds[3];
  const event5Id = events.insertedIds[4];
  console.log('📅 Created 5 flagship conferences on the platform');

  // 5. Create Ticket Categories for All 5 Events
  const ticketCats = await db.collection('ticketcategories').insertMany([
    // Event 1 Tiers
    {
      event: event1Id,
      name: 'Executive VIP All-Access',
      description: 'Access to all keynote stages, private VIP speaker dinner, lounge bar, and fast-track entrance.',
      price: 899,
      capacity: 200,
      availableQuantity: 188,
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event1Id,
      name: 'General Conference Pass',
      description: 'Full 3-day access to all main stages, exhibition hall, networking sessions, and conference swag.',
      price: 399,
      capacity: 1000,
      availableQuantity: 845,
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event1Id,
      name: 'Academic & Student Pass',
      description: 'Full stage and live stream access for accredited university students and academic researchers.',
      price: 129,
      capacity: 300,
      availableQuantity: 280,
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
    },
    // Event 4 Tiers
    {
      event: event4Id,
      name: 'Clinical & Research Delegate Pass',
      description: 'Includes entry to scientific tracks, peer-reviewed poster sessions, and gala reception.',
      price: 649,
      capacity: 450,
      availableQuantity: 410,
      createdAt: new Date(), updatedAt: new Date()
    },
    // Event 5 Tiers
    {
      event: event5Id,
      name: 'CISO & Security Leader Pass',
      description: 'Full access to classified threat briefings, red-team war rooms, and executive lounge.',
      price: 999,
      capacity: 500,
      availableQuantity: 460,
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  const vipCatId = ticketCats.insertedIds[0];
  console.log('🎟️ Created tiered ticket packages across all 5 events');

  // 6. Create Multi-Track Sessions for All 5 Events
  const d1 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const d2 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
  const d3 = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
  const d4 = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
  const d5 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  await db.collection('sessions').insertMany([
    // Event 1 Sessions (AI & Systems)
    {
      event: event1Id,
      title: 'Opening Keynote: Autonomous AI Agents in Enterprise Ecosystems',
      description: 'How autonomous reasoning models and multi-agent workflows are replacing monolithic business logic in mission-critical applications.',
      room: 'Grand Ballroom - Stage Alpha',
      category: 'Keynote',
      startTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 9, 0),
      endTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 30),
      capacity: 1500,
      speakers: [speaker1Id],
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
      speakers: [speaker2Id],
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
      speakers: [speaker3Id],
      createdAt: new Date(), updatedAt: new Date()
    },

    // Event 2 Sessions (Design & Product)
    {
      event: event2Id,
      title: 'Keynote: The Evolution of Design Tokens in Scaled Enterprise Systems',
      description: 'Bridging design engineering, theme tokens, and typography harmony across cross-platform frameworks.',
      room: 'Main Amphitheater',
      category: 'Design Systems',
      startTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 10, 0),
      endTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 11, 30),
      capacity: 800,
      speakers: [speaker3Id],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event2Id,
      title: 'Masterclass: Micro-Interactions & Perceived Performance in High-Frequency Apps',
      description: 'Crafting fluid 60fps animations, layout transitions, and tactile user feedback without performance regressions.',
      room: 'Design Lab Alpha',
      category: 'UX Engineering',
      startTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 13, 0),
      endTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 15, 0),
      capacity: 350,
      speakers: [speaker3Id],
      createdAt: new Date(), updatedAt: new Date()
    },

    // Event 3 Sessions (FinTech Leaders)
    {
      event: event3Id,
      title: 'Executive Keynote: Real-Time Gross Settlement & Programmable Central Banking Assets',
      description: 'Exploring modern multi-currency clearing rails, instant settlement APIs, and institutional security compliance.',
      room: 'Grand Financial Ballroom',
      category: 'Payments & Settlement',
      startTime: new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), 9, 30),
      endTime: new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), 11, 0),
      capacity: 1200,
      speakers: [speaker1Id],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event3Id,
      title: 'Panel Briefing: AI-Powered Fraud Detection & Transaction Anomalies at Scale',
      description: 'Sub-millisecond inference graphs processing petabyte-scale card authorization streams with zero false positives.',
      room: 'Executive Boardroom B',
      category: 'Risk & RegTech',
      startTime: new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), 11, 30),
      endTime: new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), 13, 0),
      capacity: 500,
      speakers: [speaker2Id],
      createdAt: new Date(), updatedAt: new Date()
    },

    // Event 4 Sessions (HealthTech & Biotech)
    {
      event: event4Id,
      title: 'Opening Plenary: Clinical Diagnostic Foundation Models in Oncology & Pathology',
      description: 'Breakthroughs in multi-modal genomic sequencing, automated cellular classification, and HIPAA-compliant inference.',
      room: 'Auditorium Magna',
      category: 'Clinical AI',
      startTime: new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), 9, 0),
      endTime: new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), 10, 30),
      capacity: 950,
      speakers: [speaker1Id],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event4Id,
      title: 'Symposium Track: Decentralized Clinical Trials & Cryptographic Health Records',
      description: 'Patient data sovereignty, zero-knowledge verifiable consent, and peer-to-peer trial telemetry protocols.',
      room: 'Bio Innovation Hall 2',
      category: 'Biotech Data',
      startTime: new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), 11, 0),
      endTime: new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), 12, 30),
      capacity: 400,
      speakers: [speaker2Id],
      createdAt: new Date(), updatedAt: new Date()
    },

    // Event 5 Sessions (CyberSecurity Forum)
    {
      event: event5Id,
      title: 'Defensive Keynote: Hardening Cloud-Native Control Planes Against Kernel Exploits',
      description: 'Zero-trust workload attestations, eBPF telemetry pipelines, and memory-safe container runtime hardening.',
      room: 'Silicon Security Arena',
      category: 'Cloud Security',
      startTime: new Date(d5.getFullYear(), d5.getMonth(), d5.getDate(), 9, 30),
      endTime: new Date(d5.getFullYear(), d5.getMonth(), d5.getDate(), 11, 0),
      capacity: 1100,
      speakers: [speaker2Id],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event5Id,
      title: 'War Room Simulation: Autonomous Incident Response & Live Malware Remediation',
      description: 'Hands-on offensive counter-measures, memory forensics, and automated firewall routing under active simulation.',
      room: 'Tactical War Room Delta',
      category: 'Live Operations',
      startTime: new Date(d5.getFullYear(), d5.getMonth(), d5.getDate(), 13, 0),
      endTime: new Date(d5.getFullYear(), d5.getMonth(), d5.getDate(), 15, 30),
      capacity: 350,
      speakers: [speaker1Id],
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  console.log('🗓️ Created multi-track session agenda across all 5 conferences');

  // 7. Create Sponsorship Packages & Sponsors
  const spPackages = await db.collection('sponsorshippackages').insertMany([
    {
      event: event1Id,
      name: 'Titanium Title Partner',
      price: 25000,
      benefits: ['Main stage branding', 'VIP private lounge naming', 'Keynote shoutout', '10 VIP passes'],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      event: event1Id,
      name: 'Platinum Tier Sponsor',
      price: 15000,
      benefits: ['Exhibition booth', 'Logo on all lanyards & badges', '5 VIP passes'],
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  const sponsorPkg1 = spPackages.insertedIds[0];

  const sponsorRes = await db.collection('sponsors').insertMany([
    {
      event: event1Id,
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
  console.log('💎 Created sponsor tiers & deliverables');

  // 8. EXACTLY 1 Pass Registration for Marcus Holloway (TechConf 2026 ONLY)
  const ticketNumber = 'EF-2026-VIP-9941';
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
    ticketNumber,
    event: 'TechConf 2026',
    attendee: 'Marcus Holloway',
    tier: 'Executive VIP All-Access'
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
  console.log('🎫 Registered Marcus Holloway for EXACTLY 1 conference (TechConf 2026)');

  // 9. Create Feedback / Ratings for Completed Workshops
  await db.collection('feedbacks').insertMany([
    {
      event: event1Id,
      user: attendeeId,
      rating: 5,
      comment: 'Exceptional keynote presentations and seamless badge pickup experience. The AI itinerary matching was spot on!',
      isAnonymous: false,
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  console.log('\n========================================');
  console.log('🎉 Database Seeding Complete!');
  console.log('----------------------------------------');
  console.log('Registered Events on Platform: 5 conferences');
  console.log('Marcus Holloway Passes: EXACTLY 1 pass (TechConf 2026)');
  console.log('----------------------------------------');
  console.log('Demo Credentials (All Passwords: DemoPass123!):');
  console.log('• Platform Admin:  admin@eventforge.demo');
  console.log('• Event Organizer: organizer@eventforge.demo');
  console.log('• Door Staff:      staff@eventforge.demo');
  console.log('• Attendee:        attendee@eventforge.demo');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
