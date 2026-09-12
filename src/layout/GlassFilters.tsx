/**
 * The refraction half of the glass chrome, as two SVG filters.
 *
 * `backdrop-filter: blur()` gives frosted glass. What makes Apple's Liquid Glass
 * read as *glass* is that content bends at the edges, and CSS has no function for
 * that — it takes an SVG `feDisplacementMap` driven by a gradient image, applied
 * as `backdrop-filter: url(#…)`.
 *
 * Three things here were each learned by rendering and looking, not reasoning:
 *
 * - **Everything lives inside the filter.** Chromium, given
 *   `url(#f) blur(9px) saturate(1.7)`, applies the url and silently drops the
 *   functions after it — the bar came out bent but sharp. So blur, saturation
 *   and brightness are primitives in the graph and the CSS is `url()` alone.
 * - **The filter region is larger than the element.** A blur primitive fades to
 *   transparent at the region edge, which put a dark band along the bar. Growing
 *   the region moves that edge off-screen; the maps are sized to the region.
 * - **`color-interpolation-filters="sRGB"` is mandatory.** The default is
 *   linearRGB, in which the map's neutral grey (128) reads as 0.22 rather than
 *   0.5, and the whole backdrop shifts seven pixels.
 *
 * Only Chromium engines run SVG filters in backdrop-filter. WebKit parses the
 * declaration, reports `CSS.supports()` true, and renders nothing — so support
 * cannot be detected in CSS. index.html adds `.glass-refract` to <html> when
 * `navigator.userAgentData` exists, which only Chromium implements; Header.css
 * and SearchFab.css apply the url() under that class and plain blur otherwise.
 */
const map = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const gradient = (axis: 'x' | 'y', stops: [number, string][]) =>
  map(
    `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><linearGradient id='g' x1='0' y1='0' x2='${axis === 'x' ? 1 : 0}' y2='${axis === 'y' ? 1 : 0}'>` +
      stops.map(([o, c]) => `<stop offset='${o}' stop-color='${c}'/>`).join('') +
      `</linearGradient></defs><rect width='64' height='64' fill='url(#g)'/></svg>`,
  );

// feDisplacementMap moves each backdrop pixel by (R − 0.5, G − 0.5) × scale, so
// rgb(128,128,·) is "leave it", and a ramp is a bend.

// The bar: R pinned — it is full-width, and a sideways bend would sample
// off-screen. G ramps only across the bottom edge, where content passes under.
// The region is 1.8× the bar's height starting 40% above it, so the bar itself
// occupies 22%–78%: the ramp runs from ~60% of the bar to its bottom.
const BAR_MAP = gradient('y', [
  [0, 'rgb(128,128,0)'],
  [0.55, 'rgb(128,128,0)'],
  [0.78, 'rgb(128,255,0)'],
  [1, 'rgb(128,255,0)'],
]);
// The lens: full-range on both axes is a uniform bend; a negative scale on the
// displacement turns that into magnification.
const H_MAP = gradient('x', [[0, '#000'], [1, '#fff']]);
const V_MAP = gradient('y', [[0, '#000'], [1, '#fff']]);

const Tone = ({ saturate, brighten }: { saturate: number; brighten: number }) => (
  <>
    <feColorMatrix type="saturate" values={String(saturate)} result="s" />
    <feComponentTransfer in="s">
      <feFuncR type="linear" slope={brighten} />
      <feFuncG type="linear" slope={brighten} />
      <feFuncB type="linear" slope={brighten} />
    </feComponentTransfer>
  </>
);

function GlassFilters() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <filter id="glass-bar" x="-6%" y="-40%" width="112%" height="180%" colorInterpolationFilters="sRGB">
        <feImage href={BAR_MAP} x="-6%" y="-40%" width="112%" height="180%" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={26} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation={9} result="b" />
        <Tone saturate={1.75} brighten={1.06} />
      </filter>
      <filter id="glass-lens" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feImage href={H_MAP} x="-20%" y="-20%" width="140%" height="140%" preserveAspectRatio="none" result="h" />
        <feImage href={V_MAP} x="-20%" y="-20%" width="140%" height="140%" preserveAspectRatio="none" result="v" />
        <feColorMatrix in="h" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1" result="r" />
        <feColorMatrix in="v" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1" result="g" />
        <feComposite in="r" in2="g" operator="arithmetic" k2={1} k3={1} result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={-30} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation={5} result="b" />
        <Tone saturate={1.9} brighten={1.1} />
      </filter>
    </svg>
  );
}

export default GlassFilters;
