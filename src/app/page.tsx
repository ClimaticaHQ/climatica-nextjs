import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/climate-statistics/search");
}
