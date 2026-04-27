import { apiRequest } from "../../../shared/api/client";
import type { CommentsResponse } from "../model/types";

type GetPostCommentsParams = {
  postId: string;
  cursor?: string;
  limit?: number;
};

export async function getPostComments({
  postId,
  cursor,
  limit = 20,
}: GetPostCommentsParams) {
  return apiRequest<CommentsResponse>(`/posts/${postId}/comments`, {
    method: "GET",
    query: {
      cursor,
      limit,
    },
  });
}
