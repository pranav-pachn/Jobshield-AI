import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export function useInvestigation(id: string) {
  return useQuery({
    queryKey: ['investigation', id],
    queryFn: () => api.get(`/api/investigations/${id}`),
    enabled: !!id,
  });
}
