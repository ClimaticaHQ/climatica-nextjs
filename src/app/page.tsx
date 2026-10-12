import { ROUTES } from "@/constants";
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect(ROUTES.CLIMATE_STATISTICS);
}
