import { createHash } from "node:crypto";
import type { Plugin } from "vite";

const INLINE_FONT = /url\(\s*["']?data:font\/(ttf|woff2?|otf);base64,([A-Za-z0-9+/=]+)["']?\s*\)/g;

/** A font file extracted from a stylesheet. */
export interface ExtractedFont {
  fileName: string;
  source: Buffer;
}

/**
 * Replaces base64 font data URIs in CSS with references to real font files so the page can keep
 * a strict `font-src 'self'` policy and the stylesheet stays small.
 */
export function extractInlineFonts(
  css: string,
  publicBase = "/assets/fonts/",
): { css: string; fonts: ExtractedFont[] } {
  const fonts = new Map<string, ExtractedFont>();
  const output = css.replace(INLINE_FONT, (_match, extension: string, data: string) => {
    const source = Buffer.from(data, "base64");
    const hash = createHash("sha256").update(source).digest("hex").slice(0, 10);
    const fileName = `assets/fonts/font-${hash}.${extension}`;
    fonts.set(fileName, { fileName, source });
    return `url(${publicBase}font-${hash}.${extension})`;
  });
  return { css: output, fonts: [...fonts.values()] };
}

/** Vite plugin applying {@link extractInlineFonts} to the UI library stylesheet during builds. */
export function extractInlineFontsPlugin(): Plugin {
  return {
    name: "extract-inline-fonts",
    apply: "build",
    enforce: "pre",
    transform(code, id) {
      if (!id.split("?")[0]?.endsWith(".css") || !code.includes("data:font/")) return null;
      const { css, fonts } = extractInlineFonts(code);
      for (const font of fonts) {
        this.emitFile({ type: "asset", fileName: font.fileName, source: font.source });
      }
      return { code: css, map: null };
    },
  };
}
