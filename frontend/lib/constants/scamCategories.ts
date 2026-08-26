export const SCAM_CATEGORIES = {
  PAYMENT_FRAUD: 'Payment Fraud',
  IDENTITY_THEFT: 'Identity Theft',
  PHISHING: 'Phishing',
  FAKE_COMPANY: 'Fake Company',
  MLM: 'Multi-Level Marketing',
  MONEY_MULE: 'Money Mule',
  RESUME_FARMING: 'Resume Farming',
  OTHER: 'Other',
};

export function getScamCategoryLabel(category: string) {
  return SCAM_CATEGORIES[category as keyof typeof SCAM_CATEGORIES] || category;
}
