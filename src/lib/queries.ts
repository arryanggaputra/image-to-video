import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type Domain, type NewDomain } from "./api";

// Query keys
export const queryKeys = {
  domains: ["domains"] as const,
  domain: (id: number) => ["domains", id] as const,
  products: ["products"] as const,
  product: (id: number) => ["products", id] as const,
  productVideo: (id: number) => ["products", id, "video"] as const,
};

// Queries
export function useDomainsQuery() {
  return useQuery({
    queryKey: queryKeys.domains,
    queryFn: () => apiClient.getDomains(),
  });
}

export function useDomainQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.domain(id),
    queryFn: () => apiClient.getDomain(id),
    enabled: !!id,
  });
}

// Mutations
export function useCreateDomainMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain: NewDomain) => apiClient.createDomain(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains });
    },
  });
}

export function useUpdateDomainMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, domain }: { id: number; domain: Partial<NewDomain> }) =>
      apiClient.updateDomain(id, domain),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains });
      queryClient.setQueryData(queryKeys.domain(data.id), data);
    },
  });
}

export function useDeleteDomainMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains });
    },
  });
}

// Video generation mutations
export function useGenerateVideoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => apiClient.generateVideo(productId),
    onSuccess: (_, productId) => {
      // Invalidate product video status
      queryClient.invalidateQueries({
        queryKey: queryKeys.productVideo(productId),
      });
      // Invalidate products list to update status
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useVideoStatusQuery(
  productId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.productVideo(productId),
    queryFn: () => apiClient.getVideoStatus(productId),
    enabled: enabled && !!productId,
    refetchInterval: (data) => {
      // Auto-refresh every 10 seconds if video is processing
      if (data?.state?.data?.videoStatus === "processing") {
        return 10000;
      }
      return false;
    },
  });
}
