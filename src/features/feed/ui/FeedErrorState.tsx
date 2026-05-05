import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  colors,
  radius,
  sizes,
  spacing,
  typography,
} from "../../../shared/theme/tokens";

type FeedErrorStateProps = {
  onRetry: () => void;
  isLoading?: boolean;
};

export function FeedErrorState({
  onRetry,
  isLoading = false,
}: FeedErrorStateProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/error-sticker/illustration_sticker.png")}
        style={styles.illustration}
      />
      <Text style={styles.message}>Не удалось загрузить публикации</Text>

      <Pressable
        onPress={onRetry}
        style={[styles.button, isLoading && styles.buttonLoading]}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : null}
          <Text style={styles.buttonText}>Повторить</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  message: {
    fontFamily: typography.errorTitle.fontFamily,
    fontSize: typography.errorTitle.fontSize,
    lineHeight: typography.errorTitle.lineHeight,
    fontWeight: typography.errorTitle.fontWeight,
    letterSpacing: typography.errorTitle.letterSpacing,
    color: colors.text.primary,
    textAlign: "center",
  },
  illustration: {
    width: sizes.feed.errorIllustrationSize,
    height: sizes.feed.errorIllustrationSize,
  },
  button: {
    width: sizes.post.paidPreviewWidth,
    height: sizes.post.paidButtonHeight,
    backgroundColor: colors.button.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLoading: {
    width: sizes.post.paidButtonWidth,
    backgroundColor: colors.button.loading,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  buttonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    lineHeight: typography.button.lineHeight,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing,
    color: colors.text.inverse,
  },
});
