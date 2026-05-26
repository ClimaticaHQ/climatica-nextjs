import { APP_TITLE } from "@/constants";
import { AppLayout } from "@/layouts";
import "@/styles/global.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "Climate data visualization",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppLayout>{props.children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
