import { Fragment, type CSSProperties } from 'react';

interface CategoryMarqueeProps {
  /** Labels to scroll across the ticker (already localized). */
  items: string[];
  /** Seconds for one full loop — lower is faster. */
  speed?: number;
}

/**
 * Seamless horizontal "ticker" of product-line labels, shown beneath the hero.
 * Pure CSS animation (no JS) so it stays a Server Component; the set is rendered
 * twice and translated -50% for a gap-free loop, and pauses on hover. The speed
 * is passed as the `--marquee-duration` CSS variable (the `.animate-marquee`
 * class falls back to 30s if it is ever missing, so it always animates).
 */
export default function CategoryMarquee({ items, speed = 30 }: CategoryMarqueeProps) {
  if (!items.length) return null;

  return (
    <div className="marquee-wrapper w-full overflow-hidden bg-primary py-3 select-none border-y border-white/10">
      <div
        className="animate-marquee flex w-max items-center whitespace-nowrap"
        style={{ '--marquee-duration': `${speed}s` } as CSSProperties}
      >
        {/* Two identical sets so the -50% translate loops without a gap */}
        {[0, 1].map((set) => (
          <span key={set} className="flex items-center gap-8 pr-8" aria-hidden={set === 1}>
            {items.map((label) => (
              <Fragment key={label}>
                <span className="font-montserrat text-white font-bold text-sm tracking-[0.18em] uppercase">
                  {label}
                </span>
                <span className="text-secondary text-xs">◆</span>
              </Fragment>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
