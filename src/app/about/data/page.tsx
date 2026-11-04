import { DataPage as DataPageContent } from "@/components/info";
import { ROUTES } from "@/constants";
import { createInfoPageMetadata } from "@/utils";

export const generateMetadata = createInfoPageMetadata("data", ROUTES.ABOUT_DATA);

export default function DataMethodsPage() {
  return <DataPageContent />;
}
