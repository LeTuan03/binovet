import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  /** optional accent fragment rendered in the brand color after the title */
  accent?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
  theme?: 'light' | 'dark';
  /** show the diamond divider above the title */
  divider?: boolean;
  className?: string;
  /** tailwind size classes for the title, override if needed */
  titleClassName?: string;
}

/**
 * Editorial section heading — the site's signature title block:
 * a tracked eyebrow with a leading rule, a serif display title with an
 * optional brand-colored accent, an optional diamond divider and subtitle.
 * Pure presentational, server-component safe.
 */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  subtitle,
  align = 'left',
  theme = 'light',
  divider = false,
  className = '',
  titleClassName = 'text-3xl sm:text-4xl lg:text-5xl',
}: SectionHeadingProps) {
  const centered = align === 'center';
  const dark = theme === 'dark';

  return (
    <div
      className={`${centered ? 'text-center mx-auto flex flex-col items-center' : ''} ${className}`}
    >
      {divider && (
        <div className={`divider-diamond mb-6 ${centered ? '' : 'justify-start [&::before]:hidden'}`}>
          <span />
        </div>
      )}

      {eyebrow && (
        <span className={`eyebrow ${centered ? 'eyebrow--center' : ''} ${dark ? 'text-secondary' : 'text-secondary'} mb-5`}>
          {eyebrow}
        </span>
      )}

      <h2
        className={`font-display font-semibold leading-[1.1] tracking-tight ${titleClassName} ${
          dark ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
        {accent && (
          <>
            {' '}
            <span className="text-primary italic">{accent}</span>
          </>
        )}
      </h2>

      {subtitle && (
        <p
          className={`mt-5 text-base sm:text-lg leading-relaxed max-w-2xl ${centered ? 'mx-auto' : ''} ${
            dark ? 'text-white/70!' : 'text-ink-soft!'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
