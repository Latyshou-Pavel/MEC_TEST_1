import { makeAutoObservable } from "mobx";
import type { Post, Tier } from "../../../entities/post/model/types";

export type FeedFilter = {
  key: "all" | Tier;
  label: string;
  tier?: Tier;
};

export const FEED_FILTERS: FeedFilter[] = [
  { key: "all", label: "Все" },
  { key: "free", label: "Бесплатные", tier: "free" },
  { key: "paid", label: "Платные", tier: "paid" },
];

class FeedStore {
  posts: Post[] = [];
  selectedFilter: FeedFilter = FEED_FILTERS[0];

  constructor() {
    makeAutoObservable(this);
  }

  setPosts(posts: Post[]) {
    this.posts = posts;
  }

  setSelectedFilter(filter: FeedFilter) {
    this.selectedFilter = filter;
  }

  reset() {
    this.posts = [];
    this.selectedFilter = FEED_FILTERS[0];
  }
}

export const feedStore = new FeedStore();
