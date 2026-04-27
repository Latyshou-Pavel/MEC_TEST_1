import { useMutation } from "@tanstack/react-query";
import { addPostComment } from "../../../entities/post/api/addPostComment";

type AddCommentPayload = {
  postId: string;
  text: string;
};

export function useAddCommentMutation() {
  return useMutation({
    mutationFn: (payload: AddCommentPayload) => addPostComment(payload),
  });
}
