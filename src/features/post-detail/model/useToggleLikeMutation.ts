import { useMutation } from "@tanstack/react-query";
import { togglePostLike } from "../../../entities/post/api/togglePostLike";

export function useToggleLikeMutation() {
  return useMutation({
    mutationFn: (postId: string) => togglePostLike(postId),
  });
}
