import { apiRequest } from "../../../shared/api/client";
import type { AddCommentResponse } from "../model/types";

type AddPostCommentParams = {
  postId: string;
  text: string;
};

export async function addPostComment({ postId, text }: AddPostCommentParams) {
  return apiRequest<AddCommentResponse>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
