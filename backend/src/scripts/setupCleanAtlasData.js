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

async function setupCleanAtlasData() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  await connectDb();
  console.log('✅ Connected to MongoDB Atlas.');

  console.log('🧹 Purging all existing collections for clean state...');
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
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
    Inquiry.deleteMany({})
  ]);
  console.log('✨ All old data cleared.');

  const defaultPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Create Organization
  console.log('🏢 Creating Flagship Organization...');
  const org = await Organization.create({
    name: 'Apex Horizon Summits',
    slug: 'apex-horizon-summits',
    contactEmail: 'contact@apexhorizon.com',
    settings: {
      aiProvider: 'auto',
      allowWaitlist: true,
      requireApproval: false
    }
  });

  // 2. Create Exactly 1 Person Per Role
  console.log('👥 Creating Exactly One Person Per Role...');
  const [adminUser, organizerUser, staffUser, attendeeUser] = await Promise.all([
    User.create({
      name: 'Platform Super Admin',
      email: 'admin@eventforge.com',
      passwordHash,
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE'
    }),
    User.create({
      name: 'Elena Rostova',
      email: 'organizer@eventforge.com',
      passwordHash,
      role: 'ORGANIZER',
      organization: org._id,
      status: 'ACTIVE'
    }),
    User.create({
      name: 'David Miller',
      email: 'staff@eventforge.com',
      passwordHash,
      role: 'STAFF',
      organization: org._id,
      status: 'ACTIVE'
    }),
    User.create({
      name: 'Marcus Vance',
      email: 'attendee@eventforge.com',
      passwordHash,
      role: 'ATTENDEE',
      status: 'ACTIVE'
    })
  ]);

  console.log(`👤 Admin: ${adminUser.email} (PLATFORM_ADMIN)`);
  console.log(`👤 Organizer: ${organizerUser.email} (ORGANIZER)`);
  console.log(`👤 Staff: ${staffUser.email} (STAFF)`);
  console.log(`👤 Attendee: ${attendeeUser.email} (ATTENDEE)`);

  // 3. Create Exactly 3 Premier Conferences
  console.log('🎪 Provisioning Exactly 3 Premier Conferences in Atlas...');

  const now = new Date();
  
  // Conference 1: Global AI & Autonomous Systems Summit 2026
  const event1Start = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
  const event1End = new Date(event1Start.getTime() + 3 * 24 * 60 * 60 * 1000); // 3-day summit

  const event1 = await Event.create({
    organization: org._id,
    organizer: organizerUser._id,
    title: 'Global AI & Autonomous Systems Summit 2026',
    slug: 'global-ai-summit-2026',
    category: 'Technology',
    eventType: 'Hybrid Conference',
    description: 'The definitive executive assembly for frontier artificial intelligence, agentic workflows, LLM infrastructure, and autonomous robotics.',
    shortDescription: 'Frontier AI, agentic systems, and high-scale LLM architectures.',
    tagline: 'Architecting the Autonomous Intelligence Frontier',
    highlights: [
      '50+ Global Keynotes from Frontier AI Labs',
      'Hands-on Multi-Agent Workflow Architectures',
      'Exclusive VIP Networking & Executive Roundtable Dinner'
    ],
    tags: ['AI', 'Agentic Systems', 'Machine Learning', 'Autonomous Intelligence'],
    startDate: event1Start,
    endDate: event1End,
    venue: {
      name: 'Grand Hyatt Convention Center',
      address: '345 Stockton St, San Francisco, CA 94108'
    },
    capacity: 1200,
    status: 'PUBLISHED'
  });

  // Ticket categories for Event 1
  const [e1CatVip, e1CatGen, e1CatVirtual] = await Promise.all([
    TicketCategory.create({
      event: event1._id,
      name: 'Executive VIP All-Access Pass',
      description: 'Full 3-day access, VIP lounge, Speaker Dinner, and fast-track check-in.',
      price: 799,
      capacity: 200,
      availableQuantity: 199
    }),
    TicketCategory.create({
      event: event1._id,
      name: 'General Delegate Pass',
      description: 'Access to all keynote stages, exhibition hall, and digital session recordings.',
      price: 299,
      capacity: 800,
      availableQuantity: 800
    }),
    TicketCategory.create({
      event: event1._id,
      name: 'Virtual Live Stream Pass',
      description: 'HD interactive streaming access and AI session summaries.',
      price: 99,
      capacity: 200,
      availableQuantity: 200
    })
  ]);

  // Sessions for Event 1
  await Promise.all([
    Session.create({
      event: event1._id,
      title: 'Opening Keynote: Autonomous Multi-Agent Swarms in Enterprise Production',
      description: 'Deep dive into orchestrating hundreds of cooperative LLM agents in mission-critical environments.',
      room: 'Grand Ballroom A',
      startTime: new Date(event1Start.getTime() + 9 * 60 * 60 * 1000), // Day 1 9:00 AM
      endTime: new Date(event1Start.getTime() + 10.5 * 60 * 60 * 1000),
      capacity: 1200,
      category: 'Keynote',
      tags: ['Multi-Agent', 'Enterprise AI']
    }),
    Session.create({
      event: event1._id,
      title: 'Technical Masterclass: Quantum-Accelerated Deep Learning & Neural Inference',
      description: 'Exploring hybridized quantum-classical hardware pipelines for next-generation foundation models.',
      room: 'Innovation Stage 2',
      startTime: new Date(event1Start.getTime() + 11 * 60 * 60 * 1000),
      endTime: new Date(event1Start.getTime() + 12.5 * 60 * 60 * 1000),
      capacity: 400,
      category: 'Technical Workshop',
      tags: ['Quantum AI', 'Inference']
    }),
    Session.create({
      event: event1._id,
      title: 'Executive Panel: Global AI Governance, Alignment & Safety Protocols',
      description: 'Policy leaders and chief scientists debate safety boundaries, IP provenance, and regulatory compliance.',
      room: 'Executive Council Room',
      startTime: new Date(event1Start.getTime() + 14 * 60 * 60 * 1000),
      endTime: new Date(event1Start.getTime() + 15.5 * 60 * 60 * 1000),
      capacity: 350,
      category: 'Panel Discussion',
      tags: ['Governance', 'Safety']
    })
  ]);

  // Assign Door Staff to Event 1
  await EventStaff.create({
    event: event1._id,
    user: staffUser._id,
    role: 'CHECK_IN'
  });

  // Register Attendee Marcus Vance for Event 1 with active QR Ticket
  const reg1 = await Registration.create({
    event: event1._id,
    attendee: attendeeUser._id,
    ticketCategory: e1CatVip._id,
    registrationStatus: 'CONFIRMED',
    amount: 799
  });

  const ticketNumber = `EF-2026-AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await Ticket.create({
    registration: reg1._id,
    ticketNumber,
    qrCode: `EVENTFORGE:${event1._id}:${reg1._id}:${ticketNumber}`,
    status: 'ACTIVE'
  });

  // Conference 2: FinTech & Sovereign Digital Assets World Congress
  const event2Start = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000); // 28 days from now
  const event2End = new Date(event2Start.getTime() + 2 * 24 * 60 * 60 * 1000);

  const event2 = await Event.create({
    organization: org._id,
    organizer: organizerUser._id,
    title: 'FinTech & Sovereign Digital Assets World Congress',
    slug: 'fintech-digital-assets-2026',
    category: 'Finance',
    eventType: 'In-Person Summit',
    description: 'The preeminent global congress for institutional decentralized finance, central bank digital currencies (CBDC), and cryptographic settlement rails.',
    shortDescription: 'Institutional DeFi, CBDCs, and real-time cross-border settlement.',
    tagline: 'The Next Trillion-Dollar Financial Architecture',
    highlights: [
      'Institutional Treasury & Asset Tokenization Frameworks',
      'Zero-Knowledge Proofs for Banking Privacy & Compliance',
      'Global Central Bank & FinTech Regulatory Forum'
    ],
    tags: ['FinTech', 'DeFi', 'Digital Assets', 'Banking'],
    startDate: event2Start,
    endDate: event2End,
    venue: {
      name: 'Marina Bay Sands Expo Center',
      address: '10 Bayfront Ave, Singapore 018956'
    },
    capacity: 850,
    status: 'PUBLISHED'
  });

  await Promise.all([
    TicketCategory.create({
      event: event2._id,
      name: 'Institutional Executive Pass',
      description: 'Access to institutional symposium, deal rooms, and networking receptions.',
      price: 899,
      capacity: 250,
      availableQuantity: 250
    }),
    TicketCategory.create({
      event: event2._id,
      name: 'Standard Industry Delegate',
      description: 'Full 2-day conference hall access and keynote stages.',
      price: 349,
      capacity: 600,
      availableQuantity: 600
    })
  ]);

  await Promise.all([
    Session.create({
      event: event2._id,
      title: 'Plenary Address: Programmable Sovereign Currencies & Cross-Border Rails',
      description: 'Examining the interplay between wholesale CBDCs and commercial bank tokenized deposits.',
      room: 'Plenary Hall 1',
      startTime: new Date(event2Start.getTime() + 9.5 * 60 * 60 * 1000),
      endTime: new Date(event2Start.getTime() + 11 * 60 * 60 * 1000),
      capacity: 850,
      category: 'Keynote',
      tags: ['CBDC', 'Global Rails']
    }),
    Session.create({
      event: event2._id,
      title: 'Breakout Session: Zero-Knowledge Proofs for Compliant Institutional Privacy',
      description: 'How zk-SNARKs enable regulatory validation without revealing underlying transactional details.',
      room: 'Technical Stage B',
      startTime: new Date(event2Start.getTime() + 13 * 60 * 60 * 1000),
      endTime: new Date(event2Start.getTime() + 14.5 * 60 * 60 * 1000),
      capacity: 350,
      category: 'Breakout',
      tags: ['Zero-Knowledge', 'Compliance']
    })
  ]);

  // Conference 3: NextGen Cloud & Distributed Architectures Expo
  const event3Start = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days from now
  const event3End = new Date(event3Start.getTime() + 2 * 24 * 60 * 60 * 1000);

  const event3 = await Event.create({
    organization: org._id,
    organizer: organizerUser._id,
    title: 'NextGen Cloud & Distributed Architectures Expo',
    slug: 'nextgen-cloud-expo-2026',
    category: 'Cloud & Infrastructure',
    eventType: 'Hybrid Conference',
    description: 'International summit exploring ultra-resilient distributed systems, edge orchestration, Kubernetes at planetary scale, and zero-trust mesh.',
    shortDescription: 'Distributed systems, planetary Kubernetes, and edge orchestration.',
    tagline: 'Engineering Planetary Scale Infrastructure',
    highlights: [
      'Multi-Cloud Disaster Recovery & Chaos Engineering',
      'WebAssembly (WASM) on the Edge Matrix',
      'Zero-Trust Architecture for Cloud-Native Workloads'
    ],
    tags: ['Cloud', 'Kubernetes', 'DevOps', 'Distributed Systems'],
    startDate: event3Start,
    endDate: event3End,
    venue: {
      name: 'ExCeL International Exhibition Centre',
      address: 'Royal Victoria Dock, 1 Western Gateway, London E16 1XL'
    },
    capacity: 1500,
    status: 'PUBLISHED'
  });

  await Promise.all([
    TicketCategory.create({
      event: event3._id,
      name: 'Full Conference & Lab Pass',
      description: 'Access to all keynotes, breakout tracks, and hands-on architecture labs.',
      price: 599,
      capacity: 400,
      availableQuantity: 400
    }),
    TicketCategory.create({
      event: event3._id,
      name: 'Standard Conference Pass',
      description: 'Access to main stages and expo floor.',
      price: 399,
      capacity: 1100,
      availableQuantity: 1100
    })
  ]);

  await Promise.all([
    Session.create({
      event: event3._id,
      title: 'Keynote: Planetary Consensus & Distributed Resilience in High-Velocity Systems',
      description: 'Techniques for surviving complete region failures while maintaining sub-millisecond tail latencies.',
      room: 'Main Arena',
      startTime: new Date(event3Start.getTime() + 9 * 60 * 60 * 1000),
      endTime: new Date(event3Start.getTime() + 10.5 * 60 * 60 * 1000),
      capacity: 1500,
      category: 'Keynote',
      tags: ['Distributed Systems', 'Resilience']
    }),
    Session.create({
      event: event3._id,
      title: 'Hands-On Lab: Zero-Trust Mesh & eBPF Security Observability',
      description: 'Real-time live kernel tracing and cryptographic identity enforcement for microservices.',
      room: 'DevLab 1',
      startTime: new Date(event3Start.getTime() + 11.5 * 60 * 60 * 1000),
      endTime: new Date(event3Start.getTime() + 13.5 * 60 * 60 * 1000),
      capacity: 300,
      category: 'Hands-On Lab',
      tags: ['eBPF', 'Zero-Trust']
    })
  ]);

  console.log('🎉 Setup Complete!');
  console.log('--------------------------------------------------');
  console.log('✅ Exactly ONE user per role:');
  console.log('   1. Super Admin: admin@eventforge.com / Password123!');
  console.log('   2. Organizer:   organizer@eventforge.com / Password123!');
  console.log('   3. Door Staff:  staff@eventforge.com / Password123!');
  console.log('   4. Attendee:    attendee@eventforge.com / Password123!');
  console.log('✅ Exactly THREE published conferences:');
  console.log('   1. Global AI & Autonomous Systems Summit 2026');
  console.log('   2. FinTech & Sovereign Digital Assets World Congress');
  console.log('   3. NextGen Cloud & Distributed Architectures Expo');
  console.log('--------------------------------------------------');
  process.exit(0);
}

setupCleanAtlasData().catch((err) => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
