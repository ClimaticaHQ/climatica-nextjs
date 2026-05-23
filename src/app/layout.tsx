import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import "@/styles/global.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Climatica",
  description: "Climate data visualization",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')`,
          }}
        />
      </head>
      <body>
        <Providers>
          <Layout>{props.children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
