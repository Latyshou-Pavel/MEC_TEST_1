import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../shared/theme/tokens";

type DetailLikeButtonProps = {
  isLiked: boolean;
  likesCount: number;
  disabled?: boolean;
  onPress: () => void;
};

export function DetailLikeButton({
  isLiked,
  likesCount,
  disabled,
  onPress,
}: DetailLikeButtonProps) {
  const buttonScale = useSharedValue(1);
  const countScale = useSharedValue(1);
  const countOpacity = useSharedValue(1);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  const countAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
    opacity: countOpacity.value,
  }));

  useEffect(() => {
    countScale.value = withSequence(
      withTiming(1.16, { duration: 160 }),
      withSpring(1, { damping: 12, stiffness: 180 }),
    );
    countOpacity.value = withSequence(
      withTiming(0.8, { duration: 80 }),
      withTiming(1, { duration: 180 }),
    );
  }, [countOpacity, countScale, likesCount]);

  const handlePress = useCallback(() => {
    if (disabled) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withSpring(0.92, { damping: 12, stiffness: 220 }),
      withSpring(1.04, { damping: 10, stiffness: 170 }),
      withSpring(1, { damping: 12, stiffness: 220 }),
    );
    onPress();
  }, [buttonScale, disabled, onPress]);

  return (
    <Pressable
      accessibilityLabel={isLiked ? "Убрать лайк" : "Поставить лайк"}
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressable,
        disabled && styles.pressableDisabled,
        pressed && !disabled && styles.pressablePressed,
      ]}
    >
      <Animated.View
        style={[
          styles.likeButton,
          isLiked ? styles.likeButtonActive : styles.likeButtonDefault,
          buttonAnimStyle,
        ]}
      >
        <View style={styles.row}>
          <Text
            style={[
              styles.likeTextBase,
              isLiked ? styles.likeTextActive : styles.likeTextDefault,
            ]}
          >
            {isLiked ? "♥" : "♡"}
          </Text>
          <Animated.View style={[styles.likeCountWrap, countAnimStyle]}>
            <Text
              style={[
                styles.likeTextBase,
                isLiked ? styles.likeTextActive : styles.likeTextDefault,
              ]}
            >
              {likesCount}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: "flex-start",
  },
  pressableDisabled: {
    opacity: 0.5,
  },
  pressablePressed: {
    opacity: 0.9,
  },
  likeButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  likeButtonDefault: {
    backgroundColor: colors.reaction.defaultBackground,
  },
  likeButtonActive: {
    backgroundColor: colors.reaction.activeBackground,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  likeTextBase: {
    fontFamily: typography.reactionCount.fontFamily,
    fontSize: typography.reactionCount.fontSize,
    lineHeight: typography.reactionCount.lineHeight,
    fontWeight: typography.reactionCount.fontWeight,
  },
  likeTextDefault: {
    color: colors.reaction.defaultContent,
  },
  likeTextActive: {
    color: colors.reaction.activeContent,
  },
  likeCountWrap: {
    minWidth: 20,
  },
});
