import type { TPageTitleProps } from "./PageTitle.type";

export function PageTitle({ children, suppressHydrationWarning }: TPageTitleProps) {
  return (
    <h1
      className="mb-2 text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]"
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {children}
    </h1>
  );
}
