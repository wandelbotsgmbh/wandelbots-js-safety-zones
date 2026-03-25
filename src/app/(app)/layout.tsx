import { Inter } from "next/font/google";
import "./globals.css";
import { getExposedRuntimeEnv } from "../../runtimeEnv.ts";
import { ClientLayout } from "./ClientLayout.tsx";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout env={getExposedRuntimeEnv()}>{children}</ClientLayout>
      </body>
    </html>
  );
}
