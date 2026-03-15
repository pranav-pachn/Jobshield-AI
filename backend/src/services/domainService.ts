import threatIntelligenceService from './threatIntelligenceService';

/**
 * Check domain threat level
 */
export async function checkDomain(domain: string) {
  try {
    const threatData = await threatIntelligenceService.checkDomain(domain);
    
    return {
      domain,
      isSuspicious: threatData.isSuspicious,
      threatLevel: threatData.threatLevel,
      score: threatData.score,
      details: threatData.details,
      reason: threatData.threatLevel === 'high' 
        ? 'Domain flagged by threat intelligence' 
        : threatData.threatLevel === 'medium'
        ? 'Domain shows potential risk indicators'
        : 'Domain appears safe',
    };
  } catch (error) {
    console.error('Error checking domain:', error);
    
    // Graceful fallback
    return {
      domain,
      isSuspicious: false,
      threatLevel: 'unknown',
      score: 0,
      details: ['⚠️ Threat intelligence check unavailable - API keys may not be configured'],
      reason: 'Domain verification temporarily unavailable',
    };
  }
}
