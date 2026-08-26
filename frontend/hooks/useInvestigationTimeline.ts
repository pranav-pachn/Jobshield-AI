import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export function useInvestigationTimeline(id: string) {
  return useQuery({
    queryKey: ['timeline', id],
    queryFn: () => api.get(`/api/investigations/${id}/timeline`),
    enabled: !!id,
  });
}
