import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Post } from "../../../entities/post/model/types";
import {
  CommentIcon,
  DollarSignIcon,
  LikeActiveIcon,
  LikeDefaultIcon,
} from "../../../shared/ui/icons/FeedIcons";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../shared/theme/tokens";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const isPaid = post.tier === "paid";
  const likeChipStyles = [
    styles.reactionChipBase,
    post.isLiked ? styles.likeChipActive : styles.likeChipDefault,
  ];
  const likeTextStyles = [
    styles.reactionTextBase,
    post.isLiked ? styles.likeTextActive : styles.likeTextDefault,
  ];

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
            blurRadius={isPaid ? 40 : 0}
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
        <Text style={styles.preview}>{post.preview}</Text>
      )}

      {!isPaid ? (
        <View style={styles.metaRow}>
          <View style={likeChipStyles}>
            <View style={styles.reactionIconSlot}>
              {post.isLiked ? (
                <LikeActiveIcon color={colors.reaction.activeContent} />
              ) : (
                <LikeDefaultIcon color={colors.reaction.defaultContent} />
              )}
            </View>
            <Text style={likeTextStyles}>{post.likesCount}</Text>
          </View>
          <View style={[styles.reactionChipBase, styles.commentChip]}>
            <View style={styles.reactionIconSlot}>
              <CommentIcon color={colors.reaction.defaultContent} />
            </View>
            <Text style={[styles.reactionTextBase, styles.commentText]}>
              {post.commentsCount}
            </Text>
          </View>
        </View>
      ) : null}
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
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    width: 42,
    height: 42,
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
    width: 239,
    height: 42,
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
  preview: {
    fontFamily: typography.postBody.fontFamily,
    fontSize: typography.postBody.fontSize,
    lineHeight: typography.postBody.lineHeight,
    fontWeight: typography.postBody.fontWeight,
    letterSpacing: typography.postBody.letterSpacing,
    color: colors.text.secondary,
  },
  paidPreviewSkeleton: {
    width: 361,
    height: 40,
    borderRadius: 22,
    backgroundColor: colors.background.skeleton,
    alignSelf: "flex-start",
  },
  paidTitleSkeleton: {
    width: 164,
    height: 26,
    borderRadius: 22,
    backgroundColor: colors.background.skeleton,
    alignSelf: "flex-start",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  reactionChipBase: {
    minWidth: 63,
    height: 36,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
  },
  reactionIconSlot: {
    width: 17,
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
  commentText: {
    color: colors.reaction.defaultContent,
  },
});
