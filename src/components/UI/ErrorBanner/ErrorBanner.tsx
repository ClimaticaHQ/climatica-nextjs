import type { TErrorBannerProps } from "./ErrorBanner.type";

export function ErrorBanner({ message }: TErrorBannerProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-center text-[var(--color-error)]">
      {message}
    </div>
  );
}
