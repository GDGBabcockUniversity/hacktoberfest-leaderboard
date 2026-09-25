import { describe, it, expect } from "vitest";
import { combinedScore, isBot, isEligiblePr, prPoints, rank } from "./scoring";

describe("scoring", () => {
  it("excludes bots", () => expect(isBot("dependabot[bot]")).toBe(true));
  it("applies label weights", () => {
    expect(prPoints(["intermediate"])).toBe(2);
    expect(prPoints(["hard"])).toBe(3);
  });
  it("uses shared ranks", () =>
    expect(
      rank([{ total: 3 }, { total: 2 }, { total: 2 }, { total: 1 }]).map(
        (x) => x.rank,
      ),
    ).toEqual([1, 2, 2, 4]));
  it("combines scores", () => expect(combinedScore(3, 4, 2, 3)).toBe(18));
  it("includes date window edges", () =>
    expect(
      isEligiblePr(
        { author: "a", labels: [], mergedAt: "2026-10-31T23:59:59.999Z" },
        "2026-10-01",
        "2026-10-31",
      ),
    ).toBe(true));
});
