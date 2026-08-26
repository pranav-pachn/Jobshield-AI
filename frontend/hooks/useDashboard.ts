import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useIntelligence } from './useIntelligence';

export function useRecentAnalyses(limit: number = 5) {
  return useQuery({
    queryKey: ['analyses', 'recent', limit],
    queryFn: () => api.get(`/api/jobs/recent?limit=${limit}`),
  });
}

export function useDashboard() {
  const intelligence = useIntelligence();
  const recentAnalyses = useRecentAnalyses(5);

  return {
    intelligence: intelligence,
    recentAnalyses: recentAnalyses.data,
    isLoading: intelligence.isLoading || recentAnalyses.isLoading,
    error: intelligence.error || recentAnalyses.error,
  };
}
