export const normalizeIndicator = (type: string, value: string): string => {
  if (!value) return "";
  
  let normalized = value.trim();
  
  switch (type) {
    case "EMAIL":
      normalized = normalized.toLowerCase();
      break;
      
    case "DOMAIN":
      normalized = normalized
        .toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, "") // Remove http://, https://, and www.
        .split("/")[0]; // Remove path
      break;
      
    case "PHONE":
      // Keep only digits and '+' for E.164 format
      normalized = normalized.replace(/[^\d+]/g, "");
      // If no '+' but starts with country code or is long, try to normalize (simplified for now)
      if (!normalized.startsWith("+") && normalized.length > 10) {
        normalized = "+" + normalized;
      }
      break;
      
    case "TELEGRAM":
      normalized = normalized.toLowerCase().replace(/^@/, "");
      break;
      
    case "WHATSAPP":
      // Similar to phone
      normalized = normalized.replace(/[^\d+]/g, "");
      if (!normalized.startsWith("+") && normalized.length > 10) {
        normalized = "+" + normalized;
      }
      break;
      
    case "SCAM_PHRASE":
      // Lowercase, trim extra spaces
      normalized = normalized.toLowerCase().replace(/\s+/g, " ");
      break;
      
    case "COMPANY":
      // Lowercase, trim extra spaces, remove legal suffixes common in normalization
      normalized = normalized
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/\b(inc|llc|ltd|corp|corporation)\b\.?/g, "")
        .trim();
      break;
      
    default:
      normalized = normalized.toLowerCase();
  }
  
  return normalized;
};
