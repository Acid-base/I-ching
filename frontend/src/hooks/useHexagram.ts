import { useQuery } from '@tanstack/react-query';
import { fetchHexagram } from '../services/hexagramService';
import { Hexagram } from '../types/hexagram';

export const useHexagram = (hexagramNumber: number) => {
  return useQuery<Hexagram>({
    queryKey: ['hexagram', hexagramNumber],
    queryFn: () => fetchHexagram(hexagramNumber),
    enabled: !!hexagramNumber && hexagramNumber > 0 && hexagramNumber <= 64,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
