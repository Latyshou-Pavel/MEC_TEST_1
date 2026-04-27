import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import type { Tier } from "../entities/post/model/types";
import { useFeedInfiniteQuery } from "../features/feed/model/useFeedInfiniteQuery";
import { feedStore } from "../features/feed/model/feedStore";
import { FeedErrorState } from "../features/feed/ui/FeedErrorState";
import { ROUTES } from "../app/navigation/routes";
import type { RootStackParamList } from "../app/navigation/types";
import {
  colors,
  radius,
  sizes,
  spacing,
  typography,
} from "../shared/theme/tokens";
import {
  POST_MODE,
  PostContentBlock,
} from "../entities/post/ui/PostContentBlock";

type FeedFilter = {
  key: "all" | Tier;
  label: string;
  tier?: Tier;
};

const FEED_FILTERS: FeedFilter[] = [
  { key: "all", label: "Все" },
  { key: "free", label: "Бесплатные", tier: "free" },
  { key: "paid", label: "Платные", tier: "paid" },
];

export const FeedScreen = observer(() => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState<FeedFilter>(
    FEED_FILTERS[0],
  );
  const [isUserRefreshing, setIsUserRefreshing] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const listRef = useRef<FlatList<(typeof feedStore.posts)[number]>>(null);
  const {
    posts,
    isLoading,
    isError,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useFeedInfiniteQuery({ tier: selectedFilter.tier });

  useEffect(() => {
    feedStore.setPosts(posts);
  }, [posts]);

  const onListRefresh = useCallback(() => {
    setIsUserRefreshing(true);
    refetch().finally(() => {
      setIsUserRefreshing(false);
    });
  }, [refetch]);

  const listContentStyle = useMemo(
    () => [
      styles.contentContainer,
      {
        paddingTop: 0,
        paddingBottom: insets.bottom + spacing.sm,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      },
    ],
    [insets],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) {
      return;
    }

    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  const handleScroll = useCallback((offsetY: number) => {
    const shouldShow = offsetY > 600;
    setShowScrollTopButton((prev) => (prev === shouldShow ? prev : shouldShow));
  }, []);

  const handleScrollTopPress = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  if (isError && feedStore.posts.length === 0) {
    return (
      <View
        style={[
          styles.fullScreen,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: colors.background.secondary,
          },
        ]}
      >
        <FeedErrorState onRetry={() => refetch()} isLoading={isFetching} />
      </View>
    );
  }

  const listEmptyMinHeight = Math.max(
    sizes.feed.listEmptyStateMinHeight,
    windowHeight * sizes.feed.listEmptyStateViewportHeightFraction,
  );

  return (
    <View style={styles.fullScreen}>
      <FlatList
        ref={listRef}
        data={feedStore.posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={listContentStyle}
        style={styles.list}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
            <View style={styles.filtersRow}>
              <View style={styles.filterTrack}>
                {FEED_FILTERS.map((filter, index) => {
                  const isActive = filter.key === selectedFilter.key;
                  const isFirst = index === 0;
                  const isLast = index === FEED_FILTERS.length - 1;

                  return (
                    <Pressable
                      key={filter.key}
                      onPress={() => setSelectedFilter(filter)}
                      style={({ pressed }) => [
                        styles.filterSegment,
                        isActive && styles.filterSegmentActive,
                        isActive && styles.filterSegmentActiveOverBorder,
                        isActive &&
                          isFirst &&
                          styles.filterSegmentActiveOverStart,
                        isActive && isLast && styles.filterSegmentActiveOverEnd,
                        pressed &&
                          isActive &&
                          styles.filterSegmentActivePressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterSegmentText,
                          isActive && styles.filterSegmentTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isPaidPost = item.tier === "paid";
          const block = <PostContentBlock post={item} mode={POST_MODE.FEED} />;
          if (isPaidPost) {
            return block;
          }
          return (
            <Pressable
              onPress={() =>
                navigation.navigate(ROUTES.POST_DETAIL, { postId: item.id })
              }
            >
              {block}
            </Pressable>
          );
        }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isUserRefreshing}
            onRefresh={onListRefresh}
          />
        }
        ListEmptyComponent={
          isLoading && !isError ? (
            <View
              style={[styles.listLoading, { minHeight: listEmptyMinHeight }]}
            >
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <Text style={styles.emptyText}>Публикаций пока нет</Text>
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
      {showScrollTopButton ? (
        <Pressable
          onPress={handleScrollTopPress}
          style={[
            styles.scrollTopButton,
            {
              bottom: insets.bottom + spacing.lg,
              right: insets.right + spacing.md,
            },
          ]}
        >
          <Text style={styles.scrollTopButtonText}>↑ Наверх</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background.secondary,
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
  contentContainer: {
    gap: spacing.md,
    flexGrow: 1,
    backgroundColor: colors.background.secondary,
  },
  filtersRow: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    paddingBottom: spacing.xs,
  },
  stickyHeader: {
    backgroundColor: colors.background.secondary,
  },
  filterTrack: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    maxWidth: sizes.feed.filterTrackMaxWidth,
    height: sizes.feed.filterTrackHeight,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.feed.filterTrackBorder,
    backgroundColor: colors.background.primary,
    overflow: "visible",
  },
  filterSegment: {
    flex: 1,
    minWidth: 0,
    height: sizes.feed.filterTrackHeight,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterSegmentActive: {
    backgroundColor: colors.button.primary,
    borderRadius: radius.xxl,
  },
  filterSegmentActiveOverBorder: {
    marginTop: -1,
    marginBottom: -1,
    zIndex: 1,
    elevation: 2,
  },
  filterSegmentActiveOverStart: {
    marginLeft: -1,
  },
  filterSegmentActiveOverEnd: {
    marginRight: -1,
  },
  filterSegmentActivePressed: {
    opacity: 0.92,
  },
  filterSegmentText: {
    ...typography.feedFilterTab,
    color: colors.feed.filterInactiveText,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  filterSegmentTextActive: {
    ...typography.feedFilterTabActive,
    color: colors.text.inverse,
  },
  listLoading: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.tertiary,
    marginTop: spacing.xl,
  },
  footer: {
    paddingVertical: spacing.sm,
  },
});
