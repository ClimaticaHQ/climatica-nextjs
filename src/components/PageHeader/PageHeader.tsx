import { PAGE_HEADER_CLASSES as C } from "./PageHeader.constant";
import type { TPageHeaderProps } from "./PageHeader.type";

/**
 * A page's header — the only one: its title (the navbar's name for it) and, optionally, a
 * one-line description. The text follows the locale, hence suppressHydrationWarning.
 */
export function PageHeader({ title, description }: TPageHeaderProps) {
  return (
    <header className={C.ROOT}>
      <h1 className={C.TITLE} suppressHydrationWarning>
        {title}
      </h1>
      {description !== undefined && (
        <p className={C.DESCRIPTION} suppressHydrationWarning>
          {description}
        </p>
      )}
    </header>
  );
}
