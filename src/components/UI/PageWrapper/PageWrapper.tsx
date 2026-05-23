import type { PageWrapperProps } from "./PageWrapper.type";

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={["px-10 xl:px-26 py-6 w-full", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
