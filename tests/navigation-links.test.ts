import { describe, it, expect } from "vitest";
import { getPostHref } from "../src/lib/blog";

describe("Post Navigation Links", () => {
  it("generates UTC-consistent links for previous/next navigation", () => {
    // This test ensures that the getPostHref function correctly uses the canonical slug
    const post = {
      data: {
        slug: "2013/05/15/wing-contest-at-quarry-house",
      }
    };
    
    const href = getPostHref(post);
    
    // Ensure it points to the 15th, matching the route
    expect(href).toBe("/blog/2013/05/15/wing-contest-at-quarry-house/");
  });
});
