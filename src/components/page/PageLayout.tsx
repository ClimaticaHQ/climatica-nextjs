import { DataUpdateProvider } from "@/components/DataUpdate";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/UI";
import { PAGE_LAYOUT_CLASSES as C } from "./page.constant";
import type { TPageLayoutProps } from "./page.type";
import { PageStatus } from "./PageStatus";

/**
 * Every page's frame, in one order: header, controls, the results' status, then the results
 * (summary, main content, details). A block every page shows is added here, once.
 */
export function PageLayout({
  title,
  description,
  controls,
  map,
  state,
  update,
  resultsRef,
  summary,
  main,
  details,
}: TPageLayoutProps) {
  const results = (
    <div ref={resultsRef} data-testid="page-results" className={C.RESULTS}>
      {summary}
      {main}
      <div className={C.DETAILS}>{details}</div>
    </div>
  );

  return (
    <PageWrapper>
      <div className={C.ROOT}>
        <PageHeader title={title} description={description} />
        <div className={C.CONTROLS}>{controls}</div>
        {map}
        <PageStatus state={state} />
        {update ? <DataUpdateProvider {...update}>{results}</DataUpdateProvider> : results}
      </div>
    </PageWrapper>
  );
}
