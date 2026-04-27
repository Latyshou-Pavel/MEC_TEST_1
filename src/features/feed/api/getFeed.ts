import { apiRequest } from "../../../shared/api/client";
import type { PostsResponse, Tier } from "../../../entities/post/model/types";

type GetFeedParams = {
  cursor?: string;
  limit?: number;
  tier?: Tier;
  simulateError?: boolean;
};

export async function getFeed(params: GetFeedParams = {}) {
  const { cursor, limit = 10, tier, simulateError } = params;

  return apiRequest<PostsResponse>("/posts", {
    method: "GET",
    query: {
      cursor,
      limit,
      tier,
      simulate_error: simulateError,
    },
  });
}
