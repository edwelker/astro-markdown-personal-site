import { describe, it, expect } from "vitest";
import { getPostHref } from "../src/lib/blog";

describe("Post Navigation Links", () => {
  it("generates UTC-consistent links for previous/next navigation", () => {
    // Testing the specific "danger date" known to shift in local time
    const id = "wing-contest-at-quarry-house.md";
    const date = new Date("2013-05-16T00:00:00Z");
    
    const href = getPostHref(id, date);
    
    // Ensure it points to the 16th, matching the route
    expect(href).toBe("/blog/2013/05/16/wing-contest-at-quarry-house/");
  });
});
