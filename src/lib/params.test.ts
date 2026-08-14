import { firstParam } from "@/lib/params";

describe("firstParam", () => {
  test("returns the first element when given an array", () => {
    expect(firstParam(["a", "b"])).toBe("a");
  });

  test("returns the string unchanged when given a single string", () => {
    expect(firstParam("solo")).toBe("solo");
  });

  test("returns undefined unchanged when given undefined", () => {
    expect(firstParam(undefined)).toBeUndefined();
  });

  test("returns undefined when given an empty array", () => {
    expect(firstParam([])).toBeUndefined();
  });
});
