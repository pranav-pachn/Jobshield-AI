import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export function useExplainability(id: string) {
  return useQuery({
    queryKey: ['explainability', id],
    queryFn: () => api.get(`/api/investigations/${id}/explanation`),
    enabled: !!id,
  });
}
