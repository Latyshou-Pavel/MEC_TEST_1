import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPostComment } from "../api/addPostComment";

type AddCommentPayload = {
  postId: string;
  text: string;
};

export function useAddCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCommentPayload) => addPostComment(payload),

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["post-comments", variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["post-detail", variables.postId],
      });
    },
  });
}
