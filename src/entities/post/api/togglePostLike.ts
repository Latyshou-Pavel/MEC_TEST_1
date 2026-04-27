import { apiRequest } from "../../../shared/api/client";
import type { LikeResponse } from "../model/types";

export async function togglePostLike(postId: string) {
  return apiRequest<LikeResponse>(`/posts/${postId}/like`, {
    method: "POST",
  });
}
