import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export function useIntelligenceOverview() {
  return useQuery({
    queryKey: ['intelligence', 'overview'],
    queryFn: () => api.get('/api/intelligence/overview'),
  });
}

export function useIntelligenceTrends() {
  return useQuery({
    queryKey: ['intelligence', 'trends'],
    queryFn: () => api.get('/api/intelligence/trends'),
  });
}

export function useIntelligenceThreats() {
  return useQuery({
    queryKey: ['intelligence', 'threats'],
    queryFn: () => api.get('/api/intelligence/threats'),
  });
}

export function useIntelligence() {
  const overview = useIntelligenceOverview();
  const trends = useIntelligenceTrends();
  const threats = useIntelligenceThreats();

  return {
    overview: overview.data,
    trends: trends.data,
    threats: threats.data,
    isLoading: overview.isLoading || trends.isLoading || threats.isLoading,
    error: overview.error || trends.error || threats.error,
  };
}
