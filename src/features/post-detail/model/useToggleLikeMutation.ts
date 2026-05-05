import { useMutation, useQueryClient } from "@tanstack/react-query";
import { togglePostLike } from "../api/togglePostLike";
import type { PostDetailResponse } from "../../../entities/post/model/types";

export function useToggleLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => togglePostLike(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["post-detail", postId] });

      const previous = queryClient.getQueryData<PostDetailResponse>([
        "post-detail",
        postId,
      ]);

      if (previous) {
        const { isLiked, likesCount } = previous.data.post;
        queryClient.setQueryData<PostDetailResponse>(
          ["post-detail", postId],
          {
            ...previous,
            data: {
              post: {
                ...previous.data.post,
                isLiked: !isLiked,
                likesCount: isLiked ? likesCount - 1 : likesCount + 1,
              },
            },
          },
        );
      }

      return { previous, postId };
    },

    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["post-detail", context.postId],
          context.previous,
        );
      }
    },

    onSettled: (_data, _err, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post-detail", postId] });
    },
  });
}
