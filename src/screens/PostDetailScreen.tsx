import React, { useCallback, useMemo, useRef, useState } from "react";
import type { ImageStyle } from "react-native";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  POST_MODE,
  PostContentBlock,
} from "../entities/post/ui/PostContentBlock";
import { SendCommentIcon } from "../shared/ui/icons/FeedIcons";
import type { RootStackParamList } from "../navigation/types";
import { useAddCommentMutation } from "../features/post-detail/model/useAddCommentMutation";
import { usePostCommentsInfiniteQuery } from "../features/post-detail/model/usePostCommentsInfiniteQuery";
import { usePostDetailQuery } from "../features/post-detail/model/usePostDetailQuery";
import { useToggleLikeMutation } from "../features/post-detail/model/useToggleLikeMutation";
import { DetailLikeButton } from "../features/post-detail/ui/DetailLikeButton";
import { formatCommentsCountRu } from "../shared/lib/pluralizeRu";
import {
  colors,
  radius,
  sizes,
  spacing,
  typography,
} from "../shared/theme/tokens";

type PostDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PostDetail"
>;

type CommentSortOrder = "newest" | "oldest";

const commentAvatarImageStyle: ImageStyle = {
  width: sizes.avatar,
  height: sizes.avatar,
  borderRadius: sizes.avatar / 2,
  backgroundColor: colors.background.avatarPlaceholder,
};

