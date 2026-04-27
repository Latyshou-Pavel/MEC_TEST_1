import { apiRequest } from "../../../shared/api/client";
import type { PostDetailResponse } from "../model/types";

export async function getPostById(postId: string) {
  return apiRequest<PostDetailResponse>(`/posts/${postId}`, {
    method: "GET",
  });
}
