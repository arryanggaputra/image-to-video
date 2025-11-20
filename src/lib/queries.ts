import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type NewDomain } from "./api";

// Query keys
export const queryKeys = {
  domains: ["domains"] as const,
  domain: (id: number) => ["domains", id] as const,
  products: ["products"] as const,
  product: (id: number) => ["products", id] as const,
  productVideo: (id: number) => ["products", id, "video"] as const,
  productDailymotion: (id: number) => ["products", id, "dailymotion"] as const,
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

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => apiClient.deleteProduct(productId),
    onSuccess: () => {
      // Invalidate products list to remove deleted item
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      // Also invalidate domains to update product counts
      queryClient.invalidateQueries({ queryKey: queryKeys.domains });
      // Invalidate domain-with-products queries to refetch product lists
      queryClient.invalidateQueries({
        queryKey: ["domain-with-products"],
        exact: false,
      });
    },
  });
}

// Dailymotion publishing mutations
export function usePublishToDailymotionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      apiClient.publishToDailymotion(productId),
    onSuccess: (_, productId) => {
      // Invalidate product Dailymotion status
      queryClient.invalidateQueries({
        queryKey: queryKeys.productDailymotion(productId),
      });
      // Invalidate products list to update status
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      // Invalidate domain-with-products queries
      queryClient.invalidateQueries({
        queryKey: ["domain-with-products"],
        exact: false,
      });
    },
  });
}

export function useDailymotionStatusQuery(
  productId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.productDailymotion(productId),
    queryFn: () => apiClient.getDailymotionStatus(productId),
    enabled: enabled && !!productId,
    refetchInterval: (data) => {
      // Auto-refresh every 10 seconds if publishing
      if (data?.state?.data?.dailymotionStatus === "publishing") {
        return 10000;
      }
      return false;
    },
  });
}