export function PostDetailScreen({ route }: PostDetailScreenProps) {
  const { postId } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [commentText, setCommentText] = useState("");
  const [composerHeight, setComposerHeight] = useState(0);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [commentSortOrder, setCommentSortOrder] =
    useState<CommentSortOrder>("newest");
  const listRef = useRef<FlatList>(null);

  const {
    data: postData,
    isLoading: isPostLoading,
    refetch: refetchPost,
  } = usePostDetailQuery(postId);
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch: refetchComments,
  } = usePostCommentsInfiniteQuery(postId);
  const { mutateAsync: toggleLike, isPending: isToggleLikePending } =
    useToggleLikeMutation();
  const { mutateAsync: addComment, isPending: isAddCommentPending } =
    useAddCommentMutation();

  const comments = useMemo(
    () => commentsData?.pages.flatMap((page) => page.data.comments) ?? [],
    [commentsData],
  );
  const sortedComments = useMemo(() => {
    const nextComments = [...comments];
    nextComments.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return commentSortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
    return nextComments;
  }, [commentSortOrder, comments]);
  const post = postData?.data.post;

  const contentStyle = useMemo(
    () => [
      styles.contentContainer,
      {
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingTop: spacing.md,
        paddingBottom: insets.bottom + composerHeight + spacing.md,
      },
    ],
    [composerHeight, insets.bottom, insets.left, insets.right],
  );

  const handleLikePress = async () => {
    if (!post || isToggleLikePending) {
      return;
    }

    await toggleLike(post.id);
    await refetchPost();
  };

  const handleSendComment = async () => {
    const trimmedText = commentText.trim();

    if (!trimmedText || isAddCommentPending) {
      return;
    }

    await addComment({ postId, text: trimmedText });
    setCommentText("");
    await refetchComments();
    await refetchPost();
  };

  const isCommentInputFilled = commentText.trim().length > 0;
  const isSendDisabled = !isCommentInputFilled || isAddCommentPending;
  const handleScroll = useCallback((offsetY: number) => {
    const shouldShow = offsetY > 600;
    setShowScrollTopButton((prev) => (prev === shouldShow ? prev : shouldShow));
  }, []);
  const handleScrollTopPress = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);
  const toggleCommentSortOrder = useCallback(() => {
    setCommentSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  }, []);

  if (isPostLoading || !post) {
    return (
      <View
        style={[
          styles.centered,
          {
            paddingBottom: insets.bottom,
            backgroundColor: colors.background.secondary,
          },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      <FlatList
        ref={listRef}
        contentContainerStyle={contentStyle}
        data={sortedComments}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.postHeader}>
            <PostContentBlock
              post={post}
              mode={POST_MODE.DETAIL}
              footer={
                <DetailLikeButton
                  isLiked={Boolean(post.isLiked)}
                  likesCount={post.likesCount}
                  disabled={isToggleLikePending}
                  onPress={() => handleLikePress()}
                />
              }
            >
              <View style={styles.commentsHeadingRow}>
                <Text style={styles.commentsTitle}>
                  {formatCommentsCountRu(post.commentsCount)}
                </Text>
                <Pressable onPress={toggleCommentSortOrder}>
                  <Text style={styles.commentsSortText}>
                    {commentSortOrder === "newest"
                      ? "Сначала новые"
                      : "Сначала старые"}
                  </Text>
                </Pressable>
              </View>
            </PostContentBlock>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <View style={styles.commentAuthorRow}>
              <Image
                source={{ uri: item.author.avatarUrl }}
                style={commentAvatarImageStyle}
              />
              <View>
                <Text style={styles.commentAuthorName}>
                  {item.author.displayName}
                </Text>
                <Text style={styles.commentMessage}>{item.text}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          isCommentsLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator />
            </View>
          ) : (
            <Text style={styles.emptyText}>Комментариев пока нет</Text>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
      <View
        onLayout={(event) => {
          const nextHeight = Math.round(event.nativeEvent.layout.height);
          setComposerHeight((currentHeight) =>
            currentHeight === nextHeight ? currentHeight : nextHeight,
          );
        }}
        style={[
          styles.composerContainer,
          {
            paddingBottom: spacing.xs,
            paddingLeft: insets.left + spacing.md,
            paddingRight: insets.right + spacing.md,
          },
        ]}
      >
        <View style={styles.inputRow}>
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Ваш комментарий"
            placeholderTextColor={colors.text.tertiary}
            style={styles.input}
          />
          <Pressable
            onPress={() => handleSendComment()}
            style={styles.sendButton}
            disabled={isSendDisabled}
            accessibilityRole="button"
            accessibilityLabel="Отправить комментарий"
          >
            <SendCommentIcon
              color={
                isCommentInputFilled
                  ? colors.button.primary
                  : colors.button.disabled
              }
            />
          </Pressable>
        </View>
      </View>
      {showScrollTopButton ? (
        <Pressable
          onPress={handleScrollTopPress}
          style={[
            styles.scrollTopButton,
            {
              right: insets.right + spacing.md,
              bottom: composerHeight + spacing.lg,
            },
          ]}
        >
          <Text style={styles.scrollTopButtonText}>↑ Наверх</Text>
        </Pressable>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  contentContainer: {
    gap: 0,
  },
  postHeader: {
    gap: spacing.md,
  },
  commentsHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  commentsTitle: {
    fontFamily: typography.postAuthor.fontFamily,
    fontSize: typography.postAuthor.fontSize,
    lineHeight: typography.postAuthor.lineHeight,
    fontWeight: typography.reactionCount.fontWeight,
    color: colors.text.quaternary,
  },
  commentsSortText: {
    fontFamily: typography.postBody.fontFamily,
    fontSize: typography.postBody.fontSize,
    lineHeight: typography.postBody.lineHeight,
    fontWeight: typography.postBody.fontWeight,
    color: colors.button.primary,
  },
  commentCard: {
    borderRadius: radius.md,
    backgroundColor: colors.background.primary,
    padding: spacing.sm,
    gap: spacing.md,
  },
  commentAuthorRow: {
    minHeight: sizes.post.authorRowMinHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  commentAuthorName: {
    fontFamily: typography.postAuthor.fontFamily,
    fontSize: typography.postAuthor.fontSize,
    lineHeight: typography.postAuthor.lineHeight,
    fontWeight: typography.postAuthor.fontWeight,
    letterSpacing: typography.postAuthor.letterSpacing,
    color: colors.text.primary,
  },
  commentMessage: {
    fontFamily: typography.commentMessage.fontFamily,
    fontSize: typography.commentMessage.fontSize,
    lineHeight: typography.commentMessage.lineHeight,
    fontWeight: typography.commentMessage.fontWeight,
    letterSpacing: typography.commentMessage.letterSpacing,
    color: colors.text.secondary,
    fontVariant: ["lining-nums", "tabular-nums"],
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.tertiary,
    marginVertical: spacing.md,
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  composerContainer: {
    borderTopWidth: sizes.postDetail.composerBorderTopWidth,
    borderTopColor: colors.feed.filterTrackBorder,
    backgroundColor: colors.background.primary,
    paddingTop: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.postDetail.composerInputRowGap,
  },
  input: {
    flex: 1,
    height: sizes.postDetail.composerInputHeight,
    borderRadius: sizes.postDetail.composerInputRadius,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: sizes.postDetail.composerInputPaddingVertical,
    borderWidth: sizes.postDetail.composerInputBorderWidth,
    borderColor: colors.reaction.defaultBackground,
    color: colors.text.primary,
  },
  sendButton: {
    width: sizes.postDetail.sendIconWidth,
    height: sizes.postDetail.sendIconHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollTopButton: {
    position: "absolute",
    borderRadius: radius.pill,
    backgroundColor: colors.button.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scrollTopButtonText: {
    color: colors.text.inverse,
    fontFamily: typography.button.fontFamily,
    fontSize: typography.reactionCount.fontSize,
    lineHeight: typography.reactionCount.lineHeight,
    fontWeight: typography.button.fontWeight,
  },
});
