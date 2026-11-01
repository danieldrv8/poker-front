import type { CSSProperties } from 'react'

type ChipSize = 'sm' | 'md' | 'lg'

/** Compact visual chip stack; height scales with stack size. */
export function ChipStack({
  amount,
  size = 'sm',
  className = '',
}: {
  amount: number
  size?: ChipSize
  className?: string
}) {
  const discs =
    amount <= 0
      ? 0
      : amount < 250
        ? 2
        : amount < 750
          ? 3
          : amount < 1500
            ? 4
            : 5

  if (discs === 0) {
    return (
      <span
        className={`chip-stack chip-stack--${size} chip-stack--empty ${className}`.trim()}
        aria-hidden
      >
        <span className="chip-stack__disc chip-stack__disc--ghost" />
      </span>
    )
  }

  return (
    <span className={`chip-stack chip-stack--${size} ${className}`.trim()} aria-hidden>
      {Array.from({ length: discs }, (_, i) => (
        <span
          key={i}
          className={`chip-stack__disc chip-stack__disc--${i % 3}`}
          style={{ '--i': i } as CSSProperties}
        />
      ))}
    </span>
  )
}
