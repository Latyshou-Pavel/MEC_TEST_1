import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostComments } from "../../../entities/post/api/getPostComments";

export function usePostCommentsInfiniteQuery(postId: string) {
  return useInfiniteQuery({
    queryKey: ["post-comments", postId],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getPostComments({
        postId,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: Boolean(postId),
  });
}
