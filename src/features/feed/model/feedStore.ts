import { makeAutoObservable } from "mobx";
import type { Post } from "../../../entities/post/model/types";

class FeedStore {
  posts: Post[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setPosts(posts: Post[]) {
    this.posts = posts;
  }

  reset() {
    this.posts = [];
  }
}

export const feedStore = new FeedStore();
