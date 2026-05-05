import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getFeed } from "../api/getFeed";
import type { Post, Tier } from "../../../entities/post/model/types";

type UseFeedInfiniteQueryParams = {
  limit?: number;
  tier?: Tier;
};

export function useFeedInfiniteQuery({
  limit = 10,
  tier,
}: UseFeedInfiniteQueryParams = {}) {
  const query = useInfiniteQuery({
    queryKey: ["feed", { limit, tier }],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getFeed({
        cursor: pageParam,
        limit,
        tier,
      }),
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  });

  const posts = useMemo<Post[]>(
    () => query.data?.pages.flatMap((page) => page.data.posts) ?? [],
    [query.data],
  );

  return {
    ...query,
    posts,
  };
}
