export function buildPartnerRegistrationPayload(form, options = {}) {
  const {
    planName = 'partner',
    status = 'pending',
    primaryColor = '#5b5df0',
    adminCreated = false,
  } = options;

  const fullName = `${form.firstName || ''} ${form.lastName || ''}`.trim();

  return {
    type: 'partner',
    companyName: String(form.businessName || '').trim(),
    fullName,
    email: String(form.email || '').trim().toLowerCase(),
    phone: String(form.phone || '').trim(),
    password: form.password,
    primaryColor,
    plan_name: planName,
    status,
    onboarding: {
      country: form.country,
      partnerType: form.partnerType,
      website: form.website || null,
      social: form.social || null,
      activity: form.activity,
      hasClients: form.hasClients,
      clientCount: form.clientCount,
      crmExperience: form.crmExperience,
      ghlExperience: form.ghlExperience,
      experienceLevel: form.experienceLevel,
      goals: form.goals || [],
      targetClients: form.targetClients,
      targetMarket: form.targetMarket,
      estimatedClients: form.estimatedClients,
      source: form.source,
      referralCode: form.referralCode || null,
      acceptances: adminCreated
        ? {
            truthfulInformation: true,
            acceptedTerms: true,
            understoodTransactionFees: true,
            acceptedPrivacy: true,
            adminCreated: true,
          }
        : {
            truthfulInformation: form.truth,
            acceptedTerms: form.terms,
            understoodTransactionFees: form.fees,
            acceptedPrivacy: form.privacy,
          },
      termsVersion: 'NOVO-PARTNERS-1.0',
      privacyVersion: 'NOVO-PRIVACY-1.0',
      acceptedAt: new Date().toISOString(),
    },
  };
}
