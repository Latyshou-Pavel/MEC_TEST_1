import { useMutation } from "@tanstack/react-query";
import { togglePostLike } from "../api/togglePostLike";

export function useToggleLikeMutation() {
  return useMutation({
    mutationFn: (postId: string) => togglePostLike(postId),
  });
}
