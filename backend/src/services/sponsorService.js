import { Sponsor, SponsorshipPackage, SponsorDeliverable, Organization } from '../models/index.js';

export const getPackages = async (eventId) => {
  return await SponsorshipPackage.find({ event: eventId });
};

export const createPackage = async (eventId, data) => {
  return await SponsorshipPackage.create({ ...data, event: eventId });
};

export const deletePackage = async (eventId, packageId) => {
  const pkg = await SponsorshipPackage.findOneAndDelete({ _id: packageId, event: eventId });
  if (!pkg) throw new Error('Sponsorship package not found for this event');
  return pkg;
};

export const getSponsors = async (eventId) => {
  return await Sponsor.find({ event: eventId })
    .populate('organization', 'name industry contactEmail')
    .populate('package', 'name price benefits');
};

export const addSponsor = async (eventId, data) => {
  // Verify package belongs to event
  const pkg = await SponsorshipPackage.findOne({ _id: data.packageId, event: eventId });
  if (!pkg) throw new Error('Package does not belong to this event');

  let orgId = data.organizationId;

  if (!orgId && data.companyName) {
    let org = await Organization.findOne({ name: new RegExp(`^${data.companyName.trim()}$`, 'i') });
    if (!org) {
      org = await Organization.create({
        name: data.companyName.trim(),
        contactEmail: data.contactEmail || undefined,
        industry: 'Sponsor Partner'
      });
    }
    orgId = org._id;
  }

  const sponsor = await Sponsor.create({
    event: eventId,
    organization: orgId,
    package: data.packageId,
    status: 'ACTIVE'
  });

  return await Sponsor.findById(sponsor._id)
    .populate('organization', 'name industry contactEmail')
    .populate('package', 'name price benefits');
};

export const removeSponsor = async (eventId, sponsorId) => {
  const sponsor = await Sponsor.findOne({ _id: sponsorId, event: eventId });
  if (!sponsor) throw new Error('Sponsor not found for this event');
  await SponsorDeliverable.deleteMany({ sponsor: sponsorId });
  return await Sponsor.findByIdAndDelete(sponsorId);
};

export const getDeliverables = async (eventId, sponsorId) => {
  const sponsor = await Sponsor.findOne({ _id: sponsorId, event: eventId });
  if (!sponsor) throw new Error('Sponsor not found for this event');
  return await SponsorDeliverable.find({ sponsor: sponsorId });
};

export const createDeliverable = async (eventId, sponsorId, data) => {
  const sponsor = await Sponsor.findOne({ _id: sponsorId, event: eventId });
  if (!sponsor) throw new Error('Sponsor not found for this event');
  return await SponsorDeliverable.create({ ...data, sponsor: sponsorId });
};

export const updateDeliverableStatus = async (eventId, sponsorId, deliverableId, status) => {
  const sponsor = await Sponsor.findOne({ _id: sponsorId, event: eventId });
  if (!sponsor) throw new Error('Sponsor not found for this event');
  const deliv = await SponsorDeliverable.findOne({ _id: deliverableId, sponsor: sponsorId });
  if (!deliv) throw new Error('Deliverable not found for this sponsor');
  deliv.status = status;
  return await deliv.save();
};
