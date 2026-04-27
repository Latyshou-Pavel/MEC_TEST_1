import React, { PropsWithChildren, useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import {
  connectWs,
  disconnectWs,
  subscribeWsMessages,
} from "../../shared/realtime/wsClient";
import type {
  Comment,
  CommentsResponse,
} from "../../entities/post/model/types";

type WsIncomingMessage = {
  type?: string;
  [key: string]: unknown;
};

type WsLikeUpdatedMessage = WsIncomingMessage & {
  type: "like_updated";
  postId: string;
  likesCount: number;
};

type WsCommentAddedMessage = WsIncomingMessage & {
  type: "comment_added";
  postId: string;
  comment: Comment;
};

export function RealtimeProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncConnectionToAppState = (state: AppStateStatus) => {
      if (state === "active") {
        connectWs();
        return;
      }
      disconnectWs();
    };

    const appStateSub = AppState.addEventListener("change", (next) => {
      syncConnectionToAppState(next);
    });
    syncConnectionToAppState(AppState.currentState);

    const unsubscribe = subscribeWsMessages((message) => {
      const wsMessage = message as WsIncomingMessage;

      switch (wsMessage.type) {
        case "ping":
          if (__DEV__) {
            console.log("[ws] ping");
          }
          return;
        case "like_updated": {
          const likeUpdated = wsMessage as WsLikeUpdatedMessage;
          if (
            !likeUpdated.postId ||
            typeof likeUpdated.likesCount !== "number"
          ) {
            if (__DEV__) {
              console.log("[ws] invalid like_updated payload:", likeUpdated);
            }
            return;
          }

          queryClient.invalidateQueries({
            queryKey: ["post-detail", likeUpdated.postId],
          });
          queryClient.invalidateQueries({
            queryKey: ["feed"],
          });
          if (__DEV__) {
            console.log("[ws] like_updated invalidate:", likeUpdated);
          }
          return;
        }
        case "comment_added": {
          const commentAdded = wsMessage as WsCommentAddedMessage;
          if (
            !commentAdded.postId ||
            !commentAdded.comment ||
            typeof commentAdded.comment.id !== "string"
          ) {
            if (__DEV__) {
              console.log("[ws] invalid comment_added payload:", commentAdded);
            }
            return;
          }

          queryClient.setQueryData<
            InfiniteData<CommentsResponse, string | undefined>
          >(["post-comments", commentAdded.postId], (cached) => {
            if (!cached || cached.pages.length === 0) {
              return cached;
            }
            const commentAlreadyExists = cached.pages.some((page) =>
              page.data.comments.some(
                (comment) => comment.id === commentAdded.comment.id,
              ),
            );
            if (commentAlreadyExists) {
              return cached;
            }

            const [firstPage, ...restPages] = cached.pages;
            return {
              ...cached,
              pages: [
                {
                  ...firstPage,
                  data: {
                    ...firstPage.data,
                    comments: [
                      commentAdded.comment,
                      ...firstPage.data.comments,
                    ],
                  },
                },
                ...restPages,
              ],
            };
          });

          queryClient.invalidateQueries({
            queryKey: ["post-detail", commentAdded.postId],
          });
          queryClient.invalidateQueries({
            queryKey: ["feed"],
          });

          if (__DEV__) {
            console.log("[ws] comment_added applied:", commentAdded);
          }
          return;
        }
        default:
          if (__DEV__) {
            console.log("[ws] unknown event:", wsMessage);
          }
      }
    });

    return () => {
      appStateSub.remove();
      unsubscribe();
      disconnectWs();
    };
  }, [queryClient]);

  return <>{children}</>;
}
