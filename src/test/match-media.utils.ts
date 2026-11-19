type MatchMediaMatcher = (query: string) => boolean;

/** Lets tests decide which media queries match; jsdom does not implement `matchMedia`. */
export function stubMatchMedia(matcher: MatchMediaMatcher = () => false): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: matcher(query),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }),
  });
}
