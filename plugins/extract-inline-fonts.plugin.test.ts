import { extractInlineFonts } from "./extract-inline-fonts.plugin";

describe("extractInlineFonts", () => {
  const data = Buffer.from("font-bytes").toString("base64");

  it("replaces font data URIs with file references and returns the files", () => {
    const { css, fonts } = extractInlineFonts(
      `@font-face{src:url(data:font/ttf;base64,${data}) format("truetype")}`,
    );
    expect(css).not.toContain("data:font");
    expect(css).toMatch(/url\(\/assets\/fonts\/font-[0-9a-f]{10}\.ttf\) format/);
    expect(fonts).toHaveLength(1);
    expect(fonts[0]?.source.toString()).toBe("font-bytes");
  });

  it("deduplicates identical fonts and leaves other URLs alone", () => {
    const { css, fonts } = extractInlineFonts(
      `a{src:url(data:font/woff2;base64,${data})}b{src:url("data:font/woff2;base64,${data}")}c{background:url(data:image/png;base64,AAAA)}`,
    );
    expect(fonts).toHaveLength(1);
    expect(css).toContain("url(data:image/png;base64,AAAA)");
  });
});
