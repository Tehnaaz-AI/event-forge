import { Sponsor, SponsorshipPackage, SponsorDeliverable, Organization } from '../models/index.js';

export const getPackages = async (eventId) => {
  return await SponsorshipPackage.find({ event: eventId });
};

export const createPackage = async (eventId, data) => {
  return await SponsorshipPackage.create({ ...data, event: eventId });
};

export const deletePackage = async (packageId) => {
  return await SponsorshipPackage.findByIdAndDelete(packageId);
};

export const getSponsors = async (eventId) => {
  return await Sponsor.find({ event: eventId })
    .populate('organization', 'name industry contactEmail')
    .populate('package', 'name price benefits');
};

export const addSponsor = async (eventId, data) => {
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

export const removeSponsor = async (sponsorId) => {
  await SponsorDeliverable.deleteMany({ sponsor: sponsorId });
  return await Sponsor.findByIdAndDelete(sponsorId);
};

export const getDeliverables = async (sponsorId) => {
  return await SponsorDeliverable.find({ sponsor: sponsorId });
};

export const createDeliverable = async (sponsorId, data) => {
  return await SponsorDeliverable.create({ ...data, sponsor: sponsorId });
};

export const updateDeliverableStatus = async (deliverableId, status) => {
  const deliv = await SponsorDeliverable.findById(deliverableId);
  if (!deliv) throw new Error('Deliverable not found');
  deliv.status = status;
  return await deliv.save();
};
