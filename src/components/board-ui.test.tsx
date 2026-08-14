import { render, screen } from "@testing-library/react-native";

import { Avatar, LabelPill, ProgressBar, SFIcon } from "@/components/board-ui";
import { labelColor } from "@/lib/board-types";

type JsonNode = {
  type: string;
  props: Record<string, unknown>;
  children: unknown;
};

/** Depth-first search over an RNTL toJSON() tree for the first node matching `predicate`. */
function findNode(
  node: JsonNode | null,
  predicate: (n: JsonNode) => boolean
): JsonNode | null {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  const children = Array.isArray(node.children) ? node.children : [];
  for (const child of children) {
    if (child && typeof child === "object") {
      const found = findNode(child as JsonNode, predicate);
      if (found) return found;
    }
  }
  return null;
}

describe("SFIcon", () => {
  test("renders the requested symbol name with the given size/color", async () => {
    await render(
      <SFIcon name={"star.fill" as never} size={20} color="#123456" />
    );
    const icon = screen.getByText("star.fill");
    expect(icon.props.style).toMatchObject({ fontSize: 20, color: "#123456" });
  });
});

describe("LabelPill", () => {
  test("renders the label text in its deterministic color", async () => {
    await render(<LabelPill label="Design" />);
    const text = screen.getByText("Design");
    const c = labelColor("Design");
    expect(text.props.style).toMatchObject({ color: c.fg });
  });
});

describe("Avatar", () => {
  test("renders an image sized as a circle from the given size", async () => {
    const view = await render(
      <Avatar uri="https://example.com/a.png" size={40} />
    );
    const image = findNode(
      view.toJSON() as JsonNode,
      (n) => n.type === "Image"
    );
    expect(image?.props.style).toMatchObject({
      width: 40,
      height: 40,
      borderRadius: 20,
    });
    expect(image?.props.source).toEqual({ uri: "https://example.com/a.png" });
  });
});

describe("ProgressBar", () => {
  test("fills to a width percentage matching the value prop", async () => {
    const view = await render(
      <ProgressBar value={0.5} color="#ff0000" width={60} />
    );
    const fill = findNode(
      view.toJSON() as JsonNode,
      (n) =>
        typeof (n.props.style as { backgroundColor?: string })
          ?.backgroundColor === "string"
    );
    expect(fill?.props.style).toMatchObject({
      width: "50%",
      backgroundColor: "#ff0000",
    });
  });

  test("rounds fractional percentages", async () => {
    const view = await render(<ProgressBar value={0.333} />);
    const fill = findNode(
      view.toJSON() as JsonNode,
      (n) => typeof (n.props.style as { width?: string })?.width === "string"
    );
    expect(fill?.props.style).toMatchObject({ width: "33%" });
  });
});
