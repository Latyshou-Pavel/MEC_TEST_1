import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useFeedInfiniteQuery } from "../features/feed/model/useFeedInfiniteQuery";
import { feedStore } from "../features/feed/model/feedStore";
import { FeedErrorState } from "../features/feed/ui/FeedErrorState";
import { PostCard } from "../features/feed/ui/PostCard";
import { colors, spacing } from "../shared/theme/tokens";

export const FeedScreen = observer(function FeedScreen() {
  const {
    posts,
    isLoading,
    isError,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
    refetch,
  } = useFeedInfiniteQuery();

  useEffect(() => {
    feedStore.setPosts(posts);
  }, [posts]);

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  if (isError && feedStore.posts.length === 0) {
    return <FeedErrorState onRetry={() => void refetch()} isLoading={isFetching} />;
  }

  if (isLoading && feedStore.posts.length === 0 && !isError) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={feedStore.posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.contentContainer}
      renderItem={({ item }) => <PostCard post={item} />}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
      }
      ListEmptyComponent={<Text style={styles.emptyText}>Публикаций пока нет</Text>}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
});

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.md,
    flexGrow: 1,
    backgroundColor: colors.background.secondary,
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
