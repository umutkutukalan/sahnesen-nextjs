import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPostsService } from "@/services/client/post.service";
import { PostResponse } from "@/services/server/post.service";

export const useGetUserPosts = (username: string) => {
  const query = useInfiniteQuery({
    queryKey: ["userPosts", username],
    queryFn: async ({ pageParam = 0 }) => {
      return await getUserPostsService(username, pageParam, 5);
    },
    // Spring Boot Page objesindeki 'last', 'number' ve 'totalPages' alanlarına göre sonraki sayfayı belirliyoruz
    getNextPageParam: (lastPage) => {
      // Eğer son sayfadaysak veya veri kalmadıysa undefined dönerek sonraki sayfayı kilitliyoruz
      if (
        !lastPage ||
        lastPage.last ||
        lastPage.number + 1 >= lastPage.totalPages
      ) {
        return undefined;
      }
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    enabled: !!username, // Username doluysa isteği tetikle
  });

  // Gelen tüm sayfaların (pages) 'content' dizilerini tek bir düz diziye birleştiriyoruz
  const userPosts: PostResponse[] =
    query.data?.pages.flatMap((page) => page.content || []) ?? [];

  return {
    userPosts,
    isLoading: query.isLoading, // İlk açılış / Skeleton yükleme durumu
    isFetchingNextPage: query.isFetchingNextPage, // Alt buton / Infinite scroll yükleme durumu
    hasNextPage: query.hasNextPage, // Sonraki sayfa var mı?
    loadMoreUserPosts: query.fetchNextPage, // Sonraki sayfayı tetikleyen fonksiyon
    isError: query.isError,
    error: query.error,
    refetch: query.refetch, // İstenirse listeyi yenilemek için
  };
};
