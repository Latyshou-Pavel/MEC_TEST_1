import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../../../entities/post/api/getPostById";

export function usePostDetailQuery(postId: string) {
  return useQuery({
    queryKey: ["post-detail", postId],
    queryFn: () => getPostById(postId),
    enabled: Boolean(postId),
  });
}
