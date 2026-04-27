import * as Haptics from "expo-haptics";
import React, { type ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  CommentIcon,
  DollarSignIcon,
  LikeActiveIcon,
  LikeDefaultIcon,
} from "../../../shared/ui/icons/FeedIcons";
import {
  colors,
  radius,
  sizes,
  spacing,
  typography,
} from "../../../shared/theme/tokens";
import type { Post } from "../model/types";

export const POST_MODE = {
  FEED: "feed",
  DETAIL: "detail",
} as const;

type PostMode = (typeof POST_MODE)[keyof typeof POST_MODE];

type PostContentBlockProps = {
  post: Post;
  mode: PostMode;
  footer?: ReactNode;
  onLikePress?: () => void;
  likePressDisabled?: boolean;
  children?: ReactNode;
};

type PostReactionsRowProps = {
  post: Post;
  likeInteractive: boolean;
  onLikePress?: () => void;
  likePressDisabled?: boolean;
};

function PostReactionsRow({
  post,
  likeInteractive,
  onLikePress,
  likePressDisabled,
}: PostReactionsRowProps) {
  const likeChipStyles = [
    styles.reactionChipBase,
    post.isLiked ? styles.likeChipActive : styles.likeChipDefault,
  ];
  const likeTextStyles = [
    styles.reactionTextBase,
    post.isLiked ? styles.likeTextActive : styles.likeTextDefault,
  ];

  const likeInner = (
    <>
      <View style={styles.reactionIconSlot}>
        {post.isLiked ? (
          <LikeActiveIcon color={colors.reaction.activeContent} />
        ) : (
          <LikeDefaultIcon color={colors.reaction.defaultContent} />
        )}
      </View>
      <Text style={likeTextStyles}>{post.likesCount}</Text>
    </>
  );

  return (
    <View style={styles.metaRow}>
      {likeInteractive ? (
        <Pressable
          accessibilityLabel={post.isLiked ? "Убрать лайк" : "Поставить лайк"}
          onPress={() => {
            if (likePressDisabled) {
              return;
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onLikePress?.();
          }}
          disabled={likePressDisabled}
          style={({ pressed }) => [
            ...likeChipStyles,
            likePressDisabled && styles.likePressDisabled,
            !likePressDisabled && pressed && styles.likePressPressed,
          ]}
        >
          {likeInner}
        </Pressable>
      ) : (
        <View style={likeChipStyles}>{likeInner}</View>
      )}
      <View style={[styles.reactionChipBase, styles.commentChip]}>
        <View style={styles.reactionIconSlot}>
          <CommentIcon color={colors.reaction.defaultContent} />
        </View>
        <Text style={[styles.reactionTextBase, styles.chipCountText]}>
          {post.commentsCount}
        </Text>
      </View>
    </View>
  );
}

function resolvePostActionsSection(
  isPaid: boolean,
  mode: PostMode,
  post: Post,
  onLikePress: PostContentBlockProps["onLikePress"],
  likePressDisabled: boolean,
  footer: PostContentBlockProps["footer"],
): ReactNode {
  if (isPaid) {
    return null;
  }
  if (mode === POST_MODE.FEED) {
    return <PostReactionsRow post={post} likeInteractive={false} />;
  }
  if (onLikePress) {
    return (
      <PostReactionsRow
        post={post}
        likeInteractive
        onLikePress={onLikePress}
        likePressDisabled={likePressDisabled}
      />
    );
  }
  return footer ?? null;
}

export function PostContentBlock({
  post,
  mode,
  footer,
  onLikePress,
  likePressDisabled = false,
  children,
}: PostContentBlockProps) {
  const isPaid = post.tier === "paid";
  const mainText =
    mode === POST_MODE.DETAIL ? post.body || post.preview : post.preview;

  const actionsSection = resolvePostActionsSection(
    isPaid,
    mode,
    post,
    onLikePress,
    likePressDisabled,
    footer,
  );

  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
        <Text style={styles.authorName}>{post.author.displayName}</Text>
      </View>

      {!!post.coverUrl && (
        <View style={styles.coverWrapper}>
          <Image
            source={{ uri: post.coverUrl }}
            style={styles.cover}
            resizeMode="cover"
            blurRadius={isPaid ? sizes.post.paidImageBlur : 0}
          />
          {isPaid ? (
            <View style={styles.paidOverlay}>
              <View style={styles.paidIconBox}>
                <DollarSignIcon color={colors.text.inverse} />
              </View>
              <Text style={styles.paidText}>
                Контент скрыт пользователем.{"\n"}Доступ откроется после доната
              </Text>
              <Pressable style={styles.paidButton}>
                <Text style={styles.paidButtonText}>Поддержать</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}

      {isPaid ? (
        <View style={styles.paidTitleSkeleton} />
      ) : (
        <Text style={styles.title}>{post.title}</Text>
      )}

      {isPaid ? (
        <View style={styles.paidPreviewSkeleton} />
      ) : (
        <Text style={styles.mainText}>{mainText}</Text>
      )}

      {actionsSection}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.background.primary,
    borderRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  authorRow: {
    minHeight: sizes.post.authorRowMinHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar / 2,
    backgroundColor: colors.background.avatarPlaceholder,
  },
  authorName: {
    fontFamily: typography.postAuthor.fontFamily,
    fontSize: typography.postAuthor.fontSize,
    lineHeight: typography.postAuthor.lineHeight,
    fontWeight: typography.postAuthor.fontWeight,
    letterSpacing: typography.postAuthor.letterSpacing,
    color: colors.text.primary,
  },
  coverWrapper: {
    alignSelf: "stretch",
    aspectRatio: 1,
    marginHorizontal: -spacing.md,
    borderRadius: 0,
    overflow: "hidden",
  },
  cover: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background.mediaPlaceholder,
  },
  paidOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.paid.overlay,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  paidIconBox: {
    width: sizes.post.paidIconBox,
    height: sizes.post.paidIconBox,
    borderRadius: radius.md,
    backgroundColor: colors.paid.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  paidText: {
    fontFamily: typography.paidDescription.fontFamily,
    fontSize: typography.paidDescription.fontSize,
    lineHeight: typography.paidDescription.lineHeight,
    fontWeight: typography.paidDescription.fontWeight,
    letterSpacing: typography.paidDescription.letterSpacing,
    color: colors.text.primary,
    textAlign: "center",
  },
  paidButton: {
    width: sizes.post.paidButtonWidth,
    height: sizes.post.paidButtonHeight,
    borderRadius: radius.lg,
    backgroundColor: colors.paid.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  paidButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    lineHeight: typography.button.lineHeight,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing,
    color: colors.text.inverse,
  },
  title: {
    minHeight: 26,
    fontFamily: typography.postTitle.fontFamily,
    fontSize: typography.postTitle.fontSize,
    lineHeight: typography.postTitle.lineHeight,
    fontWeight: typography.postTitle.fontWeight,
    letterSpacing: typography.postTitle.letterSpacing,
    color: colors.text.primary,
  },
  mainText: {
    fontFamily: typography.postBody.fontFamily,
    fontSize: typography.postBody.fontSize,
    lineHeight: typography.postBody.lineHeight,
    fontWeight: typography.postBody.fontWeight,
    letterSpacing: typography.postBody.letterSpacing,
    color: colors.text.secondary,
  },
  paidPreviewSkeleton: {
    width: sizes.post.paidPreviewWidth,
    height: sizes.post.paidPreviewHeight,
    borderRadius: radius.xxl,
    backgroundColor: colors.background.skeleton,
    alignSelf: "flex-start",
  },
  paidTitleSkeleton: {
    width: sizes.post.paidTitleWidth,
    height: sizes.post.paidTitleHeight,
    borderRadius: radius.xxl,
    backgroundColor: colors.background.skeleton,
    alignSelf: "flex-start",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  reactionChipBase: {
    minWidth: sizes.post.reactionChipMinWidth,
    height: sizes.post.reactionChipHeight,
    borderRadius: radius.pill,
    paddingVertical: sizes.post.reactionChipPaddingVertical,
    paddingHorizontal: sizes.post.reactionChipPaddingHorizontal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
  },
  reactionIconSlot: {
    width: sizes.post.reactionIconSlot,
    alignItems: "center",
    justifyContent: "center",
  },
  likeChipDefault: {
    backgroundColor: colors.reaction.defaultBackground,
  },
  likeChipActive: {
    backgroundColor: colors.reaction.activeBackground,
  },
  commentChip: {
    backgroundColor: colors.reaction.defaultBackground,
  },
  reactionTextBase: {
    fontFamily: typography.reactionCount.fontFamily,
    fontSize: typography.reactionCount.fontSize,
    lineHeight: typography.reactionCount.lineHeight,
    fontWeight: typography.reactionCount.fontWeight,
    letterSpacing: typography.reactionCount.letterSpacing,
    includeFontPadding: false,
  },
  likeTextDefault: {
    color: colors.reaction.defaultContent,
  },
  likeTextActive: {
    color: colors.reaction.activeContent,
  },
  chipCountText: {
    color: colors.reaction.defaultContent,
  },
  likePressDisabled: {
    opacity: 0.5,
  },
  likePressPressed: {
    opacity: 0.88,
  },
});
